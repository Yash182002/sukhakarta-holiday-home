import type { Metadata } from "next";
import TermsOfServiceContent from "./TermsOfServiceContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service and booking conditions for Sukhakarta Holiday Home in Alibag, Maharashtra.",
  alternates: {
    canonical: "/terms-of-service",
  },
};

const termsJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://sukhakartaholidayhome.in/terms-of-service#webpage",
  url: "https://sukhakartaholidayhome.in/terms-of-service",
  name: "Terms of Service | Sukhakarta Holiday Home",
  description:
    "Terms of service and booking conditions for Sukhakarta Holiday Home in Alibag, Maharashtra.",
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
      { "@type": "ListItem", position: 2, name: "Terms of Service", item: "https://sukhakartaholidayhome.in/terms-of-service" },
    ],
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
      />
      <TermsOfServiceContent />
    </>
  );
}
