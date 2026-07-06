const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function generateSlug(text) {
  if (!text) return "";
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function migrateSlugs() {
  console.log("Starting slug migration...");

  const games = await prisma.game.findMany();
  let updatedCount = 0;

  for (const game of games) {
    if (!game.slug) {
      const baseSlug = generateSlug(game.title);
      let uniqueSlug = baseSlug;
      let counter = 1;

      while (true) {
        const existingGame = await prisma.game.findFirst({
          where: { slug: uniqueSlug },
        });

        if (!existingGame) {
          break;
        }

        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      await prisma.game.update({
        where: { id: game.id },
        data: { slug: uniqueSlug },
      });

      console.log(`Updated game: ${game.title} -> ${uniqueSlug}`);
      updatedCount++;
    }
  }

  console.log(`Migration complete! Updated ${updatedCount} games.`);
}

migrateSlugs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
