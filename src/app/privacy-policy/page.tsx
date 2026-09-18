import type { Metadata } from "next";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Sukhakarta Holiday Home, our beachfront holiday home in Alibag, Maharashtra.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

const privacyJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://sukhakartaholidayhome.in/privacy-policy#webpage",
  url: "https://sukhakartaholidayhome.in/privacy-policy",
  name: "Privacy Policy | Sukhakarta Holiday Home",
  description:
    "Privacy policy for Sukhakarta Holiday Home, our beachfront holiday home in Alibag, Maharashtra.",
  isPartOf: {
    "@type": "WebSite",
    url: "https://sukhakartaholidayhome.in",
    name: "Sukhakarta Holiday Home",
  },
  about: {
    "@type": "LodgingBusiness",
    "@id": "https://sukhakartaholidayhome.in/#business",
    name: "Sukhakarta Holiday Home",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://sukhakartaholidayhome.in" },
      { "@type": "ListItem", position: 2, name: "Privacy Policy", item: "https://sukhakartaholidayhome.in/privacy-policy" },
    ],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }}
      />
      <PrivacyPolicyContent />
    </>
  );
}
