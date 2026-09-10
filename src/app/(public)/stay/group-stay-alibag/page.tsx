import SchemaScript from "@/components/SchemaScript";
import { getLocationPageSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import LocationPageClient from "../LocationPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_METADATA.groupStayAlibag;

const schema = getLocationPageSchema({
  slug: "group-stay-alibag",
  title: "Group Stay in Alibag — Sukhakarta Holiday Home",
  metaDesc:
    "Planning a group trip to Alibag? Sukhakarta Holiday Home has spacious rooms and a family hall for large groups. Free parking, home-cooked meals. Book direct.",
});

const pageData = {
  badge: "Group Stays",
  title: "Group Stay in Alibag — Sukhakarta Holiday Home",
  subtitle:
    "Traveling with friends or an extended family group? Sukhakarta Holiday Home has the space and flexibility to host you comfortably.",
  intro:
    "Sukhakarta Holiday Home in Kurul, Alibag is well suited for group trips — with multiple AC rooms plus a spacious family hall that can accommodate up to 8 guests, it's an easy base for friend groups, family reunions, or team getaways.",
  distance: "9 minutes",
  distanceLabel: "Drive time to Alibag Beach",
  highlights: [
    { icon: "🛏️", text: "Multiple rooms + family hall for large groups" },
    { icon: "❄️", text: "All rooms air-conditioned" },
    { icon: "📶", text: "Free high-speed WiFi" },
    { icon: "🚗", text: "Free, safe parking for multiple vehicles" },
    { icon: "🍽️", text: "Home-cooked meals on request" },
    { icon: "💰", text: "From ₹1499/night — book direct" },
  ],
  attractions: [
    { name: "Alibag Beach", note: "The main town beach, just minutes away." },
    { name: "Kolaba Fort", note: "A historic sea fort accessible at low tide — great for group outings." },
    { name: "Varsoli Beach", note: "Quiet beach ideal for group photos and sunset time." },
    { name: "Local Seafood Restaurants", note: "Group-friendly Konkani-style thalis near the coast." },
  ],
  closingText:
    "Planning a group getaway? Book directly at the best rates — no OTA commissions, no hidden charges. Call or WhatsApp us at +91 80875 41496.",
};

export default function Page() {
  return (
    <>
      <SchemaScript schema={schema} />
      <LocationPageClient data={pageData} />
    </>
  );
}
