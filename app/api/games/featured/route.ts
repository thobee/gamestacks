import { NextRequest, NextResponse } from "next/server";
import { prisma, mapGamesToResponse } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const limit = Math.max(
      1,
      Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "6"), 50),
    );

    const featured = await prisma.game.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
        OR: [ { deletedAt: null }, { deletedAt: { isSet: false } } ],
      },
      orderBy: {
        rating: "desc",
      },
      take: limit,
    });

    return NextResponse.json(
      {
        data: mapGamesToResponse(featured),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Featured games API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 },
    );
  }
}
