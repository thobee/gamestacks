import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCategoryFilter } from "@/lib/catalog";

// ---------------------------------------------------------------------------
// Collection query logic
// Each key maps to a reusable Prisma where+orderBy pair.
// Adding a new collection only requires adding an entry here.
// ---------------------------------------------------------------------------

type CollectionConfig = {
  where?: Record<string, any>;
  orderBy?: Record<string, any> | Record<string, any>[];
};

function buildCollectionQuery(collection: string): CollectionConfig {
  switch (collection) {
    case "best-sellers":
      return { orderBy: { totalSales: "desc" } };

    case "discounts":
      // Games that have an active salePrice below priceNaira
      return {
        where: { salePrice: { not: null, lt: undefined } },
        orderBy: [{ discountPercentage: "desc" }],
      };

    case "under-10000":
      // effectivePrice = salePrice ?? priceNaira <= 10000
      // MongoDB: we use an OR — either salePrice exists and ≤10000, or no salePrice and priceNaira ≤10000
      return {
        where: {
          OR: [
            { salePrice: { lte: 10000 } },
            { salePrice: { isSet: false }, priceNaira: { lte: 10000 } },
            { salePrice: null, priceNaira: { lte: 10000 } },
          ],
        },
        orderBy: { priceNaira: "asc" },
      };

    case "under-20000":
      return {
        where: {
          OR: [
            { salePrice: { lte: 20000 } },
            { salePrice: { isSet: false }, priceNaira: { lte: 20000 } },
            { salePrice: null, priceNaira: { lte: 20000 } },
          ],
        },
        orderBy: { priceNaira: "asc" },
      };

    case "under-5000":
      return {
        where: {
          OR: [
            { salePrice: { lte: 5000 } },
            { salePrice: { isSet: false }, priceNaira: { lte: 5000 } },
            { salePrice: null, priceNaira: { lte: 5000 } },
          ],
        },
        orderBy: { priceNaira: "asc" },
      };

    case "under-50000":
      return {
        where: {
          OR: [
            { salePrice: { lte: 50000 } },
            { salePrice: { isSet: false }, priceNaira: { lte: 50000 } },
            { salePrice: null, priceNaira: { lte: 50000 } },
          ],
        },
        orderBy: { priceNaira: "asc" },
      };

    case "featured":
      return { where: { isFeatured: true }, orderBy: { createdAt: "desc" } };

    case "editors-choice":
      return { where: { editorsChoice: true }, orderBy: { rating: "desc" } };

    case "coming-soon":
      return { where: { comingSoon: true }, orderBy: { releaseDate: "asc" } };

    case "staff-picks":
      return { where: { staffPick: true }, orderBy: { rating: "desc" } };

    case "weekend-deals":
      return { where: { weekendDeal: true }, orderBy: { discountPercentage: "desc" } };

    case "new-releases":
      return { orderBy: { createdAt: "desc" } };

    case "top-rated":
      return { orderBy: [{ rating: "desc" }, { totalRatings: "desc" }] };

    case "most-downloaded":
      return { orderBy: { downloadsCount: "desc" } };

    default:
      return {};
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const collection = searchParams.get("collection");
    const category = searchParams.get("category");
    const genre = searchParams.get("genre");
    const itemType = searchParams.get("itemType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "rating";
    const searchQuery = searchParams.get("search");
    const vram = searchParams.get("vram");
    const ram = searchParams.get("ram");
    const cpu = searchParams.get("cpu");

    const page = Math.max(
      1,
      Math.min(parseInt(searchParams.get("page") || "1"), 1000),
    );
    const limit = Math.max(
      1,
      Math.min(parseInt(searchParams.get("limit") || "20"), 100),
    );
    const offset = (page - 1) * limit;

    let minPriceNum = 0;
    let maxPriceNum = Number.MAX_SAFE_INTEGER;

    if (minPrice) minPriceNum = Math.max(0, parseInt(minPrice));
    if (maxPrice) maxPriceNum = Math.max(0, parseInt(maxPrice));

    if (minPriceNum > maxPriceNum) {
      return NextResponse.json(
        { error: { code: "INVALID_PARAMS", message: "minPrice cannot be greater than maxPrice" } },
        { status: 400 },
      );
    }

    // --- Base where clause ---
    const baseWhere: any = {
      isPublished: true,
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    };

    if (category) {
      const resolved = resolveCategoryFilter(category);
      if (resolved) baseWhere.category = resolved;
    }
    if (itemType) baseWhere.itemType = itemType;
    if (genre) baseWhere.genres = { has: genre };

    if (minPrice || maxPrice) {
      baseWhere.priceNaira = {};
      if (minPrice) baseWhere.priceNaira.gte = minPriceNum;
      if (maxPrice) baseWhere.priceNaira.lte = maxPriceNum;
    }
    
    if (searchQuery) {
      baseWhere.title = { contains: searchQuery, mode: "insensitive" };
    }

    if (vram) {
      // e.g. "4GB" -> match if gpu contains "4GB"
      baseWhere.systemRequirementsGpu = { contains: vram, mode: "insensitive" };
    }
    if (ram) {
      // Extract just the memory size e.g. "8GB Performance" -> "8GB"
      const ramSize = ram.split(" ")[0];
      baseWhere.systemRequirementsRam = { contains: ramSize, mode: "insensitive" };
    }
    if (cpu) {
      baseWhere.systemRequirementsCpu = { contains: cpu, mode: "insensitive" };
    }

    // --- Collection overrides ---
    let collectionWhere: any = {};
    let orderBy: any = { rating: "desc" };

    if (collection) {
      const config = buildCollectionQuery(collection);
      if (config.where) collectionWhere = config.where;
      if (config.orderBy) orderBy = config.orderBy;
    } else {
      // Standard sort when no collection
      if (sortBy === "price") orderBy = { priceNaira: "asc" };
      else if (sortBy === "downloads") orderBy = { downloadsCount: "desc" };
      else if (sortBy === "newest") orderBy = { createdAt: "desc" };
      else if (sortBy === "best-sellers") orderBy = { totalSales: "desc" };
    }

    // Special fix for discounts: MongoDB can't do cross-field comparison in Prisma,
    // so we query salePrice not null and filter in memory after.
    const isDiscountCollection = collection === "discounts";
    if (isDiscountCollection) {
      collectionWhere = {
        salePrice: { not: null },
        NOT: [{ salePrice: { isSet: false } }],
      };
      orderBy = { discountPercentage: "desc" };
    }

    const where = { ...baseWhere, ...collectionWhere };

    const [games, count] = await Promise.all([
      prisma.game.findMany({ where, orderBy, skip: offset, take: limit }),
      prisma.game.count({ where }),
    ]);

    // Post-filter discounts: salePrice < priceNaira
    const filteredGames = isDiscountCollection
      ? games.filter((g) => g.salePrice !== null && g.salePrice < g.priceNaira)
      : games;

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json(
      {
        data: filteredGames,
        pagination: { page, limit, total: isDiscountCollection ? filteredGames.length : count, totalPages },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Games API error:", error);
    return NextResponse.json(
      { error: { code: "GAMES_ERROR", message: "An unexpected error occurred" } },
      { status: 500 },
    );
  }
}
