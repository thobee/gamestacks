import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, gameId } = body;

    if (!userId || !gameId) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_FIELDS",
            message: "userId and gameId are required",
          },
        },
        { status: 400 },
      );
    }

    // Check if game exists in MongoDB using Prisma
    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
        isPublished: true,
        OR: [ { deletedAt: null }, { deletedAt: { isSet: false } } ],
      },
    });

    if (!game) {
      return NextResponse.json(
        {
          error: {
            code: "GAME_NOT_FOUND",
            message: "Game does not exist",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Item added to cart",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      {
        error: {
          code: "CART_ERROR",
          message: "Failed to add item to cart",
        },
      },
      { status: 500 },
    );
  }
}
