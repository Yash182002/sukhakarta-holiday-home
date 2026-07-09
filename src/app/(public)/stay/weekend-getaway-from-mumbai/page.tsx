// FILE: src/app/(public)/stay/weekend-getaway-from-mumbai/page.tsx
import SchemaScript from "@/components/SchemaScript";
import { getLocationPageSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import LocationPageClient from "../LocationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_METADATA.weekendGetaway;

const schema = getLocationPageSchema({
  slug: "weekend-getaway-from-mumbai",
  title: "Weekend Getaway from Mumbai to Alibag — Sukhakarta Holiday Home",
  metaDesc:
    "Plan your perfect weekend getaway from Mumbai to Alibag. Stay at Sukhakarta Holiday Home. 2-3 hour drive or ferry from Gateway of India. From ₹1499/night.",
});

const pageData = {
  badge: "Weekend Getaway",
  title: "Weekend Getaway from Mumbai to Alibag",
  subtitle:
    "Alibag is just 2–3 hours away by road, or a scenic 1-hour ferry ride from Gateway of India to Mandwa.",
  intro:
    "Planning a weekend escape from Mumbai? Sukhakarta Holiday Home is the perfect base for your trip — clean AC rooms, mountain views, and warm hospitality, just minutes from Alibag's best beaches. Trade the city traffic for sea breeze in under three hours.",
  distance: "2.5–3 hours",
  distanceLabel: "Drive time from Mumbai",
  highlights: [
    { icon: "🚤", text: "1-hour ferry from Gateway of India" },
    { icon: "❄️", text: "All rooms air-conditioned" },
    { icon: "📶", text: "Free high-speed WiFi" },
    { icon: "🚗", text: "Free, safe parking" },
    { icon: "🏡", text: "Warm family hospitality" },
    { icon: "💰", text: "From ₹1499/night — book direct" },
  ],
  attractions: [
    { name: "Alibag Beach", note: "The main town beach — walks, horse rides, and food stalls." },
    { name: "Nagaon Beach", note: "Water sports and a lively beach atmosphere." },
    { name: "Varsoli Beach", note: "Quiet, scenic, perfect for sunset views." },
    { name: "Kolaba Fort", note: "A 17th-century sea fort, an easy half-day visit." },
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