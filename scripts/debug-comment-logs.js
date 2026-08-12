const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.auditLog.findMany({
    where: {
      entityType: "review_comment",
      action: {
        in: [
          "REVIEW_COMMENT",
          "REVIEW_COMMENT_NOTIFICATION",
          "REVIEW_COMMENT_READ",
        ],
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      action: true,
      entityId: true,
      createdAt: true,
      changes: true,
    },
  });

  console.log("Found logs:", logs.length);
  for (const l of logs) {
    let parsed = {};
    try {
      parsed = JSON.parse(l.changes || "{}");
    } catch {}

    console.log(
      JSON.stringify(
        {
          id: l.id,
          action: l.action,
          entityId: l.entityId,
          createdAt: l.createdAt,
          commentId: parsed.commentId,
          reviewId: parsed.reviewId,
          parentCommentId: parsed.parentCommentId,
          isAdminReply: parsed.isAdminReply,
          authorName: parsed.authorName,
          content: (parsed.content || "").slice(0, 120),
        },
        null,
        2,
      ),
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
