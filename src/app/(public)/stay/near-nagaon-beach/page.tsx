// FILE: src/app/(public)/stay/near-nagaon-beach/page.tsx
import SchemaScript from "@/components/SchemaScript";
import { getLocationPageSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import LocationPageClient from "../LocationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_METADATA.nearNagaonBeach;

const schema = getLocationPageSchema({
  slug: "near-nagaon-beach",
  title: "Best Homestay Near Nagaon Beach, Alibag",
  metaDesc:
    "Looking for a holiday home near Nagaon Beach, Alibag? Sukhakarta Holiday Home is just minutes away. AC rooms, free WiFi, from ₹1499/night. Book direct.",
});

const pageData = {
  badge: "Near Nagaon Beach",
  title: "Best Homestay Near Nagaon Beach, Alibag",
  subtitle:
    "Sukhakarta Holiday Home is one of the most convenient stays for guests visiting Nagaon Beach — known for its water sports and lively beach atmosphere.",
  intro:
    "Sukhakarta Holiday Home is located in Kurul, Alibag, putting you within easy reach of Nagaon Beach and all the activity it offers — jet skiing, banana boat rides, and beachside food stalls. Wake up to mountain views and be at the beach in minutes.",
  distance: "10–12 minutes",
  distanceLabel: "Drive time to Nagaon Beach",
  highlights: [
    { icon: "❄️", text: "All rooms air-conditioned" },
    { icon: "📶", text: "Free high-speed WiFi" },
    { icon: "🚗", text: "Free, safe parking" },
    { icon: "🏡", text: "Warm family hospitality" },
    { icon: "✅", text: "NOC approved property" },
    { icon: "💰", text: "From ₹1499/night — book direct" },
  ],
  attractions: [
    { name: "Nagaon Beach Water Sports", note: "Jet skiing, banana boats, and speed boat rides — Alibag's most active beach." },
    { name: "Varsoli Beach", note: "A quieter beach just a short drive further, ideal for sunset walks." },
    { name: "Alibag Market", note: "Local shops and street food near the town center." },
    { name: "Kolaba Fort", note: "The iconic 17th-century sea fort, visible at low tide." },
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