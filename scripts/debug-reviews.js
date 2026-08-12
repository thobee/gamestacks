const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      userId: true,
      gameId: true,
    },
  });

  console.log("Found reviews:", rows.length);
  for (const row of rows) {
    console.log(
      JSON.stringify(
        {
          ...row,
          content: (row.content || "").slice(0, 120),
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
