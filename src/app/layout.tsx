import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sukhakartaholidayhome.in'),
  title: {
    default: "Sukhakarta Holiday Home Alibag | Best Beachfront Stay in Alibag, Maharashtra",
    template: "%s | Sukhakarta Holiday Home Alibag"
  },
  description: "Experience luxury at Sukhakarta Holiday Home, the premier beachfront property in Alibag. Book your perfect coastal getaway with stunning sea views, modern amenities, and authentic Konkan hospitality. Best rates guaranteed!",
  keywords: [
    "holiday home alibag",
    "alibag holiday home",
    "sukhakarta alibag",
    "alibag beach resort",
    "alibag accommodation",
    "alibag vacation rental",
    "best holiday home in alibag",
    "luxury stay alibag",
    "alibag beachfront property",
    "alibag hotel booking",
    "beach house alibag",
    "alibag weekend getaway",
    "alibag sea view rooms",
    "konkan holiday home",
    "maharashtra beach resort",
    "alibag family resort",
    "alibag couples resort",
    "alibag budget stay",
    "alibag premium rooms"
  ],
  authors: [{ name: "Sukhakarta Holiday Home" }],
  creator: "Sukhakarta Holiday Home",
  publisher: "Sukhakarta Holiday Home",
  
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://sukhakartaholidayhome.in',
    siteName: 'Sukhakarta Holiday Home',
    title: 'Sukhakarta Holiday Home Alibag | Best Beachfront Stay in Alibag',
    description: 'Experience luxury coastal living at Alibag\'s premier holiday home. Stunning sea views, modern amenities, and authentic hospitality await you.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sukhakarta Holiday Home - Luxury Beachfront Property in Alibag',
      }
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Sukhakarta Holiday Home Alibag | Best Beachfront Stay',
    description: 'Experience luxury coastal living at Alibag\'s premier holiday home',
    images: ['/twitter-image.jpg'],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  alternates: {
    canonical: 'https://sukhakartaholidayhome.in',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              "name": "Sukhakarta Holiday Home",
              "image": "https://sukhakartaholidayhome.in/logo.png",
              "description": "Premier beachfront holiday home in Alibag offering luxury accommodation with stunning sea views, modern amenities, and authentic Konkan hospitality.",
              "url": "https://sukhakartaholidayhome.in",
              "telephone": "+91-80875-41496",
              "email": "sukhakartaholidayhome@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Alibag Beach Road",
                "addressLocality": "Alibag",
                "addressRegion": "Maharashtra",
                "postalCode": "402201",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "18.6414",
                "longitude": "72.8722"
              },
              "priceRange": "₹₹",
              "starRating": {
                "@type": "Rating",
                "ratingValue": "4.8"
              },
              "amenityFeature": [
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Beach Access",
                  "value": true
                },
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Free WiFi",
                  "value": true
                },
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Free Parking",
                  "value": true
                },
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Air Conditioning",
                  "value": true
                }
              ],
              "checkinTime": "14:00",
              "checkoutTime": "11:00",
              "petsAllowed": false,
              "smokingAllowed": false
            }),
          }}
        />
        
        {/* Additional Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Sukhakarta Holiday Home",
              "image": "https://sukhakartaholidayhome.in/logo.png",
              "priceRange": "₹₹-₹₹₹",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Alibag",
                "addressRegion": "Maharashtra",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "18.6414",
                "longitude": "72.8722"
              },
              "url": "https://sukhakartaholidayhome.in",
              "telephone": "+91-80875-41496",
              "servesCuisine": "Indian, Konkan",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                  ],
                  "opens": "00:00",
                  "closes": "23:59"
                }
              ]
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
