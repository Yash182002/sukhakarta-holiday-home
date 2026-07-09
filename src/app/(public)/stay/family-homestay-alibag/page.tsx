// FILE: src/app/(public)/stay/family-homestay-alibag/page.tsx
import SchemaScript from "@/components/SchemaScript";
import { getLocationPageSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import LocationPageClient from "../LocationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_METADATA.familyHomestay;

const schema = getLocationPageSchema({
  slug: "family-homestay-alibag",
  title: "Best Family Homestay in Alibag — Spacious Rooms & Warm Hospitality",
  metaDesc:
    "Looking for a family homestay in Alibag? Sukhakarta offers spacious family halls, AC rooms, safe parking, home-cooked meals. Up to 8 guests. Book direct.",
});

const pageData = {
  badge: "Family Friendly",
  title: "Best Family Homestay in Alibag",
  subtitle:
    "Spacious rooms, a family hall for up to 8 guests, and warm Konkani hospitality — designed with families in mind.",
  intro:
    "Sukhakarta Holiday Home's Scenic Open View Hall accommodates up to 8 guests and features a large private balcony with a traditional wooden swing — perfect for family gatherings, kids playing, and evenings together after a day at the beach.",
  distance: "9 minutes",
  distanceLabel: "Drive time to Alibag Beach",
  highlights: [
    { icon: "👨‍👩‍👧‍👦", text: "Family hall for up to 8 guests" },
    { icon: "🍽️", text: "Home-cooked meals on request" },
    { icon: "❄️", text: "All rooms air-conditioned" },
    { icon: "🚗", text: "Free, safe parking" },
    { icon: "🪢", text: "Balcony with traditional swing" },
    { icon: "💰", text: "From ₹1499/night — book direct" },
  ],
  attractions: [
    { name: "Alibag Beach", note: "Safe, family-friendly walks and horse rides along the shore." },
    { name: "Nagaon Beach Water Sports", note: "Fun activities for kids and teens alike." },
    { name: "Kolaba Fort", note: "An easy, educational half-day outing for the whole family." },
    { name: "Local Markets", note: "Browse and snack on local treats together." },
  ],
  closingText:
    "Ready to plan a family trip to Alibag? Book directly at the best rates — no OTA commissions, no hidden charges. Call or WhatsApp us at +91 80875 41496.",
};

export default function Page() {
  return (
    <>
      <SchemaScript schema={schema} />
      <LocationPageClient data={pageData} />
    </>
  );
}