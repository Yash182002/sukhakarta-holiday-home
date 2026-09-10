import SchemaScript from "@/components/SchemaScript";
import { getLocationPageSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import LocationPageClient from "../LocationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_METADATA.nearKihimBeach;

const schema = getLocationPageSchema({
  slug: "near-kihim-beach",
  title: "Stay Near Kihim Beach — Sukhakarta Holiday Home",
  metaDesc:
    "Looking for a stay near Kihim Beach, Alibag? Sukhakarta Holiday Home offers AC rooms, free parking, and warm hospitality close by. From ₹1499/night. Book direct.",
});

const pageData = {
  badge: "Near Kihim Beach",
  title: "Stay Near Kihim Beach — Sukhakarta Holiday Home",
  subtitle:
    "Kihim Beach is known for its casuarina groves and calm shoreline — a favourite for travellers seeking a quieter coastal retreat near Alibag.",
  intro:
    "Sukhakarta Holiday Home in Kurul is a convenient base for exploring Kihim Beach, a scenic stretch lined with casuarina trees and known for its calm, uncrowded shore — a great spot for morning and evening walks.",
  distance: "30-35 minutes",
  distanceLabel: "Drive time to Kihim Beach",
  highlights: [
    { icon: "❄️", text: "All rooms air-conditioned" },
    { icon: "📶", text: "Free high-speed WiFi" },
    { icon: "🚗", text: "Free, safe parking" },
    { icon: "🏡", text: "Warm family hospitality" },
    { icon: "✅", text: "NOC approved property" },
    { icon: "💰", text: "From ₹1499/night — book direct" },
  ],
  attractions: [
    { name: "Kihim Beach", note: "Scenic, tree-lined shore known for its calm and quiet." },
    { name: "Akshi Beach", note: "Clean beach with calm waters, a short drive away." },
    { name: "Alibag Beach", note: "The main town beach and market area." },
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
