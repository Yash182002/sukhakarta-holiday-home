import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Outfit } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";

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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

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
        <link rel="dns-prefetch" href="https://lzyigqadbokousphuxnx.supabase.co" />
        {/* RealFaviconGenerator Favicon Links */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${outfit.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
