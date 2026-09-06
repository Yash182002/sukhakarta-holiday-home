import type { Metadata } from "next";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Sukhakarta Holiday Home, our beachfront holiday home in Alibag, Maharashtra.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
