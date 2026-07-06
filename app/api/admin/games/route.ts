import { NextRequest, NextResponse } from "next/server";
import { prisma, mapGamesToResponse, mapGameToResponse } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug-generator";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    const where: any = {
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    };

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [games, count] = await Promise.all([
      prisma.game.findMany({ where, orderBy: { createdAt: "desc" }, skip: offset, take: limit }),
      prisma.game.count({ where }),
    ]);

    return NextResponse.json({
      data: mapGamesToResponse(games),
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error("Admin list games API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      longDescription,
      price_naira,
      priceNaira,
      category,
      image_url,
      coverImageUrl,
      download_url,
      downloadLink,
      systemRequirementsCpu,
      is_published,
      isPublished,
      // New fields
      genres,
      itemType,
      platform,
      deliveryType,
      region,
      salePrice,
      originalPriceNaira,
      discountPercentage,
      isFeatured,
      is_featured,
      editorsChoice,
      comingSoon,
      staffPick,
      weekendDeal,
      isNew,
      isOffline,
      totalSales,
      developerName,
      publisherName,
      fileSizeGb,
      systemRequirementsRam,
      systemRequirementsGpu,
      systemRequirementsStorage,
      systemRequirementsOs,
    } = body;

    const resolvedPrice = priceNaira !== undefined ? priceNaira : price_naira;
    const resolvedCoverImage = coverImageUrl || image_url || null;
    const resolvedDownloadLink = downloadLink || download_url || null;
    const resolvedIsPublished = isPublished !== undefined ? isPublished : (is_published ?? false);
    const resolvedIsFeatured = isFeatured !== undefined ? isFeatured : (is_featured ?? false);

    if (!title || !description || resolvedPrice === undefined || !category) {
      return NextResponse.json(
        { error: { code: "MISSING_FIELDS", message: "title, description, price_naira, and category are required" } },
        { status: 400 },
      );
    }

    if (typeof resolvedPrice !== "number" || resolvedPrice < 0) {
      return NextResponse.json(
        { error: { code: "INVALID_PRICE", message: "price_naira must be a non-negative number" } },
        { status: 422 },
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: { code: "INVALID_TITLE", message: "Title must be 200 characters or fewer" } },
        { status: 422 },
      );
    }

    const uniqueSlug = await generateUniqueSlug(title.trim(), prisma);

    const game = await prisma.game.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        description: description.trim(),
        longDescription: longDescription ? longDescription.trim() : null,
        priceNaira: Math.round(resolvedPrice),
        category: category.trim(),
        itemType: itemType || "game",
        platform: platform || null,
        deliveryType: deliveryType || null,
        region: region || null,
        screenshotsUrls: Array.isArray(body.screenshotsUrls) ? body.screenshotsUrls : [],
        genres: Array.isArray(genres) ? genres : [],
        salePrice: salePrice ? Math.round(salePrice) : null,
        originalPriceNaira: originalPriceNaira ? Math.round(originalPriceNaira) : null,
        discountPercentage: discountPercentage ?? 0,
        totalSales: totalSales ?? 0,
        coverImageUrl: resolvedCoverImage,
        downloadLink: resolvedDownloadLink,
        systemRequirementsCpu: systemRequirementsCpu || null,
        systemRequirementsRam: systemRequirementsRam || null,
        systemRequirementsGpu: systemRequirementsGpu || null,
        systemRequirementsStorage: systemRequirementsStorage || null,
        systemRequirementsOs: systemRequirementsOs || null,
        fileSizeGb: fileSizeGb ?? null,
        developerName: developerName || null,
        publisherName: publisherName || null,
        isPublished: resolvedIsPublished,
        isFeatured: resolvedIsFeatured,
        isNew: isNew ?? false,
        isOffline: isOffline ?? false,
        editorsChoice: editorsChoice ?? false,
        comingSoon: comingSoon ?? false,
        staffPick: staffPick ?? false,
        weekendDeal: weekendDeal ?? false,
      },
    });

    return NextResponse.json({ data: mapGameToResponse(game) }, { status: 201 });
  } catch (error) {
    console.error("Admin create game API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}
