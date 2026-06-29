"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

type ContentSection = {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  stats?: Array<{ label: string; value: string }>;
  values_list?: Array<{ title: string; description: string; icon: string }>;
};

type AboutClientProps = {
  initialHero:   ContentSection | null;
  initialStory:  ContentSection | null;
  initialValues: ContentSection | null;
};

export default function AboutClient({ initialHero, initialStory, initialValues }: AboutClientProps) {
  // Seed from SSR — no loading flash on first paint
  const [heroContent, setHeroContent]     = useState<ContentSection | null>(initialHero);
  const [storyContent, setStoryContent]   = useState<ContentSection | null>(initialStory);
  const [valuesContent, setValuesContent] = useState<ContentSection | null>(initialValues);
  const observerRef                       = useRef<IntersectionObserver | null>(null);

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
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) =>
      observerRef.current?.observe(el)
    );
  }, []);

  // Observer runs after initial paint (data already present)
  useEffect(() => {
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;
    raf = requestAnimationFrame(() => { timeout = setTimeout(setupObserver, 50); });
    return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
  }, [heroContent, storyContent, valuesContent, setupObserver]);

  useEffect(() => {
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, []);

  // Realtime subscription — keeps content fresh after page load
  const loadContent = useCallback(async () => {
    const { data } = await supabase.from("about_content").select("*");
    if (data) {
      setHeroContent(data.find((s: any) => s.section === "hero") || null);
      setStoryContent(data.find((s: any) => s.section === "story") || null);
      setValuesContent(data.find((s: any) => s.section === "values") || null);
    }
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel("about-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "about_content" }, loadContent)
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, [loadContent]);

  return (
    <div className="about-page">

      <div className="bg-mesh" aria-hidden="true">
        <div className="mesh-layer-1" />
        <div className="mesh-layer-2" />
        <div className="grid-overlay" />
      </div>

      {heroContent && (
        <section className="hero">
          <div className="container">
            <div className="hero-header">
              <div className="hero-badge">✦ About Us ✦</div>
              <h1 className="hero-title">{heroContent.title}</h1>
            </div>

            <div className="hero-grid">
              <div className="hero-left">
                {heroContent.subtitle && (
                  <p className="hero-subtitle">{heroContent.subtitle}</p>
                )}
                {heroContent.description && (
                  <p className="hero-description">{heroContent.description}</p>
                )}

                {heroContent.stats && heroContent.stats.length > 0 && (
                  <div className="stats-row">
                    {heroContent.stats.map((stat, i) => (
                      <div
                        key={i}
                        className="stat-item reveal"
                        style={{ "--delay": `${500 + i * 80}ms` } as React.CSSProperties}
                      >
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-divider" />
                        <span className="stat-label">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {heroContent.image_url && (
                <div className="hero-right reveal" style={{ "--delay": "200ms" } as React.CSSProperties}>
                  <div className="img-frame">
                    <img src={heroContent.image_url} alt="About us" loading="lazy" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {storyContent && (
        <section className="story-section">
          <div className="container">
            <div className="story-grid">

              {storyContent.image_url && (
                <div className="story-img-col reveal" style={{ "--delay": "0ms" } as React.CSSProperties}>
                  <div className="img-frame">
                    <img src={storyContent.image_url} alt="Our story" loading="lazy" />
                  </div>
                </div>
              )}

              <div className="story-text reveal" style={{ "--delay": "120ms" } as React.CSSProperties}>
                {storyContent.title && <h2>{storyContent.title}</h2>}
                {storyContent.subtitle && (
                  <p className="story-subtitle">{storyContent.subtitle}</p>
                )}
                {storyContent.description && (
                  <p className="story-description">{storyContent.description}</p>
                )}
              </div>

            </div>
          </div>
        </section>
      )}

      {valuesContent && valuesContent.values_list && (
        <section className="values-section">
          <div className="container">

            {valuesContent.title && (
              <div className="section-header reveal" style={{ "--delay": "0ms" } as React.CSSProperties}>
                <h2>{valuesContent.title}</h2>
                {valuesContent.subtitle && (
                  <p className="section-subtitle">{valuesContent.subtitle}</p>
                )}
              </div>
            )}

            <div className="values-grid">
              {valuesContent.values_list.map((value, i) => (
                <div
                  key={i}
                  className="value-card reveal"
                  style={{ "--delay": `${Math.min(i * 80, 480)}ms` } as React.CSSProperties}
                >
                  <div className="value-icon">{value.icon}</div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      <style jsx>{`
        *, *::before, *::after { box-sizing: border-box; }

        .about-page {
          position: relative;
          min-height: 100vh;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          background: #04070f;
          overflow-x: hidden;
          width: 100%;
        }

        .bg-mesh {
          position: fixed; inset: 0; z-index: 0;
          pointer-events: none; contain: strict;
        }
        .mesh-layer-1 {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 100% 0%,  rgba(249,115,22,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 0%  100%, rgba(234,88,12,0.14)  0%, transparent 60%),
            linear-gradient(160deg, #04070f 0%, #0b1220 50%, #04070f 100%);
        }
        .mesh-layer-2 {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(249,115,22,0.06) 0%, transparent 70%);
          animation: mesh-pulse 8s ease-in-out infinite alternate;
          will-change: opacity;
        }
        @keyframes mesh-pulse { from { opacity: 0.4; } to { opacity: 1; } }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .reveal {
          opacity: 0;
          transform: translateY(32px);
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

        .container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding-left: 2rem;
          padding-right: 2rem;
          position: relative;
          z-index: 1;
        }

        .hero {
          padding: 7rem 0 4rem;
          position: relative; z-index: 1;
        }

        .hero-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .hero-badge {
          display: inline-block;
          font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.25em; text-transform: uppercase;
          color: #f97316;
          padding: 0.45rem 1.1rem;
          border: 1px solid rgba(249,115,22,0.4);
          border-radius: 100px;
          margin-bottom: 1.25rem;
          background: rgba(249,115,22,0.08);
          animation: fadeInDown 0.7s ease-out both;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-title {
          font-size: clamp(2.8rem, 7vw, 5rem);
          font-weight: 700; line-height: 1.05;
          background: linear-gradient(135deg, #fff 0%, #f97316 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          animation: fadeInUp 0.8s ease-out 0.15s both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3.5rem;
          align-items: stretch;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0;
        }
        .hero-subtitle {
          font-size: clamp(1rem, 1.6vw, 1.25rem);
          color: #cbd5e1; font-weight: 500;
          margin: 0 0 1rem;
          animation: fadeInUp 0.8s ease-out 0.3s both;
        }
        .hero-description {
          font-size: clamp(0.9rem, 1.3vw, 1.02rem);
          color: rgba(240,244,248,0.65); line-height: 1.85;
          margin: 0 0 2rem;
          animation: fadeInUp 0.8s ease-out 0.42s both;
        }

        .stats-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
        }
        .stat-item {
          flex: 1 1 80px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          padding: 0.5rem 1rem;
          border-right: 1px solid rgba(249,115,22,0.2);
        }
        .stat-item:first-child { padding-left: 0; }
        .stat-item:last-child  { border-right: none; padding-right: 0; }

        .stat-value {
          font-size: clamp(1.6rem, 2.5vw, 2.4rem);
          font-weight: 800; color: #f97316;
          line-height: 1; letter-spacing: -0.02em;
        }
        .stat-divider {
          display: block;
          width: 24px; height: 2px;
          background: linear-gradient(90deg, #f97316, rgba(249,115,22,0.25));
          border-radius: 2px;
        }
        .stat-label {
          font-size: 0.72rem; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.08em;
          font-weight: 500; text-align: center;
          white-space: nowrap;
        }

        .hero-right {
          min-height: 380px;
        }
        .img-frame {
          width: 100%;
          height: 100%;
          min-height: inherit;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 24px 56px rgba(0,0,0,0.5),
            0 0 0 1px rgba(249,115,22,0.14);
          line-height: 0;
        }
        .img-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        .story-section {
          padding: 5rem 0;
          position: relative; z-index: 1;
          background: rgba(249,115,22,0.03);
          border-top: 1px solid rgba(249,115,22,0.12);
          border-bottom: 1px solid rgba(249,115,22,0.12);
        }
        .story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3.5rem;
          align-items: stretch;
        }
        .story-img-col {
          min-height: 340px;
        }
        .story-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0;
        }
        .story-text h2 {
          font-size: clamp(1.7rem, 2.5vw, 2.4rem);
          color: white; font-weight: 800;
          margin: 0 0 0.75rem; line-height: 1.2;
        }
        .story-subtitle {
          font-size: clamp(0.95rem, 1.5vw, 1.15rem);
          color: #f97316; font-weight: 600; margin: 0 0 1rem;
        }
        .story-description {
          font-size: clamp(0.9rem, 1.3vw, 1.02rem);
          color: #94a3b8; line-height: 1.85; margin: 0;
        }

        .values-section {
          padding: 5rem 0;
          position: relative; z-index: 1;
        }
        .section-header {
          text-align: center; margin-bottom: 3rem;
        }
        .section-header h2 {
          font-size: clamp(1.7rem, 2.8vw, 2.4rem);
          color: white; font-weight: 800; margin: 0 0 0.75rem;
        }
        .section-subtitle {
          font-size: clamp(0.9rem, 1.5vw, 1.1rem);
          color: #94a3b8; margin: 0;
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .value-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition:
            transform    0.4s cubic-bezier(0.22,1,0.36,1),
            border-color 0.25s ease,
            box-shadow   0.4s ease,
            background   0.25s ease;
          will-change: transform;
        }
        .value-card:hover {
          transform: translateY(-10px);
          border-color: #f97316;
          box-shadow: 0 20px 60px rgba(249,115,22,0.25);
          background: rgba(255,255,255,0.07);
        }
        .value-icon {
          font-size: 3rem; margin-bottom: 1rem;
          display: inline-block;
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
          will-change: transform;
        }
        .value-card:hover .value-icon { transform: scale(1.1) rotate(5deg); }
        .value-card h3 {
          font-size: 1.25rem; color: white; font-weight: 700; margin: 0 0 0.6rem;
        }
        .value-card p {
          color: #94a3b8; line-height: 1.7; font-size: 0.95rem; margin: 0;
        }

        @media (max-width: 900px) {
          .hero-grid,
          .story-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .hero-left     { order: 1; }
          .hero-right    { order: 2; min-height: 260px; }
          .story-text    { order: 1; }
          .story-img-col { order: 2; min-height: 260px; }

          .hero-header { margin-bottom: 2rem; }

          .hero-left,
          .story-text {
            text-align: center;
            align-items: center;
          }

          .hero-badge { align-self: center; }
          .stats-row { justify-content: center; }
          .stat-item:first-child { padding-left: 1rem; }
          .stat-item:last-child  { padding-right: 1rem; }

          .story-subtitle,
          .story-description { text-align: center; }
          .section-header { text-align: center; }
        }

        @media (max-width: 600px) {
          .hero { padding: 5.5rem 0 2.5rem; }
          .container { padding-left: 1rem; padding-right: 1rem; }
          .story-section,
          .values-section { padding: 3rem 0; }

          .stats-row { gap: 0.5rem 0; }
          .stat-item {
            flex: 1 1 45%;
            border-right: none;
            border-bottom: 1px solid rgba(249,115,22,0.15);
            padding: 0.5rem 0.5rem;
          }
          .stat-item:nth-child(odd)  { border-right: 1px solid rgba(249,115,22,0.15); }
          .stat-item:last-child,
          .stat-item:nth-last-child(2):nth-child(odd) { border-bottom: none; }

          .values-grid { grid-template-columns: 1fr; }
          .hero-right,
          .story-img-col { min-height: 220px; }
        }
      `}</style>
    </div>
  );
}
