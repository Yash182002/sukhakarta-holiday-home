import { AuthProvider } from "@/contexts/AuthContext";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // AuthProvider is scoped to /user/* (and /book) rather than the root layout,
  // so supabase-js stays out of the entry chunk of pages that never read auth
  // state — most importantly the homepage.
  return <AuthProvider>{children}</AuthProvider>;
}
