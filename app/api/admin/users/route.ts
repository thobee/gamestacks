import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map users to maintain compatibility with Supabase auth list structure
    const mappedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      isAdmin: u.isAdmin,
      isVerified: u.isVerified,
      created_at: u.createdAt,
      last_sign_in_at: u.lastLoginAt,
      user_metadata: {
        full_name: u.name,
        role: u.isAdmin ? "admin" : "user",
      },
      app_metadata: {
        role: u.isAdmin ? "admin" : "user",
      },
      profile: u.profile ? {
        id: u.profile.id,
        user_id: u.profile.userId,
        bio: u.profile.bio,
        wallet_balance: u.profile.walletBalance,
        total_spent: u.profile.totalSpent,
        games_purchased: u.profile.gamesPurchased,
        rating: u.profile.rating,
        total_ratings: u.profile.totalRatings,
        country: u.profile.country,
        phone_number: u.profile.phoneNumber,
        whatsapp_number: u.profile.whatsappNumber,
        preferred_delivery_method: u.profile.preferredDeliveryMethod,
        created_at: u.profile.createdAt,
        updated_at: u.profile.updatedAt,
      } : null,
    }));

    return NextResponse.json({ data: mappedUsers });
  } catch (error) {
    console.error("Admin list users API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, isAdmin } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "userId is required" } },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
    });

    return NextResponse.json({
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      }
    });
  } catch (error) {
    console.error("Admin update user role API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}

