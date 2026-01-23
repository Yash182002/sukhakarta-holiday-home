"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      // Allow login page
      if (pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error || !profile) {
        console.error("Profile missing or error:", error);
        router.replace("/admin/login");
        return;
      }

      if (profile.role !== "admin") {
        router.replace("/");
        return;
      }

      setLoading(false);
    }

    checkAdmin();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Verifying admin access…
      </div>
    );
  }

  return <>{children}</>;
}
