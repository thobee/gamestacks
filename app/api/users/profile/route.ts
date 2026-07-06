import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "You must be signed in to view your profile." } },
        { status: 401 }
      );
    }

    const userId = token.id as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: "USER_NOT_FOUND", message: "User not found." } },
        { status: 404 }
      );
    }

    // Lazily create user profile if it doesn't exist
    let profile = user.profile;
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          bio: "",
          walletBalance: 0,
          totalSpent: 0,
          gamesPurchased: 0,
          country: "NG",
          preferredDeliveryMethod: "digital",
        },
      });
    }

    return NextResponse.json({
      data: {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        profile: {
          id: profile.id,
          bio: profile.bio || "",
          walletBalance: profile.walletBalance,
          totalSpent: profile.totalSpent,
          gamesPurchased: profile.gamesPurchased,
          country: profile.country,
          phoneNumber: profile.phoneNumber || "",
          whatsappNumber: profile.whatsappNumber || "",
          preferredDeliveryMethod: profile.preferredDeliveryMethod,
        },
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Fetch profile API error:", error);
    return NextResponse.json(
      { error: { code: "PROFILE_FETCH_ERROR", message: "Failed to fetch user profile." } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "You must be signed in to update your profile." } },
        { status: 401 }
      );
    }

    const userId = token.id as string;
    const body = await request.json();
    const { name, bio, phoneNumber, whatsappNumber, country, preferredDeliveryMethod } = body;

    // Ensure the profile record exists first before running nested update
    const profileExists = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profileExists) {
      await prisma.userProfile.create({
        data: {
          userId,
          bio: bio || "",
          phoneNumber: phoneNumber || "",
          whatsappNumber: whatsappNumber || "",
          country: country || "NG",
          preferredDeliveryMethod: preferredDeliveryMethod || "digital",
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        profile: {
          update: {
            bio: bio !== undefined ? bio : undefined,
            phoneNumber: phoneNumber !== undefined ? phoneNumber : undefined,
            whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : undefined,
            country: country !== undefined ? country : undefined,
            preferredDeliveryMethod: preferredDeliveryMethod !== undefined ? preferredDeliveryMethod : undefined,
          },
        },
      },
      include: { profile: true },
    });

    const profile = updatedUser.profile!;

    return NextResponse.json({
      message: "Profile updated successfully",
      data: {
        id: updatedUser.id,
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        profile: {
          id: profile.id,
          bio: profile.bio || "",
          walletBalance: profile.walletBalance,
          totalSpent: profile.totalSpent,
          gamesPurchased: profile.gamesPurchased,
          country: profile.country,
          phoneNumber: profile.phoneNumber || "",
          whatsappNumber: profile.whatsappNumber || "",
          preferredDeliveryMethod: profile.preferredDeliveryMethod,
        },
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Update profile API error:", error);
    return NextResponse.json(
      { error: { code: "PROFILE_UPDATE_ERROR", message: "Failed to update profile details." } },
      { status: 500 }
    );
  }
}
