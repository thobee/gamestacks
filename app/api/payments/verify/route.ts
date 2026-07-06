import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get("reference");

    if (!reference || typeof reference !== "string" || reference.length > 100) {
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
    const paystackVerify = await verifyPaystackTransaction(reference);

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
    const orderId = metadata?.orderId as string | undefined;

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

      await prisma.$transaction([
        prisma.transaction.updateMany({
          where: { paystackReference: reference },
          data: { status: "success", paidAt: paidDate },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: { status: "completed" },
        }),
      ]);
    } else if (status === "failed" || status === "abandoned") {
      await prisma.transaction.updateMany({
        where: { paystackReference: reference },
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

    // Map order for backward compatibility with frontend keys
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
    };

    if (status === "success") {
      return NextResponse.json({ data: { paymentStatus: status, order: mappedOrder } });
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
