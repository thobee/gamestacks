import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const games = await prisma.game.findMany({
      where: {
        isPublished: true,
        OR: [ { deletedAt: null }, { deletedAt: { isSet: false } } ],
        category: {
          not: null,
        },
      },
      select: {
        category: true,
      },
    });

    // Get unique categories sorted alphabetically
    const categories = Array.from(
      new Set(games.map((g) => g.category).filter(Boolean) as string[]),
    ).sort();

    return NextResponse.json(
      {
        data: categories,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "QUERY_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 },
    );
  }
}
