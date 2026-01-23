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
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Allow login page without protection
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile || profile.role !== "admin") {
        router.replace("/");
        return;
      }

      setSessionChecked(true);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (loading && !sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Verifying admin access…
      </div>
    );
  }

  return <>{children}</>;
}
