import { NextRequest, NextResponse } from "next/server";
import { prisma, mapGameToResponse } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug: gameSlug } = await context.params;

    // Fetch game details
    const game = await prisma.game.findFirst({
      where: {
        slug: gameSlug,
        isPublished: true,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
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

    const reviewIds = reviews.map((review) => review.id);
    const pinLogs = reviewIds.length
      ? await prisma.auditLog.findMany({
          where: {
            action: "REVIEW_PIN_UPDATE",
            entityType: "review",
            entityId: { in: reviewIds },
          },
          orderBy: { createdAt: "desc" },
          select: {
            entityId: true,
            changes: true,
          },
        })
      : [];

    const pinStateByReviewId = new Map<
      string,
      { global: boolean; game: boolean }
    >();
    const seenScopes = new Set<string>();

    for (const log of pinLogs) {
      const reviewId = log.entityId || "";
      if (!reviewId) continue;

      let parsed: Record<string, unknown> = {};
      try {
        parsed = log.changes
          ? (JSON.parse(log.changes) as Record<string, unknown>)
          : {};
      } catch {
        parsed = {};
      }

      const scope = parsed.scope === "global" ? "global" : "game";
      const scopedKey = `${reviewId}:${scope}`;
      if (seenScopes.has(scopedKey)) continue;
      seenScopes.add(scopedKey);

      const pinned = Boolean(parsed.pinned);
      const current = pinStateByReviewId.get(reviewId) || {
        global: false,
        game: false,
      };

      if (scope === "global") current.global = pinned;
      else current.game = pinned;

      pinStateByReviewId.set(reviewId, current);
    }

    const decoratedReviews = reviews.map((review) => {
      const pinState = pinStateByReviewId.get(review.id) || {
        global: false,
        game: false,
      };

      return {
        ...review,
        isPinned: pinState.global || pinState.game,
        pinnedGlobal: pinState.global,
        pinnedForGame: pinState.game,
      };
    });

    const sortedReviews = decoratedReviews.sort((a, b) => {
      const aPinned = a.isPinned ? 1 : 0;
      const bPinned = b.isPinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Fetch related games (same category)
    const relatedGames = await prisma.game.findMany({
      where: {
        category: game.category,
        isPublished: true,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
        id: { not: game.id },
      },
      take: 6,
    });

    // Map related games to match output compatibility
    const mappedRelatedGames = relatedGames.map((g) => mapGameToResponse(g));

    return NextResponse.json(
      {
        data: {
          ...mapGameToResponse(game),
          reviews: sortedReviews || [],
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
