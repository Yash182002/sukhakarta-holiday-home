/** @type {import('next').NextConfig} */
const nextConfig = {

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "@supabase/supabase-js",
      "@supabase/ssr",
    ],
  },

  images: {
    remotePatterns: [
      {
        // Tighten: only allow the specific project subdomain, not all *.supabase.co
        protocol: "https",
        hostname: "lzyigqadbokousphuxnx.supabase.co",
        pathname: "/storage/v1/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000,
    // Next 16 rejects any `quality` prop not listed here with a 400
    // ('"q" parameter (quality) of 65 is not allowed'); the default allow-list
    // is [75]. The hero slideshow asks for 65 on the LCP slide and 50 on the
    // crossfade slides behind it, so both have to be declared.
    qualities: [50, 65, 75],
    // Limit image dimensions to prevent resource exhaustion
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      // Security headers — supplementary to middleware (middleware handles dynamic routes)
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security",  value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      // Long-lived cache for immutable static assets
      // (Next.js already sets immutable Cache-Control for /_next/static —
      // overriding it breaks dev behavior, so we only handle public assets)
      {
        source: "/:path*.(woff2|woff|ttf|otf|ico|png|jpg|jpeg|svg|webp|avif)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // API routes: no caching
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, no-cache, must-revalidate" }],
      },
    ];
  },

  // Redirect http → https in production
  async redirects() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://sukhakartaholidayhome.in/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
