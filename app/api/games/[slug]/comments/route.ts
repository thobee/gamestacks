import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { notifyAdminsOfComment } from "@/lib/admin-comment-alerts";

type StoredComment = {
  id: string;
  reviewId: string;
  gameId: string;
  content: string;
  parentCommentId: string | null;
  isAdminReply: boolean;
  authorName: string;
  createdAt: string;
};

function safeParseChanges(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const reviewId = request.nextUrl.searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        {
          error: { code: "MISSING_REVIEW_ID", message: "reviewId is required" },
        },
        { status: 400 },
      );
    }

    const game = await prisma.game.findFirst({
      where: {
        slug,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      select: { id: true, title: true, slug: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Game not found" } },
        { status: 404 },
      );
    }

    const review = await prisma.review.findFirst({
      where: { id: reviewId, gameId: game.id },
      select: { id: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Review not found" } },
        { status: 404 },
      );
    }

    const [logs, deletedLogs] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          action: "REVIEW_COMMENT",
          entityType: "review_comment",
          entityId: review.id,
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          createdAt: true,
          changes: true,
        },
      }),
      prisma.auditLog.findMany({
        where: {
          action: "REVIEW_COMMENT_DELETE",
          entityType: "review_comment",
        },
        select: {
          entityId: true,
        },
      }),
    ]);

    const deletedIds = new Set(
      deletedLogs.map((log) => log.entityId || "").filter(Boolean),
    );

    const comments: StoredComment[] = logs
      .map((log) => {
        const parsed = safeParseChanges(log.changes ?? null);
        return {
          id: log.id,
          reviewId: String(parsed.reviewId || review.id),
          gameId: String(parsed.gameId || game.id),
          content: String(parsed.content || ""),
          parentCommentId: parsed.parentCommentId
            ? String(parsed.parentCommentId)
            : null,
          isAdminReply: Boolean(parsed.isAdminReply),
          authorName: String(parsed.authorName || "User"),
          createdAt: log.createdAt.toISOString(),
        };
      })
      .filter((c) => c.content.trim().length > 0)
      .filter((c) => !deletedIds.has(c.id))
      .filter((c) => !(c.parentCommentId && deletedIds.has(c.parentCommentId)));

    return NextResponse.json({ data: comments }, { status: 200 });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Could not load comments" } },
      { status: 500 },
    );
  }
}

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
        { error: { code: "UNAUTHENTICATED", message: "Sign in to comment" } },
        { status: 401 },
      );
    }

    const { slug } = await context.params;
    const body = await request.json();
    const reviewId = typeof body.reviewId === "string" ? body.reviewId : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const parentCommentId =
      typeof body.parentCommentId === "string" ? body.parentCommentId : null;

    if (!reviewId || !content) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_PAYLOAD",
            message: "reviewId and content are required",
          },
        },
        { status: 422 },
      );
    }

    const game = await prisma.game.findFirst({
      where: {
        slug,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      select: { id: true, title: true, slug: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Game not found" } },
        { status: 404 },
      );
    }

    const review = await prisma.review.findFirst({
      where: { id: reviewId, gameId: game.id },
      select: { id: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Review not found" } },
        { status: 404 },
      );
    }

    const displayName =
      typeof token.name === "string" && token.name.trim()
        ? token.name.trim()
        : "User";

    const created = await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: "REVIEW_COMMENT",
        entityType: "review_comment",
        entityId: review.id,
        changes: JSON.stringify({
          reviewId: review.id,
          gameId: game.id,
          content,
          parentCommentId,
          isAdminReply: false,
          authorName: displayName,
        }),
      },
      select: { id: true, createdAt: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: "REVIEW_COMMENT_NOTIFICATION",
        entityType: "review_comment",
        entityId: created.id,
        changes: JSON.stringify({
          commentId: created.id,
          reviewId: review.id,
          gameId: game.id,
          content,
          parentCommentId,
          isAdminReply: false,
          authorName: displayName,
        }),
      },
    });

    const admins = await prisma.user.findMany({
      where: {
        isAdmin: true,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      select: {
        email: true,
        profile: {
          select: { whatsappNumber: true },
        },
      },
    });

    void notifyAdminsOfComment({
      gameTitle: game.title,
      gameSlug: game.slug || slug,
      authorName: displayName,
      content,
      adminEmails: admins.map((a) => a.email || "").filter(Boolean),
      adminWhatsappNumbers: admins
        .map((a) => a.profile?.whatsappNumber || "")
        .filter(Boolean),
    }).catch((alertError) => {
      console.error("Admin comment alert dispatch failed:", alertError);
    });

    return NextResponse.json(
      {
        data: {
          id: created.id,
          reviewId: review.id,
          gameId: game.id,
          content,
          parentCommentId,
          isAdminReply: false,
          authorName: displayName,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Could not post comment" } },
      { status: 500 },
    );
  }
}
