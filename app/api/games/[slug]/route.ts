import { NextRequest, NextResponse } from "next/server";
import { prisma, mapGameToResponse } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug: gameSlug } = await context.params;

    // Fetch game details
    const game = await prisma.game.findFirst({
      where: {
        slug: gameSlug,
        isPublished: true,
        OR: [ { deletedAt: null }, { deletedAt: { isSet: false } } ],
      },
    });

    if (!game) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Game not found",
          },
        },
        { status: 404 },
      );
    }

    // Fetch approved reviews
    const reviews = await prisma.review.findMany({
      where: {
        gameId: game.id,
        isApproved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Fetch related games (same category)
    const relatedGames = await prisma.game.findMany({
      where: {
        category: game.category,
        isPublished: true,
        OR: [ { deletedAt: null }, { deletedAt: { isSet: false } } ],
        id: { not: game.id },
      },
      take: 6,
    });

    // Map related games to match output compatibility
    const mappedRelatedGames = relatedGames.map(g => mapGameToResponse(g));

    return NextResponse.json(
      {
        data: {
          ...mapGameToResponse(game),
          reviews: reviews || [],
          relatedGames: mappedRelatedGames || [],
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Game detail error:", error);
    return NextResponse.json(
      {
        error: {
          code: "GAME_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 },
    );
  }
}
