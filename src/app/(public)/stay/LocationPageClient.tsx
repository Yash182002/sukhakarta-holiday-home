"use client";

import { useEffect, useCallback, useRef } from "react";
import Link from "next/link";

export type LocationPageData = {
  badge: string;
  title: string;
  subtitle: string;
  intro: string;
  distance: string;
  distanceLabel: string;
  highlights: { icon: string; text: string }[];
  attractions: { name: string; note: string }[];
  closingText: string;
};

export default function LocationPageClient({ data }: { data: LocationPageData }) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observerRef.current?.observe(el));
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setTimeout(setupObserver, 50));
    return () => cancelAnimationFrame(raf);
  }, [setupObserver]);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="location-page">
      <div className="bg-mesh" aria-hidden="true">
        <div className="mesh-layer-1" />
        <div className="mesh-layer-2" />
        <div className="grid-overlay" />
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge reveal">✦ {data.badge} ✦</div>
          <h1 className="hero-title">{data.title}</h1>
          <p className="hero-subtitle">{data.subtitle}</p>
          <div className="hero-buttons">
            <Link href="/book" className="btn btn-primary">Book Direct — Best Rates</Link>
            <Link href="/rooms" className="btn btn-ghost">Explore Rooms</Link>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Intro */}
        <section className="intro-section reveal">
          <p>{data.intro}</p>
        </section>

        {/* Distance badge */}
        <section className="distance-banner reveal">
          <span className="distance-icon">📍</span>
          <div>
            <div className="distance-value">{data.distance}</div>
            <div className="distance-label">{data.distanceLabel}</div>
          </div>
        </section>

        {/* Highlights */}
        <section className="highlights-section">
          <h2 className="section-title reveal">Why Stay at Sukhakarta</h2>
          <div className="highlights-grid">
            {data.highlights.map((h, i) => (
              <div
                key={i}
                className="highlight-card reveal"
                style={{ "--delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <span className="highlight-icon">{h.icon}</span>
                <span>{h.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Nearby attractions */}
        <section className="attractions-section">
          <h2 className="section-title reveal">Nearby Attractions</h2>
          <div className="attractions-grid">
            {data.attractions.map((a, i) => (
              <div
                key={i}
                className="attraction-card reveal"
                style={{ "--delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <h3>{a.name}</h3>
                <p>{a.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="cta-section reveal">
          <h2>Book Your Stay in Alibag</h2>
          <p>{data.closingText}</p>
          <div className="cta-actions">
            <Link href="/book" className="btn btn-primary btn-lg">Book Now</Link>
            <a href="tel:+918087541496" className="btn btn-ghost btn-lg">Call +91 80875 41496</a>
          </div>
        </section>
      </div>

      <style jsx global>{`
        /* ── PAGE BASE ── */
        .location-page {
          min-height: 100vh;
          color: #f8fafc;
          font-family: var(--font-outfit), system-ui, sans-serif;
          position: relative;
          background: #04070f;
          overflow-x: hidden;
        }

        /* ── MESH BACKGROUND (matches homepage) ── */
        .bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; contain: strict; }
        .mesh-layer-1 {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 100% 0%, rgba(249,115,22,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 0% 100%, rgba(14,165,233,0.15) 0%, transparent 60%),
            linear-gradient(160deg, #04070f 0%, #0b1220 50%, #04070f 100%);
        }
        .mesh-layer-2 {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(249,115,22,0.06) 0%, transparent 70%);
          animation: mesh-pulse 8s ease-in-out infinite alternate;
          will-change: opacity;
        }
        @keyframes mesh-pulse { from { opacity: 0.6; } to { opacity: 1; } }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── SCROLL REVEAL ── */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1) var(--delay,0ms),
                      transform 0.65s cubic-bezier(0.22,1,0.36,1) var(--delay,0ms);
        }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .mesh-layer-2 { animation: none; }
        }

        /* ── HERO ── */
        .hero { position: relative; z-index: 1; padding: 9rem 2rem 4rem; text-align: center; }
        .hero-content { max-width: 900px; margin: 0 auto; }
        .hero-badge {
          display: inline-block; font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.25em; text-transform: uppercase; color: #f97316;
          padding: 0.5rem 1.25rem; border: 1px solid rgba(249,115,22,0.4);
          border-radius: 100px; margin-bottom: 2rem; background: rgba(249,115,22,0.08);
          animation: fadeInDown 0.7s ease-out both;
        }
        .hero-title {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(2.5rem, 6.5vw, 4.5rem); font-weight: 700; line-height: 1.08;
          letter-spacing: -0.02em; margin: 0 0 1.25rem;
          background: linear-gradient(140deg, #fff 0%, #f4d5b8 50%, #f97316 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: fadeInUp 0.8s ease-out 0.15s both;
        }
        .hero-subtitle {
          font-size: clamp(1.05rem, 2.5vw, 1.35rem); color: rgba(240,244,248,0.8);
          font-weight: 300; margin: 0 auto 2.5rem; max-width: 680px;
          animation: fadeInUp 0.8s ease-out 0.3s both;
        }
        .hero-buttons {
          display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
          animation: fadeInUp 0.8s ease-out 0.45s both;
        }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }

        /* ── BUTTONS (identical to homepage .btn system) ── */
        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0.875rem 2rem; border-radius: 100px; font-size: 1rem; font-weight: 600;
          text-decoration: none; cursor: pointer; border: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          white-space: nowrap; font-family: var(--font-outfit), system-ui, sans-serif;
        }
        .btn-primary {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #fff !important;
          box-shadow: 0 8px 24px rgba(249,115,22,0.35);
        }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(249,115,22,0.5); color: #fff !important; }
        .btn-primary:active { transform: translateY(-1px); }
        .btn-ghost {
          background: rgba(255,255,255,0.08);
          color: #f0f4f8 !important;
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.14); transform: translateY(-3px); color: #f0f4f8 !important; }
        .btn-lg { padding: 1.1rem 2.75rem; font-size: 1.1rem; }

        /* ── LAYOUT ── */
        .container { max-width: 1100px; margin: 0 auto; padding: 1rem 2rem 6rem; position: relative; z-index: 1; }

        .intro-section {
          font-size: 1.15rem; line-height: 1.85; color: rgba(240,244,248,0.85);
          max-width: 780px; margin: 0 auto 2.5rem; text-align: center;
        }

        .distance-banner {
          display: flex; align-items: center; gap: 1rem; justify-content: center;
          background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.25);
          border-radius: 18px; padding: 1.5rem 2.25rem; margin-bottom: 4rem;
          max-width: 460px; margin-inline: auto;
        }
        .distance-icon { font-size: 2rem; }
        .distance-value { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.5rem; font-weight: 700; color: #f97316; }
        .distance-label { font-size: 0.9rem; color: rgba(240,244,248,0.7); }

        .section-title {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; text-align: center;
          margin-bottom: 2.25rem; color: #f8fafc;
        }

        .highlights-section { margin-bottom: 4rem; }
        .highlights-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 1rem;
        }
        .highlight-card {
          display: flex; align-items: center; gap: 0.85rem;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.15);
          border-radius: 16px; padding: 1.2rem 1.4rem; font-size: 0.95rem;
          transition: all 0.3s;
        }
        .highlight-card:hover { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.35); transform: translateY(-2px); }
        .highlight-icon { font-size: 1.4rem; }

        .attractions-section { margin-bottom: 4rem; }
        .attractions-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 1.25rem;
        }
        .attraction-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.15);
          border-radius: 18px; padding: 1.6rem; transition: all 0.3s;
        }
        .attraction-card:hover { background: rgba(249,115,22,0.06); border-color: rgba(249,115,22,0.3); transform: translateY(-3px); }
        .attraction-card h3 {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 1.3rem; margin: 0 0 0.5rem; color: #0ea5e9; font-weight: 700;
        }
        .attraction-card p { font-size: 0.92rem; color: rgba(240,244,248,0.72); margin: 0; line-height: 1.6; }

        .cta-section {
          text-align: center;
          background: linear-gradient(135deg, rgba(249,115,22,0.08), rgba(14,165,233,0.06));
          border: 1px solid rgba(249,115,22,0.25); border-radius: 24px;
          padding: 3.5rem 2rem;
        }
        .cta-section h2 {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(1.6rem, 3.5vw, 2.25rem); margin-bottom: 1rem; font-weight: 700;
        }
        .cta-section p { color: rgba(240,244,248,0.8); max-width: 600px; margin: 0 auto 2.25rem; line-height: 1.75; }
        .cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        @media (max-width: 768px) {
          .hero { padding: 7rem 1.5rem 3rem; }
          .container { padding: 1rem 1.25rem 4rem; }
          .distance-banner { flex-direction: column; text-align: center; padding: 1.5rem; }
          .hero-buttons { gap: 0.75rem; }
        }
      `}</style>
    </div>
  );
}