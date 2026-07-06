import { NextRequest, NextResponse } from "next/server";
import { prisma, mapGameToResponse } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug-generator";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const game = await prisma.game.findFirst({
      where: {
        id,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Game not found" } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: mapGameToResponse(game) });
  } catch (error) {
    console.error("Admin GET game error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Strip read-only fields
    const { id: _id, created_at: _ca, ...updates } = body;

    const resolvedPrice =
      updates.priceNaira !== undefined ? updates.priceNaira : updates.price_naira;
    const resolvedCoverImage = updates.coverImageUrl || updates.image_url;
    const resolvedDownloadLink = updates.downloadLink || updates.download_url;
    const resolvedIsPublished =
      updates.isPublished !== undefined ? updates.isPublished : updates.is_published;
    const resolvedIsFeatured =
      updates.isFeatured !== undefined ? updates.isFeatured : updates.is_featured;

    if (resolvedPrice !== undefined) {
      if (typeof resolvedPrice !== "number" || resolvedPrice < 0) {
        return NextResponse.json(
          { error: { code: "INVALID_PRICE", message: "price_naira must be a non-negative number" } },
          { status: 422 },
        );
      }
    }

    if (updates.title !== undefined && updates.title.length > 200) {
      return NextResponse.json(
        { error: { code: "INVALID_TITLE", message: "Title must be 200 characters or fewer" } },
        { status: 422 },
      );
    }

    // Build update object with all supported fields
    const dataUpdate: any = {};
    if (updates.title !== undefined) {
      dataUpdate.title = updates.title.trim();
      dataUpdate.slug = await generateUniqueSlug(dataUpdate.title, prisma, id);
    }
    if (updates.description !== undefined) dataUpdate.description = updates.description.trim();
    if (updates.longDescription !== undefined) dataUpdate.longDescription = updates.longDescription.trim();
    if (updates.category !== undefined)    dataUpdate.category = updates.category.trim();
    if (resolvedPrice !== undefined)       dataUpdate.priceNaira = Math.round(resolvedPrice);
    if (resolvedCoverImage !== undefined)  dataUpdate.coverImageUrl = resolvedCoverImage;
    if (resolvedDownloadLink !== undefined) dataUpdate.downloadLink = resolvedDownloadLink;
    if (resolvedIsPublished !== undefined) dataUpdate.isPublished = resolvedIsPublished;
    if (resolvedIsFeatured !== undefined)  dataUpdate.isFeatured = resolvedIsFeatured;

    // New fields
    if (updates.genres !== undefined)               dataUpdate.genres = Array.isArray(updates.genres) ? updates.genres : [];
    if (updates.itemType !== undefined)             dataUpdate.itemType = updates.itemType;
    if (updates.platform !== undefined)             dataUpdate.platform = updates.platform;
    if (updates.deliveryType !== undefined)         dataUpdate.deliveryType = updates.deliveryType;
    if (updates.region !== undefined)               dataUpdate.region = updates.region;
    if (updates.screenshotsUrls !== undefined)      dataUpdate.screenshotsUrls = Array.isArray(updates.screenshotsUrls) ? updates.screenshotsUrls : [];
    if (updates.salePrice !== undefined)            dataUpdate.salePrice = updates.salePrice !== null ? Math.round(updates.salePrice) : null;
    if (updates.originalPriceNaira !== undefined)   dataUpdate.originalPriceNaira = updates.originalPriceNaira !== null ? Math.round(updates.originalPriceNaira) : null;
    if (updates.discountPercentage !== undefined)   dataUpdate.discountPercentage = updates.discountPercentage;
    if (updates.totalSales !== undefined)           dataUpdate.totalSales = updates.totalSales;
    if (updates.editorsChoice !== undefined)        dataUpdate.editorsChoice = updates.editorsChoice;
    if (updates.comingSoon !== undefined)           dataUpdate.comingSoon = updates.comingSoon;
    if (updates.staffPick !== undefined)            dataUpdate.staffPick = updates.staffPick;
    if (updates.weekendDeal !== undefined)          dataUpdate.weekendDeal = updates.weekendDeal;
    if (updates.isNew !== undefined)                dataUpdate.isNew = updates.isNew;
    if (updates.isOffline !== undefined)            dataUpdate.isOffline = updates.isOffline;
    if (updates.developerName !== undefined)        dataUpdate.developerName = updates.developerName;
    if (updates.publisherName !== undefined)        dataUpdate.publisherName = updates.publisherName;
    if (updates.fileSizeGb !== undefined)           dataUpdate.fileSizeGb = updates.fileSizeGb;
    if (updates.system_requirements !== undefined)  dataUpdate.systemRequirementsCpu = updates.system_requirements;
    if (updates.systemRequirementsCpu !== undefined)     dataUpdate.systemRequirementsCpu = updates.systemRequirementsCpu;
    if (updates.systemRequirementsRam !== undefined)     dataUpdate.systemRequirementsRam = updates.systemRequirementsRam;
    if (updates.systemRequirementsGpu !== undefined)     dataUpdate.systemRequirementsGpu = updates.systemRequirementsGpu;
    if (updates.systemRequirementsStorage !== undefined) dataUpdate.systemRequirementsStorage = updates.systemRequirementsStorage;
    if (updates.systemRequirementsOs !== undefined)      dataUpdate.systemRequirementsOs = updates.systemRequirementsOs;

    const game = await prisma.game.update({
      where: { id },
      data: dataUpdate,
    });

    return NextResponse.json({ data: mapGameToResponse(game) });
  } catch (error) {
    console.error("Admin PUT game error:", error);
    if ((error as any).code === "P2025") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Game not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const orderItemsCount = await prisma.orderItem.count({
      where: { gameId: id },
    });

    if (orderItemsCount > 0) {
      const game = await prisma.game.update({
        where: { id },
        data: { isPublished: false, deletedAt: new Date() },
      });

      return NextResponse.json({
        data: mapGameToResponse(game),
        message: "Game unpublished (has existing orders, cannot hard delete)",
      });
    }

    await prisma.game.delete({ where: { id } });

    return NextResponse.json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Admin DELETE game error:", error);
    if ((error as any).code === "P2025") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Game not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}
