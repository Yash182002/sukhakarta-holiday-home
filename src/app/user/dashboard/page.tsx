"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Booking = {
  id: string;
  room_id: string;
  customer_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  total_amount: number;
  created_at: string;
  room?: { name: string };
};

export default function UserDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [profile, setProfile]     = useState<any>(null);
  const observerRef               = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.setProperty("--revealed", "1");
            entry.target.classList.add("in-view");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) =>
      observerRef.current?.observe(el)
    );
  }, []);

  useEffect(() => {
    if (loading) return;
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;
    raf = requestAnimationFrame(() => { timeout = setTimeout(setupObserver, 50); });
    return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
  }, [loading, bookings, setupObserver]);

  useEffect(() => {
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push("/user/login");
    else if (user) loadUserData();
  }, [user, authLoading, router]);

  async function loadUserData() {
    setLoading(true);
    const { data: profileData } = await supabase
      .from("user_profiles").select("*").eq("id", user?.id).single();
    if (profileData) setProfile(profileData);

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`*, room:rooms(name)`)
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    if (bookingsData) setBookings(bookingsData as any);
    setLoading(false);
  }

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  function calculateNights(checkIn: string, checkOut: string) {
    return Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    );
  }

  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending   = bookings.filter((b) => b.status === "pending").length;

  if (authLoading || loading) {
    return (
      <div className="page-root">
        <Navbar />
        <div className="loading-screen">
          <div className="spinner" />
          <p>Loading your dashboard</p>
        </div>
        <Footer />
        {/* ── CHANGED: global so html/body can be targeted ── */}
        <style jsx global>{`
          html, body { background: #04070f !important; }
          .page-root { background: #04070f; min-height: 100vh; }
          .loading-screen {
            min-height: 70vh; display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 1.25rem; color: #94a3b8;
          }
          .spinner {
            width: 48px; height: 48px;
            border: 3px solid rgba(249,115,22,0.15);
            border-top-color: #f97316;
            border-radius: 50%; animation: spin 0.9s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          p { font-size: 0.95rem; letter-spacing: 0.05em; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-root">

      <div className="bg-mesh" aria-hidden="true">
        <div className="mesh-layer-1" />
        <div className="mesh-layer-2" />
        <div className="grid-overlay" />
      </div>

      <Navbar />

      <div className="dashboard">
        <div className="container">

          <div className="page-header">
            <div className="header-text">
              <div className="header-eyebrow">Dashboard</div>
              <h1 className="header-title">
                Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
              </h1>
              <p className="header-sub">Manage your reservations and stay history</p>
            </div>
            <button onClick={handleLogout} className="logout-btn desktop-only">
              Sign Out
            </button>
          </div>

          <div className="stats-grid">
            {[
              { label: "Total Bookings", value: bookings.length,  accent: "#f97316" },
              { label: "Confirmed",      value: confirmed,         accent: "#22c55e" },
              { label: "Pending",        value: pending,           accent: "#f59e0b" },
            ].map((s, i) => (
              <div
                key={i}
                className="stat-card reveal"
                style={{ "--delay": `${i * 80}ms`, "--accent": s.accent } as React.CSSProperties}
              >
                <p className="stat-label">{s.label}</p>
                <h3 className="stat-value" style={{ color: s.accent }}>{s.value}</h3>
                <div className="stat-rule" style={{ background: s.accent }} />
              </div>
            ))}
          </div>

          <div className="bookings-section">
            <div className="section-header reveal" style={{ "--delay": "0ms" } as React.CSSProperties}>
              <h2>My Reservations</h2>
              <a href="/book" className="new-booking-btn">New Booking</a>
            </div>

            {bookings.length === 0 ? (
              <div className="empty-state reveal" style={{ "--delay": "80ms" } as React.CSSProperties}>
                <div className="empty-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3>No reservations yet</h3>
                <p>Start your journey with Sukhakarta Holiday Home</p>
                <a href="/book" className="book-btn">Book Your Stay</a>
              </div>
            ) : (
              <div className="bookings-grid">
                {bookings.map((booking, i) => (
                  <div
                    key={booking.id}
                    className="booking-card reveal"
                    style={{ "--delay": `${Math.min(i * 70, 420)}ms` } as React.CSSProperties}
                  >
                    <div className={`card-accent-line status-${booking.status}`} />

                    <div className="booking-header">
                      <div>
                        <h3 className="room-name">{(booking.room as any)?.name ?? "Room"}</h3>
                        <p className="booked-on">
                          Booked {new Date(booking.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-body">
                      <div className="dates-row">
                        <div className="date-block">
                          <span className="date-label">Check-in</span>
                          <span className="date-value">
                            {new Date(booking.check_in).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="dates-separator">
                          <div className="sep-line" />
                          <span className="nights-pill">
                            {calculateNights(booking.check_in, booking.check_out)}N
                          </span>
                          <div className="sep-line" />
                        </div>
                        <div className="date-block date-block--right">
                          <span className="date-label">Check-out</span>
                          <span className="date-value">
                            {new Date(booking.check_out).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      <div className="meta-row">
                        <div className="meta-item">
                          <span className="meta-label">Guests</span>
                          <span className="meta-value">{booking.guests}</span>
                        </div>
                        <div className="meta-divider" />
                        <div className="meta-item">
                          <span className="meta-label">Nights</span>
                          <span className="meta-value">
                            {calculateNights(booking.check_in, booking.check_out)}
                          </span>
                        </div>
                        <div className="meta-divider" />
                        <div className="meta-item meta-item--amount">
                          <span className="meta-label">Total</span>
                          <span className="meta-value amount">₹{booking.total_amount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="logout-btn mobile-only">
            Sign Out
          </button>

        </div>
      </div>

      <Footer />

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── FIX: force dark background on html/body for pages outside (public) layout ── */
        html, body { background: #04070f !important; }

        .page-root {
          background: #04070f;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .bg-mesh {
          position: fixed; inset: 0; z-index: 0;
          pointer-events: none; contain: strict;
        }
        .mesh-layer-1 {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 100% 0%,   rgba(249,115,22,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 60% 45% at 0%   100%, rgba(14,165,233,0.10) 0%, transparent 55%),
            linear-gradient(160deg, #04070f 0%, #080d18 50%, #04070f 100%);
        }
        .mesh-layer-2 {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 40% at 50% 50%, rgba(249,115,22,0.04) 0%, transparent 70%);
          animation: mesh-pulse 9s ease-in-out infinite alternate;
          will-change: opacity;
        }
        @keyframes mesh-pulse { from { opacity: 0.4; } to { opacity: 1; } }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px);
          background-size: 64px 64px;
        }

        .reveal {
          opacity: 0; transform: translateY(32px);
          transition:
            opacity   0.65s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms),
            transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms);
          will-change: opacity, transform;
          contain: layout style;
        }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; contain: none; }
          .mesh-layer-2 { animation: none; }
        }

        .dashboard {
          position: relative; z-index: 1;
          padding: 2rem 1.5rem 5rem;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .container {
          max-width: 1300px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
          padding-top: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .header-eyebrow {
          font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #f97316;
          margin-bottom: 0.75rem;
          animation: fadeInDown 0.7s ease-out both;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .header-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #fff 0%, #f4d5b8 60%, #f97316 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem;
          animation: fadeInUp 0.8s ease-out 0.15s both;
        }
        .header-sub {
          color: #64748b; font-size: 0.95rem;
          margin: 0;
          animation: fadeInUp 0.8s ease-out 0.28s both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logout-btn {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          color: #f87171; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; letter-spacing: 0.02em;
          transition:
            background    0.2s ease,
            border-color  0.2s ease,
            transform     0.3s cubic-bezier(0.22,1,0.36,1);
          will-change: transform;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,0.08);
          border-color: #f87171;
          transform: translateY(-2px);
        }
        .desktop-only { display: inline-flex; }
        .mobile-only  { display: none; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-bottom: 3.5rem;
        }
        .stat-card {
          position: relative;
          padding: 1.75rem 1.5rem 1.5rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          transition:
            transform    0.35s cubic-bezier(0.22,1,0.36,1),
            border-color 0.25s ease,
            box-shadow   0.35s ease;
          will-change: transform;
        }
        .stat-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent, #f97316), transparent);
          opacity: 0.6;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255,255,255,0.14);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .stat-label {
          font-size: 0.78rem; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #64748b; margin: 0 0 0.75rem;
        }
        .stat-value {
          font-size: 2.6rem; font-weight: 700;
          line-height: 1; margin: 0 0 0.9rem;
          letter-spacing: -0.03em;
        }
        .stat-rule {
          width: 32px; height: 2px;
          border-radius: 2px; opacity: 0.7;
        }

        .bookings-section { margin-top: 0; }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .section-header h2 {
          font-size: clamp(1.4rem, 2.5vw, 1.9rem);
          font-weight: 700; color: #f8fafc; margin: 0;
          letter-spacing: -0.01em;
        }
        .new-booking-btn {
          padding: 0.65rem 1.4rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-radius: 10px; color: white;
          text-decoration: none; font-size: 0.88rem; font-weight: 600;
          transition:
            transform  0.3s cubic-bezier(0.22,1,0.36,1),
            box-shadow 0.3s ease;
          will-change: transform;
          box-shadow: 0 6px 20px rgba(249,115,22,0.3);
        }
        .new-booking-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(249,115,22,0.5);
        }

        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
        }
        .empty-icon {
          width: 72px; height: 72px; margin: 0 auto 1.5rem;
          display: flex; align-items: center; justify-content: center;
          background: rgba(249,115,22,0.08);
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 20px; color: #f97316;
        }
        .empty-state h3 {
          font-size: 1.4rem; color: #f8fafc; font-weight: 700; margin: 0 0 0.5rem;
        }
        .empty-state p {
          color: #64748b; margin: 0 0 2rem; font-size: 0.95rem;
        }
        .book-btn {
          display: inline-block;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white; text-decoration: none;
          border-radius: 12px; font-weight: 600; font-size: 0.95rem;
          transition:
            transform  0.3s cubic-bezier(0.22,1,0.36,1),
            box-shadow 0.3s ease;
          will-change: transform;
          box-shadow: 0 8px 24px rgba(249,115,22,0.35);
        }
        .book-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(249,115,22,0.5);
        }

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .booking-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          transition:
            transform    0.35s cubic-bezier(0.22,1,0.36,1),
            border-color 0.25s ease,
            box-shadow   0.35s ease;
          will-change: transform;
        }
        .booking-card:hover {
          transform: translateY(-6px);
          border-color: rgba(249,115,22,0.3);
          box-shadow: 0 20px 50px rgba(0,0,0,0.45);
        }

        .card-accent-line {
          height: 3px; width: 100%;
        }
        .card-accent-line.status-confirmed { background: linear-gradient(90deg, #22c55e, rgba(34,197,94,0.2)); }
        .card-accent-line.status-pending   { background: linear-gradient(90deg, #f59e0b, rgba(245,158,11,0.2)); }
        .card-accent-line.status-cancelled { background: linear-gradient(90deg, #ef4444, rgba(239,68,68,0.2)); }

        .booking-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 1.25rem 1.5rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 1rem;
        }
        .room-name {
          font-size: 1.15rem; font-weight: 700; color: #f8fafc;
          margin: 0 0 0.3rem; letter-spacing: -0.01em;
        }
        .booked-on {
          font-size: 0.78rem; color: #475569; margin: 0;
        }

        .status-badge {
          flex-shrink: 0;
          padding: 0.3rem 0.8rem;
          border-radius: 100px;
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .status-badge.status-confirmed {
          background: rgba(34,197,94,0.12);
          color: #4ade80;
          border: 1px solid rgba(34,197,94,0.25);
        }
        .status-badge.status-pending {
          background: rgba(245,158,11,0.12);
          color: #fbbf24;
          border: 1px solid rgba(245,158,11,0.25);
        }
        .status-badge.status-cancelled {
          background: rgba(239,68,68,0.12);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.25);
        }

        .booking-body { padding: 1.25rem 1.5rem 1.5rem; }

        .dates-row {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding: 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
        }
        .date-block {
          flex: 1; display: flex; flex-direction: column; gap: 0.3rem;
        }
        .date-block--right { text-align: right; }
        .date-label {
          font-size: 0.7rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #475569;
        }
        .date-value {
          font-size: 0.88rem; font-weight: 600; color: #cbd5e1;
        }
        .dates-separator {
          display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;
        }
        .sep-line {
          width: 20px; height: 1px;
          background: rgba(249,115,22,0.3);
        }
        .nights-pill {
          font-size: 0.68rem; font-weight: 700;
          color: #f97316;
          padding: 0.2rem 0.5rem;
          background: rgba(249,115,22,0.1);
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 100px;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .meta-row {
          display: flex; align-items: center; gap: 0;
        }
        .meta-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; gap: 0.25rem;
        }
        .meta-item--amount { flex: 1.4; }
        .meta-divider {
          width: 1px; height: 32px;
          background: rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .meta-label {
          font-size: 0.68rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.09em;
          color: #475569;
        }
        .meta-value {
          font-size: 1rem; font-weight: 700; color: #e2e8f0;
        }
        .meta-value.amount {
          color: #f97316; font-size: 1.05rem;
          letter-spacing: -0.01em;
        }

        @media (max-width: 768px) {
          .dashboard { padding: 1.5rem 1rem 4rem; }
          .page-header { margin-bottom: 2rem; padding-top: 1rem; }
          .desktop-only { display: none; }
          .mobile-only {
            display: block; width: 100%; margin-top: 2.5rem;
            padding: 1rem; border-radius: 14px;
            font-size: 1rem;
          }
          .stats-grid { grid-template-columns: 1fr; gap: 1rem; }
          .bookings-grid { grid-template-columns: 1fr; }
          .dates-row { flex-direction: column; text-align: center; gap: 0.5rem; }
          .date-block--right { text-align: center; }
          .dates-separator { width: 100%; justify-content: center; }
          .sep-line { flex: 1; }
        }
        @media (max-width: 480px) {
          .container { padding: 0 0.25rem; }
          .booking-card { border-radius: 16px; }
          .booking-header { padding: 1rem 1.25rem 0.875rem; }
          .booking-body   { padding: 1rem 1.25rem 1.25rem; }
          .stat-value     { font-size: 2.2rem; }
        }
      `}</style>
    </div>
  );
}
