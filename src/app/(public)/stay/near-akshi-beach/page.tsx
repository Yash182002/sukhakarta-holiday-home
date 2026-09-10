import SchemaScript from "@/components/SchemaScript";
import { getLocationPageSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import LocationPageClient from "../LocationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_METADATA.nearAkshiBeach;

const schema = getLocationPageSchema({
  slug: "near-akshi-beach",
  title: "Stay Near Akshi Beach — Sukhakarta Holiday Home",
  metaDesc:
    "Stay near Akshi Beach, Alibag at Sukhakarta Holiday Home. Clean AC rooms, free WiFi, warm hospitality, close to the beach. From ₹1499/night. Book direct.",
});

const pageData = {
  badge: "Near Akshi Beach",
  title: "Stay Near Akshi Beach — Sukhakarta Holiday Home",
  subtitle:
    "Akshi Beach is one of the cleanest and calmest beaches near Alibag — a great pick for a relaxed coastal escape.",
  intro:
    "Sukhakarta Holiday Home in Kurul is conveniently located close to Akshi Beach, known for its clean sands and calm waters. It's a peaceful alternative to the busier stretches of Alibag, ideal for long walks and quiet evenings by the sea.",
  distance: "10–12 minutes",
  distanceLabel: "Drive time to Akshi Beach",
  highlights: [
    { icon: "❄️", text: "All rooms air-conditioned" },
    { icon: "📶", text: "Free high-speed WiFi" },
    { icon: "🚗", text: "Free, safe parking" },
    { icon: "🏡", text: "Warm family hospitality" },
    { icon: "✅", text: "NOC approved property" },
    { icon: "💰", text: "From ₹1499/night — book direct" },
  ],
  attractions: [
    { name: "Akshi Beach", note: "Clean sands and calm waters, ideal for peaceful walks." },
    { name: "Varsoli Beach", note: "A quiet nearby beach known for sunset views." },
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
