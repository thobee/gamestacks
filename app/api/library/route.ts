import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "You must be logged in to view your library.",
          },
        },
        { status: 401 },
      );
    }

    const userGames = await prisma.userGame.findMany({
      where: { userId: token.id as string },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImageUrl: true,
            itemType: true,
            platform: true,
            downloadLink: true,
          },
        },
      },
      orderBy: { purchasedAt: "desc" },
    });

    const mapped = userGames.map((entry) => {
      const isGameKey = entry.game.itemType === "game-key";
      const isDigital = ["game", "game-key", "disc"].includes(
        entry.game.itemType || "game",
      );

      return {
        id: entry.id,
        purchased_at: entry.purchasedAt,
        delivery_status: entry.deliveryStatus,
        delivery_method: entry.deliveryMethod,
        game: {
          id: entry.game.id,
          title: entry.game.title,
          slug: entry.game.slug,
          cover_image_url: entry.game.coverImageUrl,
          item_type: entry.game.itemType,
          platform: entry.game.platform,
        },
        access: {
          is_digital: isDigital,
          is_game_key: isGameKey,
          game_key: isGameKey ? entry.licenseKey : null,
          download_link:
            !isGameKey && isDigital ? entry.game.downloadLink : null,
        },
      };
    });

    return NextResponse.json({ data: mapped }, { status: 200 });
  } catch (error) {
    console.error("Library fetch error:", error);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Could not load library right now.",
        },
      },
      { status: 500 },
    );
  }
}
