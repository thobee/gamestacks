import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

function safeParseChanges(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function requireAdmin(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { id: true, isAdmin: true, name: true },
  });
  if (!user?.isAdmin) return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 },
      );
    }

    const [commentLogs, readLogs, recentReviews, deletedLogs, pinLogs] =
      await Promise.all([
        prisma.auditLog.findMany({
          where: {
            action: {
              in: ["REVIEW_COMMENT_NOTIFICATION", "REVIEW_COMMENT"],
            },
            entityType: "review_comment",
          },
          orderBy: { createdAt: "desc" },
          take: 200,
          select: {
            id: true,
            action: true,
            entityId: true,
            changes: true,
            createdAt: true,
          },
        }),
        prisma.auditLog.findMany({
          where: {
            action: {
              in: ["REVIEW_COMMENT_READ", "REVIEW_SUBMISSION_READ"],
            },
            entityType: {
              in: ["review_comment", "review"],
            },
          },
          select: { entityId: true },
        }),
        prisma.review.findMany({
          where: {
            isApproved: true,
          },
          orderBy: { createdAt: "desc" },
          take: 200,
          select: {
            id: true,
            gameId: true,
            content: true,
            title: true,
            createdAt: true,
            game: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        }),
        prisma.auditLog.findMany({
          where: {
            action: "REVIEW_COMMENT_DELETE",
            entityType: "review_comment",
          },
          select: { entityId: true },
        }),
        prisma.auditLog.findMany({
          where: {
            action: "REVIEW_PIN_UPDATE",
            entityType: "review",
          },
          orderBy: { createdAt: "desc" },
          take: 1000,
          select: {
            entityId: true,
            changes: true,
          },
        }),
      ]);

    const readIds = new Set(
      readLogs.map((log) => log.entityId || "").filter(Boolean),
    );

    const comments = commentLogs.map((log) => {
      const parsed = safeParseChanges(log.changes ?? null);
      const sourceCommentId =
        log.action === "REVIEW_COMMENT_NOTIFICATION"
          ? String(parsed.commentId || log.entityId || log.id)
          : log.id;

      return {
        id: sourceCommentId,
        logId: log.id,
        action: log.action,
        reviewId:
          log.action === "REVIEW_COMMENT_NOTIFICATION"
            ? String(parsed.reviewId || "")
            : log.entityId || String(parsed.reviewId || ""),
        gameId: String(parsed.gameId || ""),
        content: String(parsed.content || ""),
        parentCommentId: parsed.parentCommentId
          ? String(parsed.parentCommentId)
          : null,
        isAdminReply: Boolean(parsed.isAdminReply),
        authorName: String(parsed.authorName || "User"),
        createdAt: log.createdAt,
      };
    });

    const dedupedComments = Array.from(
      comments
        .sort((a, b) => {
          if (a.createdAt.getTime() !== b.createdAt.getTime()) {
            return b.createdAt.getTime() - a.createdAt.getTime();
          }
          const aPriority = a.action === "REVIEW_COMMENT_NOTIFICATION" ? 0 : 1;
          const bPriority = b.action === "REVIEW_COMMENT_NOTIFICATION" ? 0 : 1;
          return aPriority - bPriority;
        })
        .reduce((acc, item) => {
          if (!acc.has(item.id)) acc.set(item.id, item);
          return acc;
        }, new Map<string, (typeof comments)[number]>())
        .values(),
    );

    const deletedCommentIds = new Set(
      deletedLogs.map((log) => log.entityId || "").filter(Boolean),
    );

    const visibleComments = dedupedComments.filter((c) => {
      if (deletedCommentIds.has(c.id)) return false;
      if (c.parentCommentId && deletedCommentIds.has(c.parentCommentId)) {
        return false;
      }
      return true;
    });

    const byId = new Map(visibleComments.map((c) => [c.id, c]));
    const repliesByParent = new Map<string, number>();
    for (const c of visibleComments) {
      if (c.parentCommentId && byId.has(c.parentCommentId)) {
        repliesByParent.set(
          c.parentCommentId,
          (repliesByParent.get(c.parentCommentId) || 0) + 1,
        );
      }
    }

    const pinStateByReviewId = new Map<
      string,
      { global: boolean; game: boolean }
    >();
    const seenPinScopes = new Set<string>();

    for (const log of pinLogs) {
      const parsed = safeParseChanges(log.changes ?? null);
      const reviewId = String(log.entityId || parsed.reviewId || "");
      if (!reviewId) continue;

      const scope = parsed.scope === "global" ? "global" : "game";
      const scopeKey = `${reviewId}:${scope}`;
      if (seenPinScopes.has(scopeKey)) continue;
      seenPinScopes.add(scopeKey);

      const pinned = Boolean(parsed.pinned);
      const current = pinStateByReviewId.get(reviewId) || {
        global: false,
        game: false,
      };

      if (scope === "global") current.global = pinned;
      else current.game = pinned;

      pinStateByReviewId.set(reviewId, current);
    }

    const userComments = visibleComments.filter((c) => !c.isAdminReply);
    const adminReplies = visibleComments.filter((c) => c.isAdminReply);
    const reviewIds = Array.from(
      new Set(userComments.map((c) => c.reviewId).filter(Boolean)),
    );

    const reviews = await prisma.review.findMany({
      where: { id: { in: reviewIds } },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    const reviewMap = new Map(reviews.map((r) => [r.id, r]));

    const rows = userComments.map((c) => {
      const review = reviewMap.get(c.reviewId);
      const pinState = pinStateByReviewId.get(c.reviewId) || {
        global: false,
        game: false,
      };
      const unread =
        !readIds.has(c.id) && (repliesByParent.get(c.id) || 0) === 0;
      return {
        id: c.id,
        sourceType: "comment" as const,
        reviewId: c.reviewId,
        gameId: c.gameId,
        gameTitle: review?.game?.title || "Unknown Game",
        gameSlug: review?.game?.slug || "",
        authorName: c.authorName,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        repliesCount: repliesByParent.get(c.id) || 0,
        unread,
        isPinned: pinState.global || pinState.game,
        pinnedGlobal: pinState.global,
        pinnedForGame: pinState.game,
      };
    });

    const existingReviewIds = new Set(
      rows.map((r) => r.reviewId).filter(Boolean),
    );
    const reviewReplyCountByReviewId = adminReplies.reduce((acc, reply) => {
      if (!reply.reviewId) return acc;
      acc.set(reply.reviewId, (acc.get(reply.reviewId) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    const reviewRows = recentReviews
      .filter((r) => (r.content || "").trim().length > 0)
      .filter((r) => !existingReviewIds.has(r.id))
      .map((r) => {
        const syntheticId = `review-${r.id}`;
        const pinState = pinStateByReviewId.get(r.id) || {
          global: false,
          game: false,
        };
        return {
          id: syntheticId,
          sourceType: "review" as const,
          reviewId: r.id,
          gameId: r.gameId,
          gameTitle: r.game?.title || "Unknown Game",
          gameSlug: r.game?.slug || "",
          authorName: r.title || "User",
          content: r.content || "",
          createdAt: r.createdAt.toISOString(),
          repliesCount: reviewReplyCountByReviewId.get(r.id) || 0,
          unread: !readIds.has(syntheticId),
          isPinned: pinState.global || pinState.game,
          pinnedGlobal: pinState.global,
          pinnedForGame: pinState.game,
        };
      });

    const mergedRows = [...rows, ...reviewRows].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(
      {
        data: {
          unreadCount: mergedRows.filter((r) => r.unread).length,
          notifications: mergedRows,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin comment notifications error:", error);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to load notifications",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 },
      );
    }

    const body = await request.json();
    const action =
      typeof body.action === "string" ? body.action.toLowerCase() : "";
    const commentId = typeof body.commentId === "string" ? body.commentId : "";
    const reply = typeof body.reply === "string" ? body.reply.trim() : "";
    const markReadOnly = Boolean(body.markReadOnly);
    const pinScope =
      body.pinScope === "global"
        ? "global"
        : body.pinScope === "all"
          ? "all"
          : "game";

    const requestedAction =
      action || (markReadOnly ? "mark-read" : reply ? "reply" : "");

    if (!commentId) {
      return NextResponse.json(
        {
          error: { code: "MISSING_COMMENT", message: "commentId is required" },
        },
        { status: 422 },
      );
    }

    if (
      ![
        "mark-read",
        "reply",
        "delete-comment",
        "pin-review",
        "unpin-review",
      ].includes(requestedAction)
    ) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_ACTION",
            message: "Unsupported action",
          },
        },
        { status: 422 },
      );
    }

    const isSyntheticReviewNotification = commentId.startsWith("review-");
    const syntheticReviewId = isSyntheticReviewNotification
      ? commentId.slice("review-".length)
      : "";

    const original = isSyntheticReviewNotification
      ? null
      : await prisma.auditLog.findUnique({
          where: { id: commentId },
          select: { id: true, entityId: true, changes: true },
        });

    if (!original && !isSyntheticReviewNotification) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Comment not found" } },
        { status: 404 },
      );
    }

    const parsed = safeParseChanges(original?.changes ?? null);
    const gameId = String(parsed.gameId || "");
    const reviewId = isSyntheticReviewNotification
      ? syntheticReviewId
      : original?.entityId || String(parsed.reviewId || "");

    if (requestedAction === "delete-comment" && isSyntheticReviewNotification) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_TARGET",
            message: "Only real comments can be deleted",
          },
        },
        { status: 422 },
      );
    }

    if (requestedAction === "delete-comment") {
      const targetComment = await prisma.auditLog.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          entityId: true,
          changes: true,
          entityType: true,
          action: true,
        },
      });

      if (
        !targetComment ||
        targetComment.entityType !== "review_comment" ||
        targetComment.action !== "REVIEW_COMMENT"
      ) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Comment not found" } },
          { status: 404 },
        );
      }

      const targetParsed = safeParseChanges(targetComment.changes ?? null);
      const targetReviewId = String(
        targetComment.entityId || targetParsed.reviewId || "",
      );

      const replyRows = targetReviewId
        ? await prisma.auditLog.findMany({
            where: {
              action: "REVIEW_COMMENT",
              entityType: "review_comment",
              entityId: targetReviewId,
              changes: {
                contains: `"parentCommentId":"${commentId}"`,
              },
            },
            select: { id: true },
          })
        : [];

      const idsToDelete = [commentId, ...replyRows.map((row) => row.id)];

      await prisma.$transaction(
        idsToDelete.map((id) =>
          prisma.auditLog.create({
            data: {
              userId: admin.id,
              action: "REVIEW_COMMENT_DELETE",
              entityType: "review_comment",
              entityId: id,
              changes: JSON.stringify({
                reviewId: targetReviewId,
                deletedBy: admin.id,
              }),
            },
          }),
        ),
      );

      return NextResponse.json(
        {
          data: {
            ok: true,
            deletedCount: idsToDelete.length,
          },
        },
        { status: 200 },
      );
    }

    if (
      requestedAction === "pin-review" ||
      requestedAction === "unpin-review"
    ) {
      if (!reviewId) {
        return NextResponse.json(
          {
            error: {
              code: "MISSING_REVIEW",
              message: "reviewId is required for pinning",
            },
          },
          { status: 422 },
        );
      }

      const scopes =
        requestedAction === "unpin-review" && pinScope === "all"
          ? ["global", "game"]
          : [pinScope === "all" ? "game" : pinScope];

      await prisma.$transaction(
        scopes.map((scope) =>
          prisma.auditLog.create({
            data: {
              userId: admin.id,
              action: "REVIEW_PIN_UPDATE",
              entityType: "review",
              entityId: reviewId,
              changes: JSON.stringify({
                reviewId,
                gameId,
                scope,
                pinned: requestedAction === "pin-review",
              }),
            },
          }),
        ),
      );

      return NextResponse.json(
        {
          data: {
            ok: true,
            reviewId,
            pinned: requestedAction === "pin-review",
            pinScope,
          },
        },
        { status: 200 },
      );
    }

    if (requestedAction === "reply" && !reply) {
      return NextResponse.json(
        { error: { code: "MISSING_REPLY", message: "Reply text is required" } },
        { status: 422 },
      );
    }

    const writes = [
      prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: isSyntheticReviewNotification
            ? "REVIEW_SUBMISSION_READ"
            : "REVIEW_COMMENT_READ",
          entityType: isSyntheticReviewNotification
            ? "review"
            : "review_comment",
          entityId: commentId,
          changes: JSON.stringify({ commentId }),
        },
      }),
    ];

    if (requestedAction === "reply" && reply) {
      writes.push(
        prisma.auditLog.create({
          data: {
            userId: admin.id,
            action: "REVIEW_COMMENT",
            entityType: "review_comment",
            entityId: reviewId,
            changes: JSON.stringify({
              reviewId,
              gameId,
              content: reply,
              parentCommentId: isSyntheticReviewNotification ? null : commentId,
              isAdminReply: true,
              authorName: admin.name || "Admin",
            }),
          },
        }),
      );
    }

    await prisma.$transaction(writes);

    return NextResponse.json({ data: { ok: true } }, { status: 200 });
  } catch (error) {
    console.error("Admin comment reply error:", error);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Could not update notification",
        },
      },
      { status: 500 },
    );
  }
}
