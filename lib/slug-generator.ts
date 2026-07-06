import { PrismaClient } from "@prisma/client";
import { generateSlug } from "./utils";

/**
 * Generates a unique slug for a game based on its title.
 * @param title The title of the game.
 * @param prisma PrismaClient instance.
 * @param excludeId Optional ID of the game to exclude from uniqueness check (for updates).
 */
export async function generateUniqueSlug(
  title: string,
  prisma: PrismaClient,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(title);
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existingGame = await prisma.game.findFirst({
      where: {
        slug: uniqueSlug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (!existingGame) {
      break;
    }

    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}
