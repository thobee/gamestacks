import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function mapOrderToResponse(order: any) {
  if (!order) return null;
  return {
    ...order,
    order_items: (order.orderItems || []).map((item: any) => ({
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
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
    );
    const status = searchParams.get("status");
    const offset = (page - 1) * limit;

    const where: any = {};
    if (
      status &&
      ["pending", "completed", "failed", "refunded", "cancelled", "delivered"].includes(status)
    ) {
      where.status = status;
    }

    const [orders, count] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders.map(mapOrderToResponse),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Admin list orders API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_FIELDS",
            message: "orderId and status are required",
          },
        },
        { status: 400 },
      );
    }

    const validStatuses = ["pending", "completed", "failed", "refunded", "cancelled", "delivered"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STATUS",
            message: `status must be one of: ${validStatuses.join(", ")}`,
          },
        },
        { status: 422 },
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json({ data: mapOrderToResponse(order) });
  } catch (error) {
    console.error("Admin PATCH order API error:", error);
    if ((error as any).code === "P2025") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}
