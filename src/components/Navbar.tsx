"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const navLinks = [
  { name: "Home",       href: "/" },
  { name: "Rooms",      href: "/rooms" },
  { name: "Book Now",   href: "/book" },
  { name: "Gallery",    href: "/gallery" },
  { name: "Places",     href: "/places" },
  { name: "About",      href: "/about" },
  { name: "Contact",    href: "/contact" },
  { name: "Blogs",    href: "/blog" },
  { name: "My Account", href: "/user/dashboard" },
];

const NAV_H        = 68;
const NAV_H_MOBILE = 64;

export default function Navbar() {
  const pathname                  = usePathname();
  const [open, setOpen]           = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [hovered, setHovered]     = useState<string | null>(null);
  const pillRef                   = useRef<HTMLSpanElement>(null);
  const navRef                    = useRef<HTMLElement>(null);

  useEffect(() => { setMounted(true); }, []);

  /* scroll */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrolled(window.scrollY > 40); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* body lock */
  useEffect(() => {
    document.body.style.overflow    = open ? "hidden" : "";
    document.body.style.touchAction = open ? "none"   : "";
    return () => { document.body.style.overflow = ""; document.body.style.touchAction = ""; };
  }, [open]);

  /* hover pill tracker */
  const handleLinkHover = (href: string, el: HTMLElement) => {
    setHovered(href);
    if (pillRef.current && navRef.current) {
      const navRect  = navRef.current.getBoundingClientRect();
      const linkRect = el.getBoundingClientRect();
      pillRef.current.style.left  = `${linkRect.left - navRect.left}px`;
      pillRef.current.style.width = `${linkRect.width}px`;
    }
  };

  return (
    <>
      {/* ════════════ HEADER ════════════ */}
      <header className={`nb-root${scrolled ? " nb-scrolled" : ""}${mounted ? " nb-mounted" : ""}${open ? " nb-drawer-open" : ""}`}>

        {/* shimmer line at top */}
        <div className="nb-top-shimmer" aria-hidden="true" />

        <div className="nb-container">

          {/* Logo */}
          <Link href="/" className="nb-logo" onClick={() => setOpen(false)}>
            <span className="nb-logo-glow" aria-hidden="true" />
            <Image
              src="/logo.webp"
              alt="Sukhakarta Holiday Home"
              width={130} height={54} priority
              style={{ height: "auto", width: "auto", maxHeight: 46, position: "relative", zIndex: 1 }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="nb-desktop-nav" ref={navRef} aria-label="Main navigation"
            onMouseLeave={() => setHovered(null)}>
            {/* floating hover pill */}
            <span
              ref={pillRef}
              className={`nb-hover-pill${hovered ? " nb-hover-pill--visible" : ""}`}
              aria-hidden="true"
            />
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nb-link${pathname === link.href ? " nb-link--active" : ""}`}
                style={{ animationDelay: `${i * 55}ms` }}
                onMouseEnter={e => handleLinkHover(link.href, e.currentTarget)}
              >
                <span className="nb-link-text">{link.name}</span>
                {pathname === link.href && <span className="nb-active-dot" aria-hidden="true" />}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <Link href="/book" className="nb-cta nb-cta--desktop">
            <span className="nb-cta-shimmer" aria-hidden="true" />
            <span className="nb-cta-text">Book Your Stay</span>
            <span className="nb-cta-arrow"></span>
          </Link>

          {/* Hamburger */}
          <button
            className={`nb-hamburger${open ? " nb-hamburger--open" : ""}`}
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className="nb-bar" />
            <span className="nb-bar" />
            <span className="nb-bar nb-bar--short" />
          </button>
        </div>
      </header>

      {/* Spacer */}
      <div className="nb-spacer" aria-hidden="true" />

      {/* Overlay */}
      {open && <div className="nb-overlay" onClick={() => setOpen(false)} aria-hidden="true" />}

      {/* Drawer */}
      <div className={`nb-drawer${open ? " nb-drawer--open" : ""}`} aria-hidden={!open}>

        {/* drawer top gradient bar */}
        <div className="nb-drawer-accent" aria-hidden="true" />

        <div className="nb-drawer-header">
          <Image src="/logo.webp" alt="Sukhakarta Holiday Home"
            width={120} height={50} loading="lazy"
            style={{ height: "auto", width: "auto", maxHeight: 42 }}
          />
        </div>

        <nav className="nb-drawer-nav" aria-label="Mobile navigation">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nb-drawer-link${pathname === link.href ? " nb-drawer-link--active" : ""}`}
              onClick={() => setOpen(false)}
              style={{ animationDelay: open ? `${i * 45}ms` : "0ms" }}
            >
              <span className="nb-drawer-link-num">0{i + 1}</span>
              <span className="nb-drawer-link-name">{link.name}</span>
              <span className="nb-drawer-link-arrow"></span>
            </Link>
          ))}
        </nav>

        <div className="nb-drawer-footer">
          <Link href="/book" className="nb-cta nb-cta--mobile" onClick={() => setOpen(false)}>
            <span className="nb-cta-shimmer" aria-hidden="true" />
            <span className="nb-cta-text">Book Your Stay Now</span>
            <span className="nb-cta-arrow"></span>
          </Link>
          <p className="nb-drawer-tagline">Your coastal paradise awaits ✦</p>
        </div>
      </div>

      {/* ════════════ STYLES ════════════ */}
      <style jsx global>{`

        /* ── Spacer ── */
        .nb-spacer { height: ${NAV_H}px; flex-shrink: 0; }

        /* ── Root bar ── */
        .nb-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 999;
          height: ${NAV_H}px;
          display: flex;
          align-items: center;
          background: transparent;
          font-family: var(--font-outfit, system-ui, sans-serif);
          transition:
            background   0.5s cubic-bezier(0.22,1,0.36,1),
            box-shadow   0.5s ease,
            border-color 0.5s ease,
            height       0.4s ease;
        }

        /* thin shimmer line at very top */
        .nb-top-shimmer {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(249,115,22,0.0) 15%,
            rgba(249,115,22,0.7) 40%,
            rgba(251,191,36,0.9) 50%,
            rgba(249,115,22,0.7) 60%,
            rgba(249,115,22,0.0) 85%,
            transparent 100%
          );
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .nb-scrolled .nb-top-shimmer { opacity: 1; }

        /* scrolled state */
        .nb-scrolled {
          background: rgba(5, 8, 18, 0.88);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          box-shadow:
            0 1px 0 rgba(249,115,22,0.15),
            0 8px 40px rgba(0,0,0,0.55),
            0 2px 0 rgba(251,191,36,0.04) inset;
        }

        /* mount animation */
        .nb-root { opacity: 0; transform: translateY(-6px); }
        .nb-mounted { opacity: 1; transform: translateY(0); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1), background 0.5s ease, box-shadow 0.5s ease; }

        /* ── Container ── */
        .nb-container {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
        }

        /* ── Logo ── */
        .nb-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          text-decoration: none;
          margin-right: 2rem;
          position: relative;
          transition: opacity 0.3s ease;
        }
        .nb-logo-glow {
          position: absolute;
          inset: -8px;
          background: radial-gradient(ellipse at center, rgba(249,115,22,0.18) 0%, transparent 70%);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .nb-logo:hover .nb-logo-glow { opacity: 1; }
        .nb-logo:hover img { filter: drop-shadow(0 0 12px rgba(249,115,22,0.5)); }
        .nb-logo img { transition: filter 0.3s ease; }

        /* ── Desktop nav ── */
        .nb-desktop-nav {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-right: 1.5rem;
          position: relative;
        }

        /* floating hover pill that tracks cursor */
        .nb-hover-pill {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          height: 36px;
          border-radius: 10px;
          background: rgba(249,115,22,0.1);
          border: 1px solid rgba(249,115,22,0.2);
          pointer-events: none;
          opacity: 0;
          transition:
            left   0.28s cubic-bezier(0.22,1,0.36,1),
            width  0.28s cubic-bezier(0.22,1,0.36,1),
            opacity 0.18s ease;
          z-index: 0;
        }
        .nb-hover-pill--visible { opacity: 1; }

        /* ── Nav link ── */
        .nb-link {
          position: relative;
          z-index: 1;
          padding: 0.55rem 0.9rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(248,250,252,0.75);
          text-decoration: none;
          border-radius: 10px;
          white-space: nowrap;
          letter-spacing: 0.025em;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          /* staggered entrance */
          opacity: 0;
          animation: nbLinkIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
          transition: color 0.2s ease;
        }
        @keyframes nbLinkIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: none; }
        }
        .nb-link:hover { color: #fff; }
        .nb-link--active { color: #f97316 !important; }
        .nb-link-text { position: relative; z-index: 1; }

        /* active dot */
        .nb-active-dot {
          display: block;
          width: 4px; height: 4px;
          background: #f97316;
          border-radius: 50%;
          margin-top: 3px;
          box-shadow: 0 0 6px rgba(249,115,22,0.8);
          animation: nbDotPop 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes nbDotPop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* ── CTA button ── */
        .nb-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.4rem;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%);
          color: #fff !important;
          font-size: 0.875rem;
          font-weight: 700;
          text-decoration: none;
          border-radius: 100px;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.03em;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(249,115,22,0.5),
            0 4px 20px rgba(249,115,22,0.4),
            0 1px 0 rgba(255,255,255,0.15) inset;
          transition:
            transform    0.28s cubic-bezier(0.22,1,0.36,1),
            box-shadow   0.28s ease;
        }
        .nb-cta:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow:
            0 0 0 1px rgba(249,115,22,0.7),
            0 8px 32px rgba(249,115,22,0.6),
            0 1px 0 rgba(255,255,255,0.2) inset;
        }
        .nb-cta:hover .nb-cta-shimmer { left: 110%; }
        /* shimmer sweep on hover */
        .nb-cta-shimmer {
          position: absolute;
          top: 0; bottom: 0;
          left: -60%;
          width: 50%;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);
          transition: left 0.5s ease;
          pointer-events: none;
        }
        .nb-cta-text { position: relative; z-index: 1; }
        .nb-cta-arrow {
          position: relative; z-index: 1;
          font-size: 1rem;
          transition: transform 0.25s ease;
        }
        .nb-cta:hover .nb-cta-arrow { transform: translateX(3px); }
        .nb-cta--mobile {
          width: 100%;
          justify-content: center;
          border-radius: 14px;
          padding: 1rem 1.5rem;
          font-size: 1rem;
        }

        /* ── Hamburger ── */
        .nb-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          gap: 6px;
          width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          margin-left: auto;
          padding: 4px;
        }
        .nb-bar {
          display: block;
          height: 2px;
          background: linear-gradient(90deg, #f97316, #fbbf24);
          border-radius: 2px;
          transition:
            transform 0.38s cubic-bezier(0.22,1,0.36,1),
            opacity   0.25s ease,
            width     0.3s ease;
        }
        .nb-bar:nth-child(1) { width: 24px; }
        .nb-bar:nth-child(2) { width: 18px; }
        .nb-bar--short       { width: 12px; }
        .nb-hamburger:hover .nb-bar { background: linear-gradient(90deg, #fbbf24, #f97316); }
        .nb-hamburger:hover .nb-bar:nth-child(2) { width: 24px; }
        .nb-hamburger:hover .nb-bar--short       { width: 24px; }
        .nb-hamburger--open .nb-bar:nth-child(1) { transform: translateY(8px) rotate(45deg); width: 24px; }
        .nb-hamburger--open .nb-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nb-hamburger--open .nb-bar--short       { transform: translateY(-8px) rotate(-45deg); width: 24px; }

        /* ── Overlay ── */
        .nb-overlay {
          position: fixed; inset: 0;
          z-index: 1001;
          background: rgba(3,6,14,0.8);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: nbFadeIn 0.25s ease-out both;
        }
        @keyframes nbFadeIn { from { opacity:0; } to { opacity:1; } }

        /* ── Drawer ── */
        .nb-drawer {
          position: fixed;
          top: 0; right: 0;
          z-index: 1002;
          width: 70vw;
          max-width: 420px;
          height: 100dvh;
          background: #060c1a;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.42s cubic-bezier(0.22,1,0.36,1);
          font-family: var(--font-outfit, system-ui, sans-serif);
          overflow-y: auto;
          scrollbar-width: none;
          box-shadow: -16px 0 64px rgba(0,0,0,0.8);
        }
        .nb-drawer::-webkit-scrollbar { display: none; }
        .nb-drawer--open { transform: translateX(0); }

        /* top accent gradient bar */
        .nb-drawer-accent {
          height: 3px;
          background: linear-gradient(90deg, #c2410c, #f97316, #fbbf24, #f97316, #c2410c);
          background-size: 200% 100%;
          animation: nbGoldSlide 3s linear infinite;
          flex-shrink: 0;
        }
        @keyframes nbGoldSlide {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }

        /* when drawer open, drop header behind drawer */
        .nb-drawer-open { z-index: 998 !important; }

        /* hide only the navbar header logo when drawer is open — drawer has its own logo */
        .nb-drawer-open .nb-logo { opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
        .nb-drawer-open .nb-logo img { visibility: hidden; }
        .nb-drawer-open {
          background: rgba(3, 6, 14, 0.97) !important;
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
        }

        .nb-drawer-header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 0 1.5rem;
          height: ${NAV_H_MOBILE}px;
          flex-shrink: 0;
          background: #060c1a;
          border-bottom: 1px solid rgba(249,115,22,0.12);
        }

        /* ── Drawer nav links ── */
        .nb-drawer-nav {
          display: flex;
          flex-direction: column;
          padding: 1.25rem 1rem;
          gap: 0.2rem;
          flex: 1;
        }
        .nb-drawer-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: rgba(248,250,252,0.65);
          text-decoration: none;
          border-radius: 12px;
          border: 1px solid transparent;
          position: relative;
          overflow: hidden;
          /* stagger in when drawer opens */
          opacity: 0;
          transform: translateX(20px);
          animation: none;
          transition:
            background   0.25s ease,
            color        0.25s ease,
            border-color 0.25s ease,
            transform    0.25s ease,
            opacity      0.25s ease;
        }
        .nb-drawer--open .nb-drawer-link {
          animation: nbSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes nbSlideIn {
          from { opacity:0; transform: translateX(24px); }
          to   { opacity:1; transform: translateX(0); }
        }
        .nb-drawer-link:hover {
          background: rgba(249,115,22,0.08);
          color: #f97316;
          border-color: rgba(249,115,22,0.2);
          transform: translateX(4px);
        }
        .nb-drawer-link--active {
          background: rgba(249,115,22,0.1);
          color: #f97316;
          border-color: rgba(249,115,22,0.3);
        }
        .nb-drawer-link-num {
          font-size: 0.68rem;
          font-weight: 800;
          color: rgba(249,115,22,0.5);
          letter-spacing: 0.05em;
          min-width: 22px;
          transition: color 0.2s ease;
        }
        .nb-drawer-link:hover .nb-drawer-link-num,
        .nb-drawer-link--active .nb-drawer-link-num { color: #f97316; }
        .nb-drawer-link-name { flex: 1; }
        .nb-drawer-link-arrow {
          font-size: 0.9rem;
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.2s, transform 0.25s ease;
        }
        .nb-drawer-link:hover .nb-drawer-link-arrow,
        .nb-drawer-link--active .nb-drawer-link-arrow {
          opacity: 1; transform: translateX(0);
        }

        /* ── Drawer footer ── */
        .nb-drawer-footer {
          padding: 1.25rem 1.5rem 2rem;
          border-top: 1px solid rgba(249,115,22,0.1);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .nb-drawer-tagline {
          text-align: center;
          font-size: 0.78rem;
          color: rgba(249,115,22,0.5);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 1200px) {
          .nb-link { font-size: 0.82rem; padding: 0.5rem 0.7rem; }
          .nb-cta--desktop { padding: 0.6rem 1.1rem; font-size: 0.82rem; }
        }
        @media (max-width: 960px) {
          .nb-desktop-nav { display: none; }
          .nb-cta--desktop { display: none; }
          .nb-hamburger { display: flex; }
          .nb-root { height: ${NAV_H_MOBILE}px; }
          .nb-spacer { height: ${NAV_H_MOBILE}px; }
          .nb-container { padding: 0 1.25rem; }
        }
        @media (max-width: 480px) {
          .nb-container { padding: 0 1rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .nb-root, .nb-link, .nb-cta, .nb-hamburger,
          .nb-bar, .nb-drawer, .nb-overlay,
          .nb-drawer-accent, .nb-hover-pill {
            transition: none !important;
            animation: none !important;
          }
          .nb-root { opacity: 1; transform: none; }
          .nb-link { opacity: 1; transform: none; }
          .nb-drawer-link { opacity: 1; transform: none; }
        }

        /* page-level overrides */
        .home-page .hero {
          padding-top: 0 !important;
          min-height: calc(100svh - ${NAV_H}px) !important;
        }
        .rooms-page .hero,
        .booking-page .hero,
        .contact-page .hero,
        .about-page .hero,
        .places-page .hero,
        .gallery-page .gl-hero {
          padding-top: 3rem !important;
        }
      `}</style>
    </>
  );
}
