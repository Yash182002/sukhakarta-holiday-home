import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import StyledJsxRegistry from "@/lib/styled-jsx-registry";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Sukhakarta Holiday Home | Alibag Beachfront Stay",
    template: "%s | Sukhakarta Holiday Home Alibag",
  },
  description:
    "Luxury beachfront holiday home in Alibag, Maharashtra. A/C rooms with sea views, 9 minutes from beach, family-friendly. Book direct for best rates.",
  keywords: [
    "Alibag holiday home",
    "Alibag homestay",
    "Alibag beachfront accommodation",
    "holiday home Alibag Maharashtra",
    "Alibag beach stay",
    "Sukhakarta Holiday Home",
  ],
  openGraph: {
    title: "Sukhakarta Holiday Home | Alibag",
    description:
      "Luxury coastal retreat in Alibag with sea views and beach access.",
    url: "https://sukhakartaholidayhome.in",
    siteName: "Sukhakarta Holiday Home",
    locale: "en_IN",
    type: "website",
  },
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "Sukhakarta Holiday Home",
  "url": "https://sukhakartaholidayhome.in",
  "telephone": "+918087541496",
  "email": "sukhakartaholidayhome@gmail.com",
  "image": "https://sukhakartaholidayhome.in/logo.webp",
  "description":
    "Luxury beachfront holiday home in Alibag, Maharashtra. A/C rooms with mountain views, 9 minutes from beach, couple and family-friendly.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "House no 826, Aadarsh Nagar, Kurul",
    "addressLocality": "Alibag",
    "addressRegion": "Maharashtra",
    "postalCode": "402201",
    "addressCountry": "IN",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "18.6414",
    "longitude": "72.8722",
  },
  "priceRange": "1999 and up",
  "checkinTime": "12:00",
  "checkoutTime": "11:00",
  "sameAs": [
    "https://www.instagram.com/sukhakarta.holiday.home/",
  ],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Beach Access", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Air Conditioning", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Parking", "value": true },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://lzyigqadbokousphuxnx.supabase.co" />

        {/* JSON-LD Schema Markup — helps Google show rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />

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
      </head>
      <body>
        <StyledJsxRegistry>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
