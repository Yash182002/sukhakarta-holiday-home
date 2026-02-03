"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ 1. Stable Auth Check with Mounted Guard
  const checkAuth = useCallback(async (isMounted: () => boolean) => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (!isMounted()) return; // Stop if unmounted

      if (data.session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Only redirect if not already on login page to prevent loops
        if (pathname !== "/admin/login") {
          router.replace("/admin/login");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      if (isMounted() && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    } finally {
      if (isMounted()) setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    checkAuth(isMounted);

    // ✅ 2. Listen for Auth State Changes (More robust than checking on every path)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        router.replace("/admin/login");
      } else if (session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      mounted = false; // Cleanup flag
      subscription.unsubscribe();
    };
  }, [checkAuth, router]);

  if (loading) {
    return <div className="admin-loading">Loading admin panel...</div>;
  }

  // Prevent flashing protected content
  if (!isAuthenticated && pathname !== "/admin/login") {
    return null;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar/Nav would go here */}
      <main>{children}</main>
    </div>
    );
}

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html,
        body {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }

        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #0f172a;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          border-right: 1px solid rgba(249, 115, 22, 0.2);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          font-size: 2.5rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .logo-text h2 {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .logo-text p {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0;
        }

        .nav-menu {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          color: #cbd5e1;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.3s;
          font-weight: 500;
        }

        .nav-item:hover {
          background: rgba(249, 115, 22, 0.1);
          color: #f97316;
          transform: translateX(5px);
        }

        .nav-item.active {
          background: rgba(249, 115, 22, 0.15);
          color: #f97316;
          border-left: 3px solid #f97316;
        }

        .nav-icon {
          font-size: 1.5rem;
        }

        .sidebar-footer {
          padding: 1.5rem 1rem;
          border-top: 1px solid rgba(249, 115, 22, 0.2);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .logout-btn,
        .view-site-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          width: 100%;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .view-site-btn {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateX(5px);
        }

        .view-site-btn:hover {
          background: rgba(34, 197, 94, 0.2);
          transform: translateX(5px);
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 2rem;
          color: white;
          min-height: 100vh;
        }

        @media (max-width: 968px) {
          .sidebar {
            width: 80px;
          }

          .logo-text,
          .nav-item span:not(.nav-icon),
          .logout-btn span:not(.nav-icon),
          .view-site-btn span:not(.nav-icon) {
            display: none;
          }

          .nav-item,
          .logout-btn,
          .view-site-btn {
            justify-content: center;
          }

          .main-content {
            margin-left: 80px;
            padding: 1rem;
          }
        }

        @media (max-width: 640px) {
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
          }

          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  );
}
