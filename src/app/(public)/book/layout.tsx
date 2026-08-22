import type { Metadata } from 'next';
import { PAGE_METADATA } from '@/lib/metadata';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = PAGE_METADATA.book;

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // AuthProvider is scoped here (and to /user/*) rather than the root layout,
  // so supabase-js stays out of the entry chunk of pages that never read auth
  // state — most importantly the homepage. /book calls useAuth(), so it needs
  // the provider.
  return <AuthProvider>{children}</AuthProvider>;
}
