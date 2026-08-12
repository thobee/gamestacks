import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { convertToKobo } from "@/lib/utils";
import {
  initializePaystackTransaction,
  generateOrderNumber,
  generatePaystackReference,
} from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    // ── NextAuth Auth check ──────────────────────────────────────────────────
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "You must be logged in to complete a purchase",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      items,
      customerEmail,
      customerFullName,
      customerWhatsapp,
      deliveryMethod,
      deliveryAddress,
      customerPhone,
      notes,
    } = body;

    // ── Input validation ────────────────────────────────────────────────────
    if (
      !items?.length ||
      !customerEmail ||
      !customerFullName ||
      !deliveryMethod
    ) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_FIELDS",
            message:
              "Full name, email, delivery method, and items are required",
          },
        },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json(
        { error: { code: "INVALID_EMAIL", message: "Invalid email address" } },
        { status: 422 },
      );
    }

    if (!["digital", "home"].includes(deliveryMethod)) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DELIVERY",
            message: "deliveryMethod must be 'digital' or 'home'",
          },
        },
        { status: 422 },
      );
    }

    // Validate gameIds are strings
    const gameIds: string[] = items.map(
      (item: { gameId: string }) => item.gameId,
    );
    if (!gameIds.every((id) => typeof id === "string" && id.length > 0)) {
      return NextResponse.json(
        { error: { code: "INVALID_ITEMS", message: "Invalid game IDs" } },
        { status: 422 },
      );
    }

    // ── Fetch authoritative prices from DB (never trust client prices) ──────
    const games = await prisma.game.findMany({
      where: {
        id: { in: gameIds },
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      select: {
        id: true,
        title: true,
        priceNaira: true,
        salePrice: true,
        isPublished: true,
      },
    });

    if (!games?.length || games.length !== gameIds.length) {
      return NextResponse.json(
        {
          error: {
            code: "GAMES_NOT_FOUND",
            message: "One or more games not found",
          },
        },
        { status: 404 },
      );
    }

    const unavailable = games.filter((g) => !g.isPublished);
    if (unavailable.length) {
      return NextResponse.json(
        {
          error: {
            code: "GAMES_UNAVAILABLE",
            message: `Game(s) not available: ${unavailable.map((g) => g.title).join(", ")}`,
          },
        },
        { status: 400 },
      );
    }

    // ── Calculate totals server-side ────────────────────────────────────────
    const subtotalNaira = games.reduce(
      (sum, g) => sum + (g.salePrice ?? g.priceNaira),
      0,
    );
    const transactionFeeNaira = 0;
    const totalNaira = subtotalNaira + transactionFeeNaira;

    if (totalNaira <= 0) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_AMOUNT",
            message: "Order total must be greater than 0",
          },
        },
        { status: 400 },
      );
    }

    const orderNumber = generateOrderNumber();
    const paystackReference = generatePaystackReference();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const userIdStr = token.id as string;

    // ── Create order & order items using nested Prisma writes ───────────────
    const order = await prisma.order.create({
      data: {
        userId: userIdStr,
        orderNumber,
        itemsCount: games.length,
        subtotalNaira,
        transactionFeeNaira,
        totalNaira,
        customerEmail,
        customerPhone: customerPhone || null,
        customerWhatsapp: customerWhatsapp || null,
        deliveryMethod,
        deliveryAddress: deliveryAddress || null,
        notes: notes || null,
        status: "pending",
        orderItems: {
          create: games.map((g) => ({
            gameId: g.id,
            gameTitle: g.title,
            priceAtPurchase: g.salePrice ?? g.priceNaira,
          })),
        },
      },
    });

    // ── Create transaction record ───────────────────────────────────────────
    try {
      await prisma.transaction.create({
        data: {
          userId: userIdStr,
          orderId: order.id,
          amountNaira: totalNaira,
          amountKobo: convertToKobo(totalNaira),
          paymentMethod: "paystack",
          paystackReference,
          status: "pending",
          transactionType: "game_purchase",
          description: `Purchase of ${games.length} game(s): ${games.map((g) => g.title).join(", ")}`,
          metadata: JSON.stringify({ gameIds, orderNumber, customerFullName }),
        },
      });
    } catch (txError) {
      console.error("Transaction record creation error:", txError);
      // Non-fatal: order and order_items exist, we can still proceed
    }

    // ── Initialize Paystack ─────────────────────────────────────────────────
    const paystackResponse = await initializePaystackTransaction({
      email: customerEmail,
      amount: convertToKobo(totalNaira),
      reference: paystackReference,
      callback_url: `${appUrl}/orders/${order.id}?ref=${paystackReference}`,
      metadata: {
        orderId: order.id,
        orderNumber,
        gameIds,
        deliveryMethod,
        customerFullName,
      },
    });

    return NextResponse.json(
      {
        data: {
          orderId: order.id,
          orderNumber,
          authorizationUrl: paystackResponse.data.authorization_url,
          accessCode: paystackResponse.data.access_code,
          reference: paystackReference,
          totalNaira,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Payment initialization failed. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}
