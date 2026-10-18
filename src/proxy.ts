
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect internal notification API
  if (pathname === "/api/send-notifications") {
    const provided = request.headers.get("x-internal-secret") || "";
    const expected = process.env.INTERNAL_API_SECRET || "";

    if (!expected || provided !== expected) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
  }

  // 2. Protect calendar sync cron endpoint
  if (
    pathname === "/api/sync-calendar" &&
    request.method === "GET"
  ) {
    const expected = process.env.CRON_SECRET;
    const bearer = request.headers.get("authorization");

    const ok =
      !!expected &&
      (request.headers.get("x-cron-secret") === expected ||
        bearer === `Bearer ${expected}`);

    if (!ok) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  // 3. Continue request
  const res = NextResponse.next();

  // 4. Security headers
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://checkout.razorpay.com https://cdn.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://maps.googleapis.com https://maps.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.razorpay.com https://lumberjack.razorpay.com",
      "frame-src https://www.google.com https://maps.google.com https://checkout.razorpay.com https://api.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|logo|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf)).*)",
  ],
};
