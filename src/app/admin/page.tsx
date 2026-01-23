"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

/* ---------------- TYPES ---------------- */

type Booking = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  total_amount: number;
  created_at: string;
};

/* ---------------- PAGE ---------------- */

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBookings(data);
    setLoading(false);
  }

  /* ---------------- APPROVE / CANCEL ---------------- */

  async function updateStatus(
    booking: Booking,
    status: "confirmed" | "cancelled"
  ) {
    setActionLoading(booking.id);

    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", booking.id);

    if (error) {
      alert(error.message);
      setActionLoading(null);
      return;
    }

    /* 🔔 AUTO WHATSAPP + EMAIL */
    const res = await fetch("/api/notify-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: booking.customer_name,
        phone: booking.phone,
        email: booking.email,
        check_in: booking.check_in,
        check_out: booking.check_out,
        total_amount: booking.total_amount,
        status,
      }),
    });

    const data = await res.json();

    if (data?.whatsappUrl) {
      window.open(data.whatsappUrl, "_blank");
    }

    /* UI UPDATE */
    setBookings(prev =>
      prev.map(b =>
        b.id === booking.id ? { ...b, status } : b
      )
    );

    setActionLoading(null);
  }

  /* ---------------- STATS ---------------- */

  const confirmedCount = bookings.filter(
    b => b.status === "confirmed"
  ).length;

  const totalRevenue = bookings
    .filter(b => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-10">

      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            Sukhakarta Holiday Home · Alibag
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/admin/block-dates"
            className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 transition"
          >
            Block Dates
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-full border border-orange-500 hover:bg-orange-500 transition"
          >
            View Website
          </Link>
        </div>
      </header>

      {/* STATS */}
      <section className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Total Bookings" value={bookings.length} accent="orange" />
        <StatCard title="Confirmed Bookings" value={confirmedCount} accent="green" />
        <StatCard title="Total Revenue" value={`₹${totalRevenue}`} accent="yellow" />
      </section>

      {/* BOOKINGS */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">
          Recent Bookings
        </h2>

        {loading && (
          <p className="text-slate-400">Loading bookings...</p>
        )}

        {!loading && bookings.length === 0 && (
          <p className="text-slate-400">No bookings yet.</p>
        )}

        <div className="space-y-4">
          {bookings.map(b => (
            <div
              key={b.id}
              className="bg-white/5 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <div className="flex flex-col lg:flex-row lg:justify-between gap-6">

                {/* LEFT */}
                <div>
                  <h3 className="text-xl font-semibold text-orange-400">
                    {b.customer_name}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {b.email} · {b.phone}
                  </p>
                  <p className="text-sm mt-2">
                    {b.check_in} → {b.check_out} · {b.guests} guests
                  </p>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <p className="text-lg font-bold">
                    ₹{b.total_amount}
                  </p>

                  <StatusBadge status={b.status} />

                  <div className="mt-4 flex gap-2 justify-end">
                    <button
                      disabled={b.status !== "pending" || actionLoading === b.id}
                      onClick={() => updateStatus(b, "confirmed")}
                      className={`px-4 py-2 rounded text-sm font-semibold ${
                        b.status === "pending"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-green-600/30 cursor-not-allowed"
                      }`}
                    >
                      Approve
                    </button>

                    <button
                      disabled={b.status === "cancelled" || actionLoading === b.id}
                      onClick={() => updateStatus(b, "cancelled")}
                      className={`px-4 py-2 rounded text-sm font-semibold ${
                        b.status !== "cancelled"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-red-600/30 cursor-not-allowed"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(b.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string | number;
  accent: "orange" | "green" | "yellow";
}) {
  const styles = {
    orange: "from-orange-500/20 to-orange-400/5 border-orange-500/30",
    green: "from-green-500/20 to-green-400/5 border-green-500/30",
    yellow: "from-yellow-500/20 to-yellow-400/5 border-yellow-500/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${styles[accent]} border rounded-2xl p-6 backdrop-blur-xl`}
    >
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-500/20 text-gray-300"
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}
