import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Maps a Prisma Game model (camelCase) to include snake_case fields
 * for backward compatibility with the frontend and test suites.
 */
export function mapGameToResponse(game: any) {
  if (!game) return null;
  return {
    ...game,
    // snake_case aliases for backward compatibility
    price_naira: game.priceNaira,
    original_price_naira: game.originalPriceNaira,
    sale_price: game.salePrice,
    cover_image_url: game.coverImageUrl,
    screenshots_urls: game.screenshotsUrls || [],
    downloads_count: game.downloadsCount,
    file_size_gb: game.fileSizeGb,
    download_link: game.downloadLink,
    installation_guide_url: game.installationGuideUrl,
    system_requirements_cpu: game.systemRequirementsCpu,
    system_requirements_ram: game.systemRequirementsRam,
    system_requirements_gpu: game.systemRequirementsGpu,
    system_requirements_storage_gb: game.systemRequirementsStorage,
    system_requirements_os: game.systemRequirementsOs,
    is_published: game.isPublished,
    is_featured: game.isFeatured,
    is_offline: game.isOffline,
    is_new: game.isNew,
    editors_choice: game.editorsChoice,
    coming_soon: game.comingSoon,
    staff_pick: game.staffPick,
    weekend_deal: game.weekendDeal,
    total_sales: game.totalSales,
    item_type: game.itemType,
    platform: game.platform,
    delivery_type: game.deliveryType,
    region: game.region,
    release_date: game.releaseDate,
    created_at: game.createdAt,
    updated_at: game.updatedAt,
  };
}

/**
 * Maps multiple Prisma Game models.
 */
export function mapGamesToResponse(games: any[]) {
  if (!games) return [];
  return games.map(mapGameToResponse);
}

