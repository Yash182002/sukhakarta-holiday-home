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

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}
