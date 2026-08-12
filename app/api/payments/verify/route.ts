import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { notifyCustomerOfKeyDelivery } from "@/lib/purchase-key-alerts";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const reference = request.nextUrl.searchParams.get("reference");
    const orderIdQuery = request.nextUrl.searchParams.get("orderId");

    if (!reference && !orderIdQuery) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_IDENTIFIER",
            message: "Payment reference or orderId is required",
          },
        },
        { status: 400 },
      );
    }

    let resolvedReference = reference;
    let resolvedOrderId = orderIdQuery;

    if (!resolvedReference && resolvedOrderId) {
      const txn = await prisma.transaction.findUnique({
        where: { orderId: resolvedOrderId },
        select: { paystackReference: true },
      });

      resolvedReference = txn?.paystackReference || null;
    }

    if (!resolvedReference) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_REFERENCE",
            message: "No Paystack reference found for this order",
          },
        },
        { status: 400 },
      );
    }

    if (
      typeof resolvedReference !== "string" ||
      resolvedReference.length > 100
    ) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_REFERENCE",
            message: "Valid payment reference is required",
          },
        },
        { status: 400 },
      );
    }

    // Verify with Paystack API
    const paystackVerify = await verifyPaystackTransaction(resolvedReference);

    if (!paystackVerify.status) {
      return NextResponse.json(
        {
          error: {
            code: "VERIFICATION_FAILED",
            message: "Payment verification failed",
          },
        },
        { status: 400 },
      );
    }

    const { status, metadata, paid_at } = paystackVerify.data;
    const orderId =
      (metadata?.orderId as string | undefined) || resolvedOrderId || undefined;

    if (!orderId) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REFERENCE",
            message: "No order associated with this reference",
          },
        },
        { status: 400 },
      );
    }

    // Update MongoDB based on payment status
    if (status === "success") {
      const paidDate = paid_at ? new Date(paid_at) : new Date();

      const currentTransaction = await prisma.transaction.findFirst({
        where: { paystackReference: resolvedReference },
        select: { status: true },
      });

      const wasAlreadySuccessful = currentTransaction?.status === "success";

      await prisma.$transaction([
        prisma.transaction.updateMany({
          where: { paystackReference: resolvedReference },
          data: { status: "success", paidAt: paidDate },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: { status: "completed" },
        }),
      ]);

      // Idempotent fulfillment: only create/update user entitlements on first success transition.
      if (!wasAlreadySuccessful) {
        const orderWithItems = await prisma.order.findUnique({
          where: { id: orderId },
          include: { orderItems: true, user: true },
        });

        if (orderWithItems) {
          const issuedKeyItems: Array<{ gameTitle: string; gameKey: string }> =
            [];

          for (const item of orderWithItems.orderItems) {
            const game = await prisma.game.findUnique({
              where: { id: item.gameId },
              select: { itemType: true, downloadLink: true },
            });

            const isDigitalItem = ["game", "game-key", "disc"].includes(
              game?.itemType || "game",
            );
            const isGameKey = (game?.itemType || "game") === "game-key";
            const assignedKey = isGameKey
              ? (game?.downloadLink || "").trim() || null
              : null;

            await prisma.userGame.upsert({
              where: {
                userId_gameId: {
                  userId: orderWithItems.userId,
                  gameId: item.gameId,
                },
              },
              create: {
                userId: orderWithItems.userId,
                gameId: item.gameId,
                deliveryMethod:
                  orderWithItems.deliveryMethod ||
                  (isDigitalItem ? "digital" : "home"),
                deliveryStatus: isGameKey
                  ? assignedKey
                    ? "delivered"
                    : "pending"
                  : isDigitalItem && game?.downloadLink
                    ? "delivered"
                    : "pending",
                licenseKey: assignedKey,
                purchasedAt: paidDate,
              },
              update: {
                deliveryMethod:
                  orderWithItems.deliveryMethod ||
                  (isDigitalItem ? "digital" : "home"),
                deliveryStatus: isGameKey
                  ? assignedKey
                    ? "delivered"
                    : "pending"
                  : isDigitalItem && game?.downloadLink
                    ? "delivered"
                    : "pending",
                ...(isGameKey ? { licenseKey: assignedKey } : {}),
                purchasedAt: paidDate,
              },
            });

            if (isGameKey && assignedKey) {
              issuedKeyItems.push({
                gameTitle: item.gameTitle,
                gameKey: assignedKey,
              });
            }
          }

          await prisma.userProfile.upsert({
            where: { userId: orderWithItems.userId },
            create: {
              userId: orderWithItems.userId,
              bio: "",
              walletBalance: 0,
              totalSpent: orderWithItems.totalNaira * 100,
              gamesPurchased: orderWithItems.itemsCount,
              country: "NG",
              preferredDeliveryMethod:
                orderWithItems.deliveryMethod || "digital",
            },
            update: {
              totalSpent: { increment: orderWithItems.totalNaira * 100 },
              gamesPurchased: { increment: orderWithItems.itemsCount },
            },
          });

          if (issuedKeyItems.length > 0) {
            void notifyCustomerOfKeyDelivery({
              customerEmail: orderWithItems.customerEmail,
              customerName: orderWithItems.user.name || orderWithItems.customerEmail,
              orderNumber: orderWithItems.orderNumber,
              keyItems: issuedKeyItems,
            }).catch((alertError) => {
              console.error("Purchase key email dispatch failed:", alertError);
            });
          }
        }
      }
    } else if (status === "failed" || status === "abandoned") {
      await prisma.transaction.updateMany({
        where: { paystackReference: resolvedReference },
        data: { status: "failed" },
      });
    }

    // Fetch full order using Prisma
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: { code: "ORDER_NOT_FOUND", message: "Order not found" } },
        { status: 404 },
      );
    }

    const isOwner = token?.id && token.id === order.userId;

    // Map order for backward compatibility with frontend keys
    const transaction = await prisma.transaction.findFirst({
      where: { orderId: order.id },
      select: {
        paystackReference: true,
        paymentMethod: true,
        paidAt: true,
        amountNaira: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const gamesById = new Map(
      (
        await prisma.game.findMany({
          where: { id: { in: order.orderItems.map((item) => item.gameId) } },
          select: { id: true, itemType: true, downloadLink: true },
        })
      ).map((g) => [g.id, g]),
    );

    const userGameByGameId = new Map(
      (
        await prisma.userGame.findMany({
          where: {
            userId: order.userId,
            gameId: { in: order.orderItems.map((item) => item.gameId) },
          },
          select: { gameId: true, licenseKey: true },
        })
      ).map((ug) => [ug.gameId, ug]),
    );

    const deliveryItems = order.orderItems.map((item) => {
      const game = gamesById.get(item.gameId);
      const isDigital = ["game", "game-key", "disc"].includes(
        game?.itemType || "game",
      );
      const isGameKey = (game?.itemType || "game") === "game-key";
      const storedKey = userGameByGameId.get(item.gameId)?.licenseKey || null;
      return {
        game_id: item.gameId,
        game_title: item.gameTitle,
        item_type: game?.itemType || "game",
        is_digital: isDigital,
        download_link: isDigital ? game?.downloadLink || null : null,
        is_game_key: isGameKey,
        game_key: isOwner && isGameKey ? storedKey : null,
      };
    });

    const mappedOrder = {
      ...order,
      order_items: order.orderItems.map((item) => ({
        id: item.id,
        order_id: item.orderId,
        game_id: item.gameId,
        game_title: item.gameTitle,
        price_at_purchase: item.priceAtPurchase,
        created_at: item.createdAt,
      })),
      order_number: order.orderNumber,
      items_count: order.itemsCount,
      subtotal_naira: order.subtotalNaira,
      transaction_fee_naira: order.transactionFeeNaira,
      total_naira: order.totalNaira,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      customer_whatsapp: order.customerWhatsapp,
      delivery_method: order.deliveryMethod,
      delivery_address: order.deliveryAddress,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
      receipt: {
        reference: transaction?.paystackReference || resolvedReference,
        payment_method: transaction?.paymentMethod || "paystack",
        amount_naira: transaction?.amountNaira || order.totalNaira,
        payment_status: transaction?.status || status,
        paid_at: transaction?.paidAt || null,
      },
      delivery_summary: {
        method: order.deliveryMethod,
        items: deliveryItems,
      },
    };

    if (status === "success") {
      return NextResponse.json({
        data: { paymentStatus: status, order: mappedOrder },
      });
    } else {
      return NextResponse.json(
        {
          error: {
            code: "PAYMENT_FAILED",
            message: `Payment ${status}. Please try again.`,
          },
          data: { paymentStatus: status, order: mappedOrder },
        },
        { status: 402 },
      );
    }
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("transaction_not_found") ||
        error.message.includes("Paystack verification error 400"))
    ) {
      return NextResponse.json(
        {
          error: {
            code: "VERIFICATION_FAILED",
            message: "Payment reference not found or invalid",
          },
        },
        { status: 400 },
      );
    }

    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Verification failed. Please contact support.",
        },
      },
      { status: 500 },
    );
  }
}
