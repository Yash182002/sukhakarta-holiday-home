"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Stats = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
};

/* ---------- SVG Icons ---------- */
function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f97316"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="admin-spinner"
      aria-label="Loading"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
  });

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.replace("/admin/login");
      return;
    }
    loadStats();
  }

  async function loadStats() {
    // 1. Get Total Count
    const { count: totalCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    // 2. Get Pending Count
    const { count: pendingCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // 3. Get Confirmed Count
    const { count: confirmedCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed");

    // ✅ FIX: Use the counts directly instead of the undefined 'bookings' variable
    setStats({
      totalBookings: totalCount || 0,
      pendingBookings: pendingCount || 0,
      confirmedBookings: confirmedCount || 0,
    });
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <>
        <ResponsiveStyles />
        <div className="admin-center">
          <SpinnerIcon />
          <p style={{ marginTop: "1rem", color: "#94a3b8" }}>
            Loading admin dashboard
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <ResponsiveStyles />
      <main className="admin-page">
        <header className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          {/* <button onClick={handleLogout} className="admin-logout-btn">
            <LogoutIcon />
            <span>Logout</span>
          </button> */}
        </header>

        <section className="admin-grid">
          <StatCard title="Total Bookings" value={stats.totalBookings} />
          <StatCard title="Pending" value={stats.pendingBookings} />
          <StatCard title="Confirmed" value={stats.confirmedBookings} />
        </section>
      </main>
    </>
  );
}

/* ---------- Components ---------- */
function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="admin-card">
      <p className="admin-card-title">{title}</p>
      <h2 className="admin-card-value">{value}</h2>
    </div>
  );
}

/* ---------- Responsive Styles ---------- */
function ResponsiveStyles() {
  return (
    <style>{`
      /* ── Base ── */
      .admin-page {
        min-height: 100vh;
        padding: 2rem;
        background: #0f172a;
        color: #fff;
        box-sizing: border-box;
      }

      /* ── Header ── */
      .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .admin-title {
        font-size: clamp(1.25rem, 4vw, 2rem);
        font-weight: 700;
        margin: 0;
      }

      /* ── Logout button ── */
      .admin-logout-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: #f97316;
        border: none;
        padding: 0.6rem 1.1rem;
        border-radius: 8px;
        color: #fff;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 500;
        transition: background 0.2s;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .admin-logout-btn:hover {
        background: #ea6a0a;
      }

      /* ── Stats grid ── */
      .admin-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }

      /* ── Stat card ── */
      .admin-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(249, 115, 22, 0.3);
        border-radius: 16px;
        padding: 1.5rem;
        min-width: 0;
      }

      .admin-card-title {
        color: #94a3b8;
        margin: 0 0 0.5rem;
        font-size: clamp(0.8rem, 2vw, 0.95rem);
      }

      .admin-card-value {
        font-size: clamp(1.5rem, 4vw, 2rem);
        font-weight: 700;
        margin: 0;
      }

      /* ── Loading center ── */
      .admin-center {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #0f172a;
        color: #fff;
      }

      /* ── Spinner animation ── */
      @keyframes admin-spin {
        to { transform: rotate(360deg); }
      }
      .admin-spinner {
        animation: admin-spin 0.9s linear infinite;
        transform-origin: center;
      }

      /* ── Tablet: 2 columns ── */
      @media (max-width: 768px) {
        .admin-page {
          padding: 1.5rem 1rem;
        }

        .admin-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
      }

      /* ── Mobile: 1 column ── */
      @media (max-width: 480px) {
        .admin-page {
          padding: 1.25rem 0.85rem;
        }

        .admin-header {
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .admin-logout-btn {
          width: 100%;
          justify-content: center;
        }

        .admin-grid {
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        .admin-card {
          padding: 1.25rem;
        }
      }
    `}</style>
  );
}
