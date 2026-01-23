"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Booking = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: string;
  total_amount: number;
  created_at: string;
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setBookings(data);
        setLoading(false);
      });
  }, []);

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.total_amount || 0),
    0
  );

  const confirmedCount = bookings.filter(
    b => b.status === "confirmed"
  ).length;

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
            className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 transition-transform hover:-translate-y-1"
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
        <StatCard
          title="Total Bookings"
          value={bookings.length}
          accent="orange"
        />
        <StatCard
          title="Confirmed Bookings"
          value={confirmedCount}
          accent="green"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue}`}
          accent="yellow"
        />
      </section>

      {/* BOOKINGS LIST */}
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
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
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

                <div className="text-right">
                  <p className="text-lg font-bold">
                    ₹{b.total_amount}
                  </p>
                  <StatusBadge status={b.status} />
                  <p className="text-xs text-slate-400 mt-1">
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
  const colors = {
    orange: "from-orange-500/20 to-orange-400/5 border-orange-500/30",
    green: "from-green-500/20 to-green-400/5 border-green-500/30",
    yellow: "from-yellow-500/20 to-yellow-400/5 border-yellow-500/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[accent]} border rounded-2xl p-6 backdrop-blur-xl`}
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
