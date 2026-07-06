import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        message: "Logout successful",
      },
      { status: 200 },
    );

    // Clear NextAuth session cookies
    const isProd = process.env.NODE_ENV === "production";
    const sessionCookieName = isProd
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    response.cookies.set(sessionCookieName, "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 0,
    });

    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        error: {
          code: "LOGOUT_ERROR",
          message: "An unexpected error occurred during logout",
        },
      },
      { status: 500 },
    );
  }
}
