import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://sukhakartaholidayhome.in/cancellation-policy",
  },
};

const cancellationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://sukhakartaholidayhome.in/cancellation-policy#webpage",
  url: "https://sukhakartaholidayhome.in/cancellation-policy",
  name: "Cancellation Policy | Sukhakarta Holiday Home",
  description:
    "Cancellation and refund policy for Sukhakarta Holiday Home, Alibag: full refund 7+ days before check-in, 50% refund 3–6 days, no refund under 3 days.",
  dateModified: "2026-02-01",
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
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the refund if I cancel 7 or more days before check-in?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Full refund of the booking amount, processed within 7 business days.",
        },
      },
      {
        "@type": "Question",
        name: "What is the refund if I cancel 3 to 6 days before check-in?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "50% refund of the total booking amount.",
        },
      },
      {
        "@type": "Question",
        name: "What is the refund if I cancel less than 3 days before check-in?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No refund will be issued. The full booking amount will be forfeited.",
        },
      },
      {
        "@type": "Question",
        name: "How do I cancel my booking?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Log in to your account, go to My Dashboard → My Bookings, and send a cancellation request with your booking reference number to sukhakartaholidayhome@gmail.com.",
        },
      },
      {
        "@type": "Question",
        name: "How long do refunds take to process?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Approved refunds are processed within 7 to 10 business days and credited to the original payment method.",
        },
      },
    ],
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://sukhakartaholidayhome.in" },
      { "@type": "ListItem", position: 2, name: "Cancellation Policy", item: "https://sukhakartaholidayhome.in/cancellation-policy" },
    ],
  },
};

export default function CancellationPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cancellationJsonLd) }}
      />
      {children}
    </>
  );
}
