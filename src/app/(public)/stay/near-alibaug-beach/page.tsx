// FILE: src/app/(public)/stay/near-alibaug-beach/page.tsx
import SchemaScript from "@/components/SchemaScript";
import { getLocationPageSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import LocationPageClient from "../LocationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_METADATA.nearAlibaugBeach;

const schema = getLocationPageSchema({
  slug: "near-alibaug-beach",
  title: "Homestay Near Alibag Beach — Book Direct at Best Rates",
  metaDesc:
    "Stay near Alibag beach at Sukhakarta Holiday Home. Just 9 minutes away. Clean AC rooms, free parking, warm hospitality. From ₹1499/night. Direct booking.",
});

const pageData = {
  badge: "Near Alibag Beach",
  title: "Homestay Near Alibag Beach — Book Direct at Best Rates",
  subtitle:
    "Just 9 minutes from the iconic Alibag beach, Sukhakarta Holiday Home offers a peaceful base for your coastal getaway.",
  intro:
    "Wake up to mountain views and spend your days exploring Alibag's beautiful Konkan coastline. Alibag Beach is the town's main stretch of sand, popular for evening walks, horse rides, and beachside food stalls — and it's just minutes from our door.",
  distance: "9 minutes",
  distanceLabel: "Drive time to Alibag Beach",
  highlights: [
    { icon: "❄️", text: "All rooms air-conditioned" },
    { icon: "📶", text: "Free high-speed WiFi" },
    { icon: "🚗", text: "Free, safe parking" },
    { icon: "🏡", text: "Warm family hospitality" },
    { icon: "✅", text: "NOC approved property" },
    { icon: "💰", text: "From ₹1499/night — book direct" },
  ],
  attractions: [
    { name: "Alibag Beach", note: "The main town beach — evening walks, horse rides, and local food stalls." },
    { name: "Kolaba Fort", note: "A 17th-century sea fort reachable by foot at low tide or by boat." },
    { name: "Alibag Market", note: "Browse local shops near the town center." },
    { name: "Akshi Beach", note: "One of the cleanest, calmest beaches nearby — great for families." },
  ],
  closingText:
    "Ready to escape the city? Book directly at the best rates — no OTA commissions, no hidden charges. Call or WhatsApp us at +91 80875 41496.",
};

export default function Page() {
  return (
    <>
      <SchemaScript schema={schema} />
      <LocationPageClient data={pageData} />
    </>
  );
}