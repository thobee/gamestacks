import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Run all analytics queries in parallel using Prisma
    const [
      orders,
      completedOrders,
      games,
      orderItems,
      recentOrders,
    ] = await Promise.all([
      // Total orders status
      prisma.order.findMany({
        select: { status: true },
      }),

      // Revenue from completed orders
      prisma.order.findMany({
        where: { status: "completed" },
        select: { totalNaira: true },
      }),

      // Total games (excluding deleted)
      prisma.game.findMany({
        where: { OR: [ { deletedAt: null }, { deletedAt: { isSet: false } } ], },
        select: { isPublished: true },
      }),

      // Top games by order count (take up to 200 items to aggregate)
      prisma.orderItem.findMany({
        select: { gameId: true, gameTitle: true },
        take: 200,
      }),

      // 10 most recent orders
      prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          totalNaira: true,
          status: true,
          customerEmail: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    // ── Compute order stats ──────────────────────────────────────────────────
    const orderStats = {
      total: orders.length,
      completed: orders.filter((o) => o.status === "completed").length,
      pending: orders.filter((o) => o.status === "pending").length,
      failed: orders.filter((o) => o.status === "failed" || o.status === "cancelled").length,
      refunded: orders.filter((o) => o.status === "refunded").length,
    };

    // ── Compute revenue ──────────────────────────────────────────────────────
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + (o.totalNaira || 0),
      0,
    );
    const avgOrderValue =
      completedOrders.length > 0
        ? Math.round(totalRevenue / completedOrders.length)
        : 0;

    // ── Game stats ───────────────────────────────────────────────────────────
    const gameStats = {
      total: games.length,
      published: games.filter((g) => g.isPublished).length,
      draft: games.filter((g) => !g.isPublished).length,
    };

    // ── Top games aggregation ────────────────────────────────────────────────
    const gameSaleMap: Record<string, { title: string; sales: number }> = {};
    for (const item of orderItems) {
      if (!gameSaleMap[item.gameId]) {
        gameSaleMap[item.gameId] = { title: item.gameTitle, sales: 0 };
      }
      gameSaleMap[item.gameId].sales += 1;
    }

    const topGames = Object.entries(gameSaleMap)
      .map(([id, { title, sales }]) => ({ id, title, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // ── Map recent orders for backward compatibility keys ────────────────────
    const mappedRecentOrders = recentOrders.map((o) => ({
      id: o.id,
      order_number: o.orderNumber,
      total_naira: o.totalNaira,
      status: o.status,
      customer_email: o.customerEmail,
      created_at: o.createdAt,
    }));

    return NextResponse.json({
      data: {
        orders: orderStats,
        revenue: {
          total: totalRevenue,
          avg: avgOrderValue,
        },
        games: gameStats,
        topGames,
        recentOrders: mappedRecentOrders,
      },
    });
  } catch (error) {
    console.error("Admin analytics API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load analytics" } },
      { status: 500 },
    );
  }
}
