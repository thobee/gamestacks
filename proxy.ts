import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ── Simple in-memory rate limiter ─────────────────────────────────────────────
// Note: stateless across serverless invocations — use Upstash Redis in production
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) return true;

  entry.count += 1;
  return false;
}

// ── Main Proxy ───────────────────────────────────────────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate-limit auth and payment endpoints
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/payments/initialize")
  ) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.",
          },
        },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
  }

  // Protect admin pages and admin API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isApiRoute = pathname.startsWith("/api/admin");
    const loginRedirect = new URL(`/auth/login?next=${encodeURIComponent(pathname)}`, request.url);

    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        return isApiRoute
          ? NextResponse.json(
              {
                error: {
                  code: "UNAUTHENTICATED",
                  message: "Authentication required",
                },
              },
              { status: 401 },
            )
          : NextResponse.redirect(loginRedirect);
      }

      const isAdmin = token.isAdmin === true;

      if (!isAdmin) {
        return isApiRoute
          ? NextResponse.json(
              {
                error: {
                  code: "UNAUTHORIZED",
                  message: "Admin access required",
                },
              },
              { status: 403 },
            )
          : NextResponse.redirect(loginRedirect);
      }
    } catch (error) {
      console.error("Proxy auth verification error:", error);
      return isApiRoute
        ? NextResponse.json(
            {
              error: {
                code: "SERVER_ERROR",
                message: "Server configuration error",
              },
            },
            { status: 500 },
          )
        : NextResponse.redirect(loginRedirect);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/auth/:path*",
    "/api/payments/initialize",
  ],
};
