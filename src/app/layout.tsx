import "./globals.css";
import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";

export const metadata: Metadata = {
  metadataBase: new URL("https://sukhakartaholidayhome.in"),
  title: {
    default: "Sukhakarta Holiday Home | Alibag Beachfront Stay",
    template: "%s | Sukhakarta Holiday Home Alibag",
  },
  description:
    "Luxury beachfront holiday home in Alibag, Maharashtra. A/C rooms with sea views, 9 minutes from beach, family-friendly. Book direct for best rates.",
  twitter: {
    card: "summary_large_image",
    title: "Sukhakarta Holiday Home | Alibag Beachfront Stay",
    description:
      "Luxury beachfront holiday home in Alibag, Maharashtra. A/C rooms with sea views, 9 minutes from beach, family-friendly.",
    images: ["https://sukhakartaholidayhome.in/logo.webp"],
  },
  openGraph: {
    images: [
      {
        url: "https://sukhakartaholidayhome.in/logo.webp",
        width: 1200,
        height: 630,
        alt: "Sukhakarta Holiday Home, Alibag",
      },
    ],
  },
};

// Only two families are actually referenced by the stylesheets
// (--font-outfit for body copy, --font-cormorant for headings). Geist and
// Geist_Mono used to be declared here too; next/font emitted a
// <link rel="preload"> for each of them, so every visit fetched two font
// files that no selector ever used — bandwidth taken directly from the hero
// LCP image on the same connection.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* dns-prefetch only, deliberately NOT preconnect. The hero LCP image
            used to be fetched straight from Supabase by the browser, so warming
            DNS+TCP+TLS up front was worth it. It now goes through next/image,
            which makes it a same-origin /_next/image request and moves the
            Supabase fetch server-side. The only thing the browser still pulls
            from this host is the 32px blurred backdrops behind the room cards,
            all below the fold — and a preconnect would hold open a socket and
            run a TLS handshake in competition with the LCP request it no longer
            helps. dns-prefetch keeps the cheap part and drops the costly part. */}
        <link rel="dns-prefetch" href="https://lzyigqadbokousphuxnx.supabase.co" />
        {/* RealFaviconGenerator Favicon Links */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${cormorant.variable} ${outfit.variable} antialiased`}>
        {/* NOTE: AuthProvider deliberately does NOT live here. It statically
            imports @/lib/supabaseClient, which pulls the whole supabase-js
            bundle (auth + realtime + postgrest + storage — a single ~186 KB
            chunk containing GoTrueClient and RealtimeClient) into the entry
            chunk of every route. That included the homepage, which never reads
            auth state, and it silently defeated the dynamic import() that
            HomeClient uses to keep the same library off its critical path.
            It is now mounted only on the routes that call useAuth():
            /book and /user/*. */}
        {children}
      </body>
    </html>
  );
}
