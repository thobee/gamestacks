import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_QUERY",
            message: "Search query must be at least 2 characters",
          },
        },
        { status: 400 },
      );
    }

    // Search games using case-insensitive contains filter in Prisma
    const games = await prisma.game.findMany({
      where: {
        isPublished: true,
        AND: [
          {
            OR: [ { deletedAt: null }, { deletedAt: { isSet: false } } ],
          },
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          }
        ],
      },
      select: {
        id: true,
        title: true,
        priceNaira: true,
        coverImageUrl: true,
        rating: true,
        category: true,
      },
      take: limit,
    });

    // Map to include both camelCase and snake_case properties
    const mappedGames = games.map((g) => ({
      id: g.id,
      title: g.title,
      priceNaira: g.priceNaira,
      price_naira: g.priceNaira,
      coverImageUrl: g.coverImageUrl,
      cover_image_url: g.coverImageUrl,
      rating: g.rating,
      category: g.category,
    }));

    return NextResponse.json(
      {
        data: mappedGames,
        query,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "SEARCH_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 },
    );
  }
}
