import type { Metadata } from "next";
import StyledJsxRegistry from "@/lib/styled-jsx-registry";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Sukhakarta Holiday Home | Best Homestay Near Alibag Beach",
    template: "%s | Sukhakarta Holiday Home",
  },
  description:
    "Peaceful homestay in Alibag, Maharashtra. AC rooms with mountain views, just minutes from Nagaon & Varsoli Beach. Family-friendly. Book direct for best rates.",
  keywords: [
    "Alibag holiday home",
    "Alibag homestay",
    "Alibag beachfront accommodation",
    "holiday home Alibag Maharashtra",
    "Alibag beach stay",
    "Sukhakarta Holiday Home",
  ],
  alternates: {
    canonical: "https://sukhakartaholidayhome.in",
  },
  openGraph: {
    title: "Sukhakarta Holiday Home | Alibag",
    description:
      "Luxury coastal retreat in Alibag with sea views and beach access.",
    url: "https://sukhakartaholidayhome.in",
    siteName: "Sukhakarta Holiday Home",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://sukhakartaholidayhome.in/logo.webp",
        width: 1200,
        height: 630,
        alt: "Sukhakarta Holiday Home, Alibag",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sukhakarta Holiday Home | Alibag",
    description:
      "Luxury coastal retreat in Alibag with sea views and beach access.",
    images: ["https://sukhakartaholidayhome.in/logo.webp"],
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StyledJsxRegistry>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        html {
          margin: 0;
          padding: 0;
          background: #04070f;
          overflow-x: hidden;
        }

        body {
          margin: 0;
          padding: 0;
          background: #04070f;
          overflow-x: hidden;
        }

        .navbar {
          position: fixed !important;
          top: 0;
          left: 0;
          right: 0;
          z-index: 999 !important;
        }
        .mobile-overlay { z-index: 998 !important; }
        .mobile-menu    { z-index: 999 !important; }
      `}</style>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </StyledJsxRegistry>
  );
}
