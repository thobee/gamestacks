const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.game.create({
      data: {
        title: "Test",
        description: "Test",
        priceNaira: 100,
        category: "Test",
        platform: "Test",
      }
    });
    console.log("Success");
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
