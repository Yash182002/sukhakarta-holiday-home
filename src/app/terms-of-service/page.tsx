import type { Metadata } from "next";
import TermsOfServiceContent from "./TermsOfServiceContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for booking and staying at Sukhakarta Holiday Home in Alibag, Maharashtra.",
};

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}
