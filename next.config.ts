import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";

    const securityHeaders = [
      // Prevent MIME type sniffing
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Allow Paystack checkout in an iframe, but deny all other framers
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      // Force HTTPS for 1 year (production only)
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      },
      // Control referrer information
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Restrict browser features
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(self)",
      },
      // Content Security Policy
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          // Allow connection to self, WebSockets (for dev HMR), Supabase, and Paystack
          isDev
            ? "connect-src 'self' ws: wss: https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://checkout.paystack.com"
            : "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://checkout.paystack.com",
          // Allow scripts from self + Paystack JS SDK, and unsafe-eval/unsafe-inline in development
          isDev
            ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co"
            : "script-src 'self' https://js.paystack.co",
          // Styles: self + inline
          "style-src 'self' 'unsafe-inline'",
          // Images: self + data URIs + Supabase + Cloudinary
          "img-src 'self' data: blob: https://*.supabase.co https://res.cloudinary.com",
          // Fonts: self + Google Fonts
          "font-src 'self' https://fonts.gstatic.com",
          // Allow Paystack checkout popup/redirect target
          "frame-src https://checkout.paystack.com",
          // Restrict what can embed this site
          "frame-ancestors 'self' https://checkout.paystack.com",
        ].join("; "),
      },
    ];

    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
