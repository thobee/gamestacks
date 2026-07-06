import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, validatePassword } from "@/lib/auth-utils";

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "You must be signed in to change your settings." } },
        { status: 401 }
      );
    }

    const userId = token.id as string;
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: { code: "MISSING_FIELDS", message: "Current password and new password are required" } },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: { code: "WEAK_PASSWORD", message: passwordValidation.error } },
        { status: 422 }
      );
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordCorrect = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordCorrect) {
      return NextResponse.json(
        { error: { code: "INVALID_CURRENT_PASSWORD", message: "Current password is incorrect" } },
        { status: 400 }
      );
    }

    // Hash new password and save
    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password settings error:", error);
    return NextResponse.json(
      { error: { code: "SETTINGS_UPDATE_ERROR", message: "An unexpected error occurred while updating settings." } },
      { status: 500 }
    );
  }
}
