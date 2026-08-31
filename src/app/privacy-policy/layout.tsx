import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://sukhakartaholidayhome.in/privacy-policy",
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
