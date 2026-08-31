import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://sukhakartaholidayhome.in/cancellation-policy",
  },
};

export default function CancellationPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
