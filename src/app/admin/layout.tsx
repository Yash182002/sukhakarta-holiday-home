"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────── SVG Icons ─────────────────────────── */

function IconDashboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconRooms() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconPlaces() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconBookings() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

function IconContent() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconViewSite() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="al-spinner" aria-label="Loading">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function IconGalleryImage() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-5-5-4 4-2-2-5 5" />
    </svg>
  )
}

/* ─────────────────────────── Nav Config ─────────────────────────── */

const NAV_ITEMS = [
  { href: "/admin",             label: "Dashboard",   icon: <IconDashboard /> },
  { href: "/admin/rooms",       label: "Rooms",       icon: <IconRooms /> },
  { href: "/admin/rates",       label: "Rates",       icon: <IconRooms /> }, 
  { href: "/admin/places",      label: "Places",      icon: <IconPlaces /> },
  { href: "/admin/bookings",    label: "Bookings",    icon: <IconBookings /> },
  { href: "/admin/blog",         label: "Blog",       icon: <IconContent /> },
  { href: "/admin/content",     label: "Content",     icon: <IconContent /> },
  { href: "/admin/calendar",    label: "Calendar",    icon: <IconCalendar /> },
  { href: "/admin/gallery",    label: "Gallery",    icon: <IconGalleryImage /> },
];

/* ─────────────────────────── Layout ─────────────────────────── */

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [sidebarOpen, setSidebarOpen]         = useState(false);

  useEffect(() => { checkAuth(); }, [pathname]);

  // Close drawer on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  async function checkAuth() {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    // ── SECURITY: being logged in is NOT enough — verify an admin role too.
    // `app_metadata` can only be written server-side (service role / Admin API),
    // so a regular customer account can never set this on themselves the way
    // they could with `user_metadata`. This must be paired with matching RLS
    // policies (see AUDIT_README) so direct API/table access is equally
    // restricted, not just this UI gate.
    const role = (session.user.app_metadata as { role?: string } | undefined)?.role;

    if (role !== "admin") {
      console.warn("[admin] Authenticated user without admin role attempted /admin access");
      await supabase.auth.signOut();
      router.replace("/admin/login");
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  const isActiveRoute = (route: string) => {
    if (route === "/admin" && pathname === "/admin") return true;
    if (route !== "/admin" && pathname.startsWith(route)) return true;
    return false;
  };

  /* Login page — no sidebar */
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  /* Loading */
  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div className="al-center">
          <IconSpinner />
          <p style={{ marginTop: "1rem", color: "#94a3b8" }}>Loading…</p>
        </div>
      </>
    );
  }

  /* Unauthenticated */
  if (!isAuthenticated) return null;

  /* Authenticated — full layout */
  return (
    <>
      <GlobalStyles />

      <div className="al-layout">

        {/* ── Mobile top bar ── */}
        <div className="al-topbar">
          <button
            className="al-hamburger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <IconClose /> : <IconMenu />}
          </button>
          <span className="al-topbar-title">Sukhakarta Admin</span>
        </div>

        {/* ── Backdrop (mobile) ── */}
        {sidebarOpen && (
          <div
            className="al-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={`al-sidebar${sidebarOpen ? " al-sidebar--open" : ""}`}>
          <div className="al-sidebar-header">
            <div className="al-logo">
              <IconLogo />
              <div className="al-logo-text">
                <h2>Sukhakarta</h2>
                <p>Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="al-nav">
            {/* ── Main nav items ── */}
            {NAV_ITEMS.map(({ href, label, icon }) => (
              <a
                key={href}
                href={href}
                className={`al-nav-item${isActiveRoute(href) ? " al-nav-item--active" : ""}`}
                title={label}
              >
                <span className="al-nav-icon">{icon}</span>
                <span className="al-nav-label">{label}</span>
              </a>
            ))}

            {/* ── Divider ── */}
            <div className="al-nav-divider" />

            {/* ── View Website ── */}
            <a
              href="/"
              target="_blank"
              className="al-nav-item al-nav-item--green"
              title="View Website"
            >
              <span className="al-nav-icon"><IconViewSite /></span>
              <span className="al-nav-label">View Website</span>
            </a>

            {/* ── Logout ── */}
            <button
              onClick={handleLogout}
              className="al-nav-item al-nav-item--red"
              title="Logout"
            >
              <span className="al-nav-icon"><IconLogout /></span>
              <span className="al-nav-label">Logout</span>
            </button>
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="al-main">{children}</main>
      </div>
    </>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */

function GlobalStyles() {
  return (
    <style>{`
      *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; overflow-x: hidden; }

      /* ── Layout shell ── */
      .al-layout {
        display: flex;
        min-height: 100vh;
        background: #0f172a;
        font-family: system-ui, -apple-system, sans-serif;
      }

      /* ── Mobile top bar (hidden on desktop) ── */
      .al-topbar {
        display: none;
        position: fixed;
        top: 0; left: 0; right: 0;
        height: 56px;
        background: #1e293b;
        border-bottom: 1px solid rgba(249,115,22,0.2);
        align-items: center;
        gap: 1rem;
        padding: 0 1rem;
        z-index: 200;
      }

      .al-topbar-title {
        font-size: 1rem;
        font-weight: 700;
        color: #fff;
        background: linear-gradient(135deg,#fff,#f97316);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .al-hamburger {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 0.4rem;
        border-radius: 8px;
        transition: background 0.2s;
      }

      .al-hamburger:hover { background: rgba(249,115,22,0.15); }

      /* ── Backdrop ── */
      .al-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.55);
        z-index: 250;
      }

      /* ── Sidebar ── */
      .al-sidebar {
        width: 260px;
        background: linear-gradient(180deg,#1e293b 0%,#0f172a 100%);
        border-right: 1px solid rgba(249,115,22,0.2);
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0; left: 0;
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 300;
        transition: width 0.25s ease, transform 0.3s ease;
      }

      /* ── Sidebar header ── */
      .al-sidebar-header {
        padding: 1.75rem 1.25rem;
        border-bottom: 1px solid rgba(249,115,22,0.2);
        flex-shrink: 0;
      }

      .al-logo { display: flex; align-items: center; gap: 0.85rem; }

      .al-logo-text h2 {
        font-size: 1.3rem;
        font-weight: 800;
        background: linear-gradient(135deg,#fff,#f97316);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .al-logo-text p { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }

      /* ── Nav ── */
      .al-nav {
        flex: 1;
        padding: 1.25rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      /* ── Divider between nav items and action buttons ── */
      .al-nav-divider {
        height: 1px;
        background: rgba(249,115,22,0.15);
        margin: 0.5rem 0.25rem;
      }

      .al-nav-item {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.85rem 1rem;
        color: #cbd5e1;
        text-decoration: none;
        border-radius: 10px;
        transition: background 0.2s, color 0.2s, transform 0.2s;
        font-weight: 500;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        /* Reset button styles */
        background: transparent;
        border: none;
        cursor: pointer;
        width: 100%;
        text-align: left;
      }

      .al-nav-item:hover {
        background: rgba(249,115,22,0.1);
        color: #f97316;
        transform: translateX(4px);
      }

      .al-nav-item--active {
        background: rgba(249,115,22,0.15);
        color: #f97316;
        border-left: 3px solid #f97316;
      }

      /* Coloured action nav items */
      .al-nav-item--green { color: #22c55e; }
      .al-nav-item--green:hover { background: rgba(34,197,94,0.1); color: #22c55e; }

      .al-nav-item--red { color: #ef4444; }
      .al-nav-item--red:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

      .al-nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 22px;
      }

      .al-nav-label { flex: 1; transition: opacity 0.2s; }

      /* ── Main content ── */
      .al-main {
        flex: 1;
        margin-left: 260px;
        padding: 2rem;
        color: white;
        min-height: 100vh;
        transition: margin-left 0.25s ease;
      }

      /* ── Loading ── */
      .al-center {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg,#0f172a 0%,#1e293b 100%);
        color: #fff;
      }

      @keyframes al-spin { to { transform: rotate(360deg); } }
      .al-spinner { animation: al-spin 0.9s linear infinite; transform-origin: center; }

      /* ══════════ Collapsed sidebar (tablet 640–968px) ══════════ */
      @media (max-width: 968px) and (min-width: 641px) {
        .al-sidebar { width: 70px; }

        .al-logo-text,
        .al-nav-label { opacity: 0; width: 0; overflow: hidden; pointer-events: none; }

        .al-nav-item { justify-content: center; padding: 0.85rem; }

        .al-main { margin-left: 70px; padding: 1.25rem; }
      }

      /* ══════════ Mobile (≤640px) ══════════ */
      @media (max-width: 640px) {
        /* Show top bar */
        .al-topbar { display: flex; }

        /* Backdrop visible when open */
        .al-backdrop { display: block; }

        /* Sidebar becomes a slide-in drawer that starts BELOW the topbar */
        .al-sidebar {
          width: 280px;
          top: 56px;
          height: calc(100vh - 56px);
          transform: translateX(-100%);
          box-shadow: 4px 0 24px rgba(0,0,0,0.5);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .al-sidebar--open { transform: translateX(0); }

        /* Backdrop also starts below the topbar */
        .al-backdrop { top: 56px; }

        /* Restore labels inside the open drawer */
        .al-logo-text,
        .al-nav-label { opacity: 1; width: auto; pointer-events: auto; }

        .al-nav-item { justify-content: flex-start; padding: 0.85rem 1rem; }

        /* Main content fills full width, padded below topbar */
        .al-main {
          margin-left: 0;
          padding: 1rem;
          padding-top: calc(56px + 1rem);
        }
      }
    `}</style>
  );
}
