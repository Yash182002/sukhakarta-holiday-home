import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact — Sukhakarta Holiday Home Alibag",
  description:
    "Contact Sukhakarta Holiday Home in Alibag. Call or WhatsApp +91 80875 41496. Located at Aadarsh Nagar, Kurul, Alibag, Maharashtra 402209.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
