// FILE: src/app/(public)/stay/near-varsoli-beach/page.tsx
import SchemaScript from "@/components/SchemaScript";
import { getLocationPageSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import LocationPageClient from "../LocationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_METADATA.nearVarsoliBeach;

const schema = getLocationPageSchema({
  slug: "near-varsoli-beach",
  title: "Stay Near Varsoli Beach — Sukhakarta Holiday Home",
  metaDesc:
    "Find the best homestay near Varsoli Beach, Alibag. Sukhakarta Holiday Home is close to Varsoli Beach. AC rooms, free WiFi. Book direct from ₹1499/night.",
});

const pageData = {
  badge: "Near Varsoli Beach",
  title: "Stay Near Varsoli Beach — Sukhakarta Holiday Home",
  subtitle:
    "Varsoli Beach is one of the quieter, more serene beaches near Alibag — perfect for those seeking a peaceful seaside escape.",
  intro:
    "Sukhakarta Holiday Home in Kurul is conveniently located close to Varsoli Beach, known for its clean sands, calm waters, and beautiful sunset views. It's the ideal spot for a quiet walk away from the busier tourist beaches.",
  distance: "8–10 minutes",
  distanceLabel: "Drive time to Varsoli Beach",
  highlights: [
    { icon: "❄️", text: "All rooms air-conditioned" },
    { icon: "📶", text: "Free high-speed WiFi" },
    { icon: "🚗", text: "Free, safe parking" },
    { icon: "🏡", text: "Warm family hospitality" },
    { icon: "✅", text: "NOC approved property" },
    { icon: "💰", text: "From ₹1499/night — book direct" },
  ],
  attractions: [
    { name: "Varsoli Beach", note: "Quiet, clean, and ideal for peaceful walks and sunset views." },
    { name: "Akshi Beach", note: "One of the cleanest beaches near Alibag, with calm waters." },
    { name: "Alibag Beach", note: "The main town beach, a short drive away." },
    { name: "Local Seafood Restaurants", note: "Fresh Konkani-style fish thalis near the coast." },
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