import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmail, verifyPassword } from "@/lib/auth-utils";
import jwt from "jsonwebtoken";
import { LoginInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password }: LoginInput = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_FIELDS",
            message: "Email and password are required",
          },
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: { code: "INVALID_EMAIL", message: "Invalid email address" } },
        { status: 422 },
      );
    }

    // Find user in MongoDB
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 },
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 },
      );
    }

    // Generate signed JWT for API clients
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
      process.env.NEXTAUTH_SECRET || "fallback-secret",
      { expiresIn: "30d" }
    );

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.name,
          isAdmin: user.isAdmin,
        },
        accessToken: token,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      {
        error: {
          code: "LOGIN_ERROR",
          message: "An unexpected error occurred during login",
        },
      },
      { status: 500 },
    );
  }
}
