"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Stats = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
};

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
    const { data: bookings } = await supabase
      .from("bookings")
      .select("status");

    if (bookings) {
      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === "pending").length,
        confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
      });
    }

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Loading admin dashboard…</p>
      </div>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <section style={styles.grid}>
        <StatCard title="Total Bookings" value={stats.totalBookings} />
        <StatCard title="Pending" value={stats.pendingBookings} />
        <StatCard title="Confirmed" value={stats.confirmedBookings} />
      </section>
    </main>
  );
}

/* ---------- Components ---------- */

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <h2 style={styles.cardValue}>{value}</h2>
    </div>
  );
}

/* ---------- Styles (NO styled-jsx) ---------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "2rem",
    background: "#0f172a",
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  logoutBtn: {
    background: "#f97316",
    border: "none",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(249,115,22,0.3)",
    borderRadius: "16px",
    padding: "1.5rem",
  },
  cardTitle: {
    color: "#94a3b8",
    marginBottom: "0.5rem",
  },
  cardValue: {
    fontSize: "2rem",
    fontWeight: 700,
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    color: "#fff",
  },
};
