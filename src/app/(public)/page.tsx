import { createClient } from '@supabase/supabase-js';
import HomeClient from "./HomeClient";
import type { Metadata } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const metadata: Metadata = {
  title: "Sukhakarta Holiday Home Alibag | Luxury Beachfront Accommodation",
  description: "Experience premium coastal living at Sukhakarta Holiday Home in Alibag. Book your perfect beach getaway with stunning mountain views and modern amenities.",
};

export const revalidate = 0;

// Structured data for rich search results (Google Knowledge Panel, etc.)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "Sukhakarta Holiday Home",
  "description": "Luxury coastal holiday home in Alibag, Maharashtra offering premium rooms with beach access, modern amenities and authentic hospitality.",
  "url": "https://sukhakartaholidayhome.in",
  "telephone": "+918087541496",
  "email": "sukhakartaholidayhome@gmail.com",
  "image": "https://sukhakartaholidayhome.in/logo.webp",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "House no 826, Aadarsh Nagar, Kurul",
    "addressLocality": "Alibag",
    "addressRegion": "Maharashtra",
    "postalCode": "402209",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 18.6414,
    "longitude": 72.8722
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "07:00",
      "closes": "23:00"
    }
  ],
  "checkinTime": "12:00",
  "checkoutTime": "11:00",
  "priceRange": "₹₹",
  "currenciesAccepted": "INR",
  "paymentAccepted": "Cash, Credit Card, UPI",
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Beach Access", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Air Conditioning", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Parking", "value": true }
  ],
  "sameAs": [
    "https://www.instagram.com/sukhakarta.holiday.home/"
  ]
};

export default async function HomePage() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const [roomsResult, contentResult] = await Promise.all([
      supabase
        .from("rooms")
        .select("id, name, base_price, max_guests, description, images, amenities")
        .order("created_at", { ascending: true }),
      supabase
        .from("homepage_content")
        .select("*")
        .order("section"),
    ]);

    if (roomsResult.error) console.error("Error fetching rooms:", roomsResult.error);
    if (contentResult.error) console.error("Error fetching content:", contentResult.error);

    return (
      <>
        {/* JSON-LD structured data — helps Google show rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <HomeClient
          rooms={roomsResult.data || []}
          initialContent={contentResult.data || []}
        />
      </>
    );
  } catch (error) {
    console.error("Unexpected error fetching data:", error);
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <HomeClient rooms={[]} initialContent={[]} />
      </>
    );
  }
}
