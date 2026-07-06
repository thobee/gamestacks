import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "You must be signed in to view your orders." } },
        { status: 401 }
      );
    }

    const userId = token.id as string;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            game: {
              select: {
                coverImageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map orders to camelCase/snake_case structures for frontend compatibility
    const mappedOrders = orders.map((order) => ({
      id: order.id,
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
      status: order.status,
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString(),
      order_items: order.orderItems.map((item) => ({
        id: item.id,
        game_id: item.gameId,
        game_title: item.gameTitle,
        price_at_purchase: item.priceAtPurchase,
        cover_image_url: item.game?.coverImageUrl || null,
      })),
    }));

    return NextResponse.json({ data: mappedOrders }, { status: 200 });
  } catch (error) {
    console.error("Fetch orders API error:", error);
    return NextResponse.json(
      { error: { code: "ORDERS_FETCH_ERROR", message: "Failed to fetch orders." } },
      { status: 500 }
    );
  }
}
