// FILE: src/app/(public)/stay/couple-homestay-alibag/page.tsx
import SchemaScript from "@/components/SchemaScript";
import { getLocationPageSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import LocationPageClient from "../LocationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_METADATA.coupleHomestay;

const schema = getLocationPageSchema({
  slug: "couple-homestay-alibag",
  title: "Romantic Homestay in Alibag — Couple-Friendly Stay Near Beach",
  metaDesc:
    "Planning a romantic getaway to Alibag? Sukhakarta Holiday Home offers couple-friendly rooms with mountain views. Clean, private, warm hosts. From ₹1499/night.",
});

const pageData = {
  badge: "Couple Friendly",
  title: "Romantic Homestay in Alibag",
  subtitle:
    "One of the most romantic weekend destinations from Mumbai — quiet mountain view rooms with private bathrooms, perfect for couples.",
  intro:
    "Alibag is a favourite weekend escape for couples from Mumbai and Pune, and Sukhakarta Holiday Home offers the perfect couple-friendly stay. Enjoy quiet mornings on the balcony, sunset walks nearby, and genuine hospitality throughout your stay.",
  distance: "9 minutes",
  distanceLabel: "Drive time to Alibag Beach",
  highlights: [
    { icon: "🌄", text: "Quiet mountain view rooms" },
    { icon: "🛁", text: "Private bathrooms" },
    { icon: "❄️", text: "All rooms air-conditioned" },
    { icon: "🪢", text: "Balcony with traditional swing" },
    { icon: "🏡", text: "Warm, discreet hospitality" },
    { icon: "💰", text: "From ₹1499/night — book direct" },
  ],
  attractions: [
    { name: "Varsoli Beach Sunset", note: "A quiet, scenic spot for evening walks together." },
    { name: "Alibag Beach", note: "Stroll along the shore or grab a bite from local food stalls." },
    { name: "Local Restaurants", note: "Enjoy fresh Konkani seafood at a nearby beachside restaurant." },
    { name: "Kolaba Fort", note: "A relaxed half-day outing with sea views." },
  ],
  closingText:
    "Ready to plan your romantic getaway? Book directly at the best rates — no OTA commissions, no hidden charges. Call or WhatsApp us at +91 80875 41496.",
};

export default function Page() {
  return (
    <>
      <SchemaScript schema={schema} />
      <LocationPageClient data={pageData} />
    </>
  );
}