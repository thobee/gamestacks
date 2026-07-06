import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmail, validatePassword, hashPassword } from "@/lib/auth-utils";
import { SignUpInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName }: SignUpInput = body;

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_FIELDS",
            message: "Email, password, and full name are required",
          },
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_EMAIL",
            message: "Please provide a valid email address",
          },
        },
        { status: 422 },
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: {
            code: "WEAK_PASSWORD",
            message: passwordValidation.error,
          },
        },
        { status: 422 },
      );
    }

    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_NAME",
            message: "Full name must be between 2 and 100 characters",
          },
        },
        { status: 422 },
      );
    }

    const formattedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: "USER_EXISTS",
            message: "An account with this email already exists",
          },
        },
        { status: 409 },
      );
    }

    // Hash password and create user + profile
    const passwordHash = await hashPassword(password);
    
    // Check if it's the first user, make them admin (optional but very useful for testing)
    const usersCount = await prisma.user.count();
    const isAdmin = usersCount === 0; // First user is admin

    const user = await prisma.user.create({
      data: {
        email: formattedEmail,
        name: fullName.trim(),
        passwordHash,
        isAdmin,
        isVerified: true, // Credentials verified by default since we don't have mailer configured
        profile: {
          create: {
            bio: "",
            walletBalance: 0,
            totalSpent: 0,
            gamesPurchased: 0,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.name,
          isAdmin: user.isAdmin,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "SIGNUP_ERROR",
          message: "An unexpected error occurred during signup",
        },
      },
      { status: 500 },
    );
  }
}
