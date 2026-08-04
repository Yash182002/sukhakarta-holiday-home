import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin route protection now handled client-side in AdminLayout ──
  // (removed server-side cookie check — supabase-js stores session in
  // localStorage, not cookies, so this check always failed and caused
  // a redirect loop / infinite spinner on login)

  // ── 2. Protect internal-only API routes from external callers ──
  // NOTE: Referer/Origin headers are attacker-controlled on any non-browser
  // HTTP client (curl, Postman, server-to-server scripts can set them to
  // whatever they like), so they are NOT a real access control on their
  // own. We now require a shared secret that only our own server code
  // knows. Set INTERNAL_API_SECRET in your environment and keep it
  // private — it must match what webhook/razorpay/route.ts sends.
  if (pathname === "/api/send-notifications") {
    const provided = request.headers.get("x-internal-secret") || "";
    const expected = process.env.INTERNAL_API_SECRET || "";

    if (!expected || provided !== expected) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ── 3. Block cron endpoint from public unless CRON_SECRET matches ──
  if (pathname === "/api/sync-calendar" && request.method === "GET") {
    const secret = request.headers.get("x-cron-secret");
    const expected = process.env.CRON_SECRET;
    if (!expected || secret !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const res = NextResponse.next();

  // ── 4. Security headers on every response ──
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
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
