import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token?.id) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Sign in to post a review",
          },
        },
        { status: 401 },
      );
    }

    const { slug } = await context.params;
    const body = await request.json();
    const rating = Number(body.rating);
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_RATING",
            message: "Rating must be between 1 and 5",
          },
        },
        { status: 422 },
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CONTENT",
            message: "Review content is required",
          },
        },
        { status: 422 },
      );
    }

    const game = await prisma.game.findFirst({
      where: {
        slug,
        isPublished: true,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      select: { id: true, title: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Game not found" } },
        { status: 404 },
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_gameId: {
          userId: token.id as string,
          gameId: game.id,
        },
      },
    });

    const verifiedPurchase = await prisma.userGame.findFirst({
      where: {
        userId: token.id as string,
        gameId: game.id,
      },
      select: { id: true },
    });

    const titleFromUser =
      typeof token.name === "string" && token.name.trim()
        ? token.name.trim()
        : "Anonymous";

    let reviewRecord: { id: string };

    if (existingReview) {
      reviewRecord = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          content,
          title: titleFromUser,
          isVerifiedPurchase: !!verifiedPurchase,
        },
        select: { id: true },
      });
    } else {
      reviewRecord = await prisma.review.create({
        data: {
          userId: token.id as string,
          gameId: game.id,
          rating,
          content,
          title: titleFromUser,
          isVerifiedPurchase: !!verifiedPurchase,
          isApproved: true,
        },
        select: { id: true },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: "REVIEW_SUBMISSION_NOTIFICATION",
        entityType: "review",
        entityId: reviewRecord.id,
        changes: JSON.stringify({
          reviewId: reviewRecord.id,
          gameId: game.id,
          content,
          authorName: titleFromUser,
        }),
      },
    });

    const approvedReviews = await prisma.review.findMany({
      where: { gameId: game.id, isApproved: true },
      select: { rating: true },
    });

    const totalRatings = approvedReviews.length;
    const avgRating =
      totalRatings > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    await prisma.game.update({
      where: { id: game.id },
      data: {
        rating: avgRating,
        totalRatings,
      },
    });

    return NextResponse.json({ data: { ok: true } }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Could not post review" } },
      { status: 500 },
    );
  }
}
