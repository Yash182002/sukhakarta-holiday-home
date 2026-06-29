import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Book Your Stay — Alibag Holiday Home",
  description:
    "Book direct at Sukhakarta Holiday Home Alibag. Instant confirmation, best rates guaranteed. mountain view A/C rooms available for couples, families and groups.",
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
