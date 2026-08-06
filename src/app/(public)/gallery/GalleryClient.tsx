"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

type MediaItem = {
  id: string;
  title?: string;
  description?: string;
  media_url: string;
  thumbnail_url?: string;
  media_type: "image" | "video";
  category: string;
  tags: string[];
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

const CATEGORIES = [
  { id: "all",          label: "All"          },
  { id: "rooms",        label: "Rooms"        },
  { id: "surroundings", label: "Surroundings" },
  { id: "amenities",    label: "Amenities"    },
  { id: "property",     label: "Property"     },
  { id: "other",        label: "Other"        },
];

// Number of cards treated as "above the fold" — these skip the
// scroll-reveal animation entirely so they don't block LCP.
const ABOVE_FOLD_COUNT = 8;

function getSpan(index: number, type: "image" | "video", featured: boolean): string {
  if (featured) return "span-2-2";
  const patterns = ["span-1-2", "span-2-1", "span-1-1", "span-1-1", "span-2-1", "span-1-2"];
  return patterns[index % patterns.length];
}

export default function GalleryClient({ initialItems }: { initialItems: MediaItem[] }) {
  // Seed from SSR — no loading flash on first paint
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [filtered, setFiltered] = useState<MediaItem[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  // Above-the-fold cards are revealed immediately — no JS/observer
  // dependency for their paint, which is what was blocking LCP.
  const [revealedSet, setRevealedSet] = useState<Set<string>>(
    () => new Set(initialItems.slice(0, ABOVE_FOLD_COUNT).map(i => i.id))
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Realtime — reload without showing a spinner
  async function loadGallery() {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) {
      setItems(data);
    }
  }

  useEffect(() => {
    // Defer the refetch + realtime subscription slightly so it doesn't
    // compete with the initial paint/LCP measurement window. SSR data
    // is already on screen, so this is just keeping things fresh.
    const idleId = ("requestIdleCallback" in window)
      ? (window as any).requestIdleCallback(loadGallery, { timeout: 2000 })
      : window.setTimeout(loadGallery, 300);

    const channel = supabase
      .channel("gallery-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "gallery_items" }, loadGallery)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if ("requestIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId as number);
      }
    };
  }, []);

  // Filter
  useEffect(() => {
    if (activeCategory === "all") {
      setFiltered(items);
    } else {
      setFiltered(items.filter(i => i.category === activeCategory));
    }
  }, [activeCategory, items]);

  // Scroll reveal — only for cards past the above-the-fold cutoff
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.id;
            if (id) setRevealedSet(prev => new Set([...prev, id]));
            observerRef.current?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -60px 0px" }
    );
    setTimeout(() => {
      document
        .querySelectorAll(".gl-card[data-id]:not(.no-reveal)")
        .forEach(el => observerRef.current?.observe(el));
    }, 100);
    return () => observerRef.current?.disconnect();
  }, [filtered]);

  const openLightbox = useCallback((item: MediaItem) => {
    const idx = filtered.findIndex(i => i.id === item.id);
    setLightboxIdx(idx >= 0 ? idx : 0);
    setLightbox(item);
    document.body.style.overflow = "hidden";
  }, [filtered]);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    document.body.style.overflow = "";
  }, []);

  const prevLightbox = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIdx(i => {
      const ni = (i - 1 + filtered.length) % filtered.length;
      setLightbox(filtered[ni]);
      return ni;
    });
  }, [filtered]);

  const nextLightbox = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIdx(i => {
      const ni = (i + 1) % filtered.length;
      setLightbox(filtered[ni]);
      return ni;
    });
  }, [filtered]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") {
        setLightboxIdx(i => {
          const ni = (i - 1 + filtered.length) % filtered.length;
          setLightbox(filtered[ni]);
          return ni;
        });
      }
      if (e.key === "ArrowRight") {
        setLightboxIdx(i => {
          const ni = (i + 1) % filtered.length;
          setLightbox(filtered[ni]);
          return ni;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, filtered, closeLightbox]);

  const featuredItems  = items.filter(i => i.is_featured);
  const imageCount     = items.filter(i => i.media_type === "image").length;
  const videoCount     = items.filter(i => i.media_type === "video").length;

  return (
    <div className="gallery-page">

      <div className="gl-bg" aria-hidden="true">
        <div className="gl-bg-orb gl-bg-orb1" />
        <div className="gl-bg-orb gl-bg-orb2" />
        <div className="gl-grid-lines" />
      </div>

      <header className="gl-hero">
        <div className="gl-hero-badge">✦ Our Gallery ✦</div>
        <h1 className="gl-hero-title">
          Moments at<br />
          <span className="gl-hero-accent">Sukhakarta</span>
        </h1>
        <p className="gl-hero-sub">
          A visual journey through our coastal paradise — rooms, beaches, and memories that last forever.
        </p>

        <div className="gl-stats">
          <div className="gl-stat">
            <span className="gl-stat-num">{imageCount}</span>
            <span className="gl-stat-label">Photos</span>
          </div>
          <div className="gl-stat-div" />
          <div className="gl-stat">
            <span className="gl-stat-num">{videoCount}</span>
            <span className="gl-stat-label">Videos</span>
          </div>
          <div className="gl-stat-div" />
          <div className="gl-stat">
            <span className="gl-stat-num">{featuredItems.length}</span>
            <span className="gl-stat-label">Featured</span>
          </div>
        </div>
      </header>

      <div className="gl-filter-bar">
        <div className="gl-filter-track">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`gl-filter-btn${activeCategory === cat.id ? " active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.label}</span>
              {activeCategory === cat.id && (
                <span className="gl-filter-count">
                  {cat.id === "all" ? items.length : items.filter(i => i.category === cat.id).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="gl-container">
        {filtered.length === 0 ? (
          <div className="gl-empty">
            <div className="gl-empty-icon"></div>
            <h3>Nothing here yet</h3>
            <p>Check back soon — we're always adding new moments.</p>
          </div>
        ) : (
          <div className="gl-mosaic">
            {filtered.map((item, idx) => {
              const span = getSpan(idx, item.media_type, item.is_featured);
              const aboveFold = idx < ABOVE_FOLD_COUNT;
              const revealed = revealedSet.has(item.id);
              return (
                <div
                  key={item.id}
                  data-id={item.id}
                  className={`gl-card ${span}${aboveFold ? " no-reveal" : ""}${revealed ? " revealed" : ""}`}
                  style={aboveFold ? undefined : ({ "--delay": `${(idx % 6) * 60}ms` } as React.CSSProperties)}
                  onClick={() => openLightbox(item)}
                >
                  {item.media_type === "video" ? (
                    <video
                      src={item.media_url}
                      className="gl-media"
                      muted
                      loop
                      playsInline
                      preload={aboveFold ? "metadata" : "none"}
                      onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                      onMouseLeave={e => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
                      poster={item.thumbnail_url}
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.media_url}
                      alt={item.title || "Gallery image"}
                      className="gl-media"
                      loading={aboveFold ? "eager" : "lazy"}
                      // First card is the LCP candidate — tell the
                      // browser to fetch it before anything else.
                      fetchPriority={idx === 0 ? "high" : aboveFold ? "auto" : "low"}
                      decoding={idx === 0 ? "sync" : "async"}
                    />
                  )}

                  <div className="gl-overlay">
                    {item.is_featured && <span className="gl-featured-badge">★ Featured</span>}
                    {item.media_type === "video" && (
                      <div className="gl-play-btn">
                        <svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </div>
                    )}
                    <div className="gl-card-info">
                      {item.title    && <h3 className="gl-card-title">{item.title}</h3>}
                      {item.description && <p className="gl-card-desc">{item.description}</p>}
                      <div className="gl-card-meta">
                        <span className="gl-cat-tag">{item.category}</span>
                        <span className="gl-zoom-hint">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                          View
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="gl-shimmer" />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {lightbox && (
        <div className="gl-lightbox" onClick={closeLightbox}>
          <div className="gl-lb-inner" onClick={e => e.stopPropagation()}>
            <button className="gl-lb-close" onClick={closeLightbox} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {filtered.length > 1 && (
              <>
                <button className="gl-lb-nav gl-lb-prev" onClick={prevLightbox} aria-label="Previous">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button className="gl-lb-nav gl-lb-next" onClick={nextLightbox} aria-label="Next">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </>
            )}

            <div className="gl-lb-media-wrap">
              {lightbox.media_type === "video" ? (
                <video src={lightbox.media_url} controls autoPlay className="gl-lb-media" />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={lightbox.media_url} alt={lightbox.title || "Sukhakarta Holiday Home Alibag gallery photo"} className="gl-lb-media" />
              )}
            </div>

            {(lightbox.title || lightbox.description) && (
              <div className="gl-lb-info">
                {lightbox.title && <h2 className="gl-lb-title">{lightbox.title}</h2>}
                {lightbox.description && <p className="gl-lb-desc">{lightbox.description}</p>}
                <div className="gl-lb-foot">
                  <span className="gl-lb-cat">{lightbox.category}</span>
                  <span className="gl-lb-counter">{lightboxIdx + 1} / {filtered.length}</span>
                </div>
              </div>
            )}

            {filtered.length > 1 && (
              <div className="gl-lb-thumbs">
                {filtered.slice(Math.max(0, lightboxIdx - 3), lightboxIdx + 4).map((item, i) => {
                  const realIdx = Math.max(0, lightboxIdx - 3) + i;
                  return (
                    <div
                      key={item.id}
                      className={`gl-lb-thumb${realIdx === lightboxIdx ? " active" : ""}`}
                      onClick={() => { setLightbox(item); setLightboxIdx(realIdx); }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.thumbnail_url || item.media_url} alt={item.title || "Gallery thumbnail"} />
                      {item.media_type === "video" && <div className="gl-lb-thumb-play">▶</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <section className="gl-cta">
        <p className="gl-cta-text">Experience it in person</p>
        <a href="/book" className="gl-cta-btn">Book Your Stay</a>
      </section>

      <style jsx global>{`
        .gallery-page {
          min-height: 100vh; background: #04070f; color: #f8fafc;
          font-family: var(--font-outfit, system-ui, sans-serif);
          position: relative; overflow-x: hidden;
        }
        .gl-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .gl-bg-orb { position: absolute; border-radius: 50%; filter: blur(120px); }
        .gl-bg-orb1 { width: 700px; height: 700px; background: radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%); top: -200px; right: -200px; animation: orbFloat 14s ease-in-out infinite alternate; }
        .gl-bg-orb2 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%); bottom: 0; left: -200px; animation: orbFloat 18s ease-in-out infinite alternate-reverse; }
        @keyframes orbFloat { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,-40px) scale(1.06); } }
        .gl-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(249,115,22,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.035) 1px, transparent 1px); background-size: 64px 64px; }

        .gl-hero { position: relative; z-index: 1; padding: 8rem 1.5rem 4rem; text-align: center; max-width: 800px; margin: 0 auto; }
        .gl-hero-badge { display: inline-block; padding: 0.45rem 1.5rem; border: 1px solid rgba(249,115,22,0.45); border-radius: 100px; font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: #f97316; background: rgba(249,115,22,0.07); margin-bottom: 2rem; animation: fadeInDown 0.7s ease-out both; }
        @keyframes fadeInDown { from { opacity:0; transform: translateY(-14px); } to { opacity:1; transform:none; } }
        .gl-hero-title { font-family: var(--font-cormorant, Georgia, serif); font-size: clamp(3rem, 8vw, 6rem); font-weight: 700; line-height: 1.08; letter-spacing: -0.02em; margin: 0 0 1.25rem; animation: fadeInUp 0.8s ease-out 0.1s both; }
        @keyframes fadeInUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform:none; } }
        .gl-hero-accent { background: linear-gradient(135deg, #f97316, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .gl-hero-sub { color: rgba(248,250,252,0.65); font-size: clamp(1rem, 2.2vw, 1.2rem); font-weight: 300; max-width: 560px; margin: 0 auto 2.5rem; line-height: 1.7; animation: fadeInUp 0.8s ease-out 0.2s both; }
        .gl-stats { display: inline-flex; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.2); border-radius: 20px; overflow: hidden; animation: fadeInUp 0.8s ease-out 0.3s both; }
        .gl-stat { padding: 1rem 2rem; text-align: center; }
        .gl-stat-num { display: block; font-size: 2rem; font-weight: 800; color: #f97316; }
        .gl-stat-label { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-top: 2px; }
        .gl-stat-div { width: 1px; background: rgba(249,115,22,0.2); align-self: stretch; }

        .gl-filter-bar { position: sticky; top: 0; z-index: 50; padding: 1rem 1.5rem; backdrop-filter: blur(20px); background: rgba(4,7,15,0.75); border-bottom: 1px solid rgba(249,115,22,0.12); }
        .gl-filter-track { display: flex; gap: 0.6rem; max-width: 1400px; margin: 0 auto; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
        .gl-filter-track::-webkit-scrollbar { display: none; }
        .gl-filter-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.25rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(249,115,22,0.18); border-radius: 100px; color: #cbd5e1; font-size: 0.85rem; font-weight: 600; white-space: nowrap; cursor: pointer; transition: all 0.25s; font-family: var(--font-outfit, system-ui, sans-serif); }
        .gl-filter-btn:hover { border-color: rgba(249,115,22,0.5); color: #f97316; }
        .gl-filter-btn.active { background: linear-gradient(135deg, #f97316, #ea580c); border-color: #f97316; color: #fff; box-shadow: 0 6px 20px rgba(249,115,22,0.35); }
        .gl-filter-count { background: rgba(255,255,255,0.25); border-radius: 100px; padding: 0.1rem 0.55rem; font-size: 0.72rem; }

        .gl-container { position: relative; z-index: 1; max-width: 1500px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
        .gl-mosaic { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 220px; gap: 1rem; }
        .span-1-1 { grid-column: span 1; grid-row: span 1; }
        .span-1-2 { grid-column: span 1; grid-row: span 2; }
        .span-2-1 { grid-column: span 2; grid-row: span 1; }
        .span-2-2 { grid-column: span 2; grid-row: span 2; }

        .gl-card { position: relative; border-radius: 16px; overflow: hidden; cursor: pointer; background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.12); opacity: 0; transform: translateY(30px) scale(0.97); transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1) var(--delay,0ms), transform 0.55s cubic-bezier(0.22,1,0.36,1) var(--delay,0ms), border-color 0.3s, box-shadow 0.3s; }
        .gl-card.revealed { opacity: 1; transform: none; }
        /* Above-the-fold cards render fully visible immediately — no
           animation dependency, so the LCP image paints on first frame. */
        .gl-card.no-reveal { opacity: 1; transform: none; transition: border-color 0.3s, box-shadow 0.3s; }
        .gl-card:hover { border-color: rgba(249,115,22,0.6); box-shadow: 0 20px 50px rgba(249,115,22,0.22), 0 0 0 1px rgba(249,115,22,0.3); z-index: 2; }
        .gl-card:hover .gl-media { transform: scale(1.07); }
        .gl-card:hover .gl-overlay { opacity: 1; }
        .gl-card:hover .gl-shimmer { left: 110%; }

        .gl-media { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s cubic-bezier(0.22,1,0.36,1); will-change: transform; }
        .gl-shimmer { position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%); left: -110%; transition: left 0.55s ease; pointer-events: none; z-index: 3; }
        .gl-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(4,7,15,0.92) 0%, rgba(4,7,15,0.35) 55%, transparent 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 1.25rem; opacity: 0; transition: opacity 0.35s ease; z-index: 2; }
        .gl-featured-badge { position: absolute; top: 0.85rem; left: 0.85rem; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em; padding: 0.28rem 0.75rem; border-radius: 100px; text-transform: uppercase; }
        .gl-play-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 52px; height: 52px; border-radius: 50%; background: rgba(249,115,22,0.9); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); box-shadow: 0 4px 20px rgba(249,115,22,0.5); }
        .gl-play-btn svg { width: 20px; height: 20px; margin-left: 3px; }
        .gl-card-title { font-size: 1rem; font-weight: 700; color: #fff; margin: 0 0 0.3rem; line-height: 1.3; }
        .gl-card-desc { font-size: 0.8rem; color: rgba(248,250,252,0.75); margin: 0 0 0.65rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .gl-card-meta { display: flex; justify-content: space-between; align-items: center; }
        .gl-cat-tag { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #f97316; background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3); padding: 0.2rem 0.6rem; border-radius: 6px; }
        .gl-zoom-hint { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: rgba(248,250,252,0.7); font-weight: 600; }

        .gl-empty { text-align: center; padding: 6rem 2rem; }
        .gl-empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; display: block; }
        .gl-empty h3 { color: #f97316; margin-bottom: 0.5rem; }
        .gl-empty p { color: #94a3b8; }

        .gl-lightbox { position: fixed; inset: 0; background: rgba(4,7,15,0.97); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; animation: lbFadeIn 0.25s ease-out; }
        @keyframes lbFadeIn { from { opacity:0; } to { opacity:1; } }
        .gl-lb-inner { position: relative; max-width: 1000px; width: 100%; display: flex; flex-direction: column; gap: 0; max-height: 95vh; }
        .gl-lb-close { position: absolute; top: -0.5rem; right: -0.5rem; width: 42px; height: 42px; border-radius: 50%; background: rgba(249,115,22,0.2); border: 1px solid rgba(249,115,22,0.4); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: background 0.2s, transform 0.2s; }
        .gl-lb-close:hover { background: #f97316; transform: rotate(90deg); }
        .gl-lb-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; border-radius: 50%; background: rgba(15,23,42,0.9); border: 1px solid rgba(249,115,22,0.35); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s, transform 0.2s; z-index: 10; }
        .gl-lb-nav:hover { background: #f97316; transform: translateY(-50%) scale(1.1); }
        .gl-lb-prev { left: -1.25rem; }
        .gl-lb-next { right: -1.25rem; }
        .gl-lb-media-wrap { border-radius: 16px; overflow: hidden; background: #000; max-height: 65vh; display: flex; align-items: center; justify-content: center; }
        .gl-lb-media { max-width: 100%; max-height: 65vh; object-fit: contain; display: block; }
        .gl-lb-info { padding: 1.25rem 0 0.75rem; border-bottom: 1px solid rgba(249,115,22,0.12); }
        .gl-lb-title { font-family: var(--font-cormorant, Georgia, serif); font-size: 1.6rem; font-weight: 700; background: linear-gradient(135deg,#fff,#f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 0.4rem; }
        .gl-lb-desc { color: #94a3b8; font-size: 0.9rem; margin: 0 0 0.75rem; line-height: 1.6; }
        .gl-lb-foot { display: flex; justify-content: space-between; align-items: center; }
        .gl-lb-cat { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #f97316; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.3); padding: 0.2rem 0.65rem; border-radius: 6px; }
        .gl-lb-counter { font-size: 0.82rem; color: #64748b; }
        .gl-lb-thumbs { display: flex; gap: 0.6rem; padding-top: 0.85rem; overflow-x: auto; scrollbar-width: none; }
        .gl-lb-thumbs::-webkit-scrollbar { display: none; }
        .gl-lb-thumb { position: relative; width: 72px; height: 52px; flex-shrink: 0; border-radius: 8px; overflow: hidden; border: 2px solid rgba(249,115,22,0.2); cursor: pointer; transition: border-color 0.2s, transform 0.2s; }
        .gl-lb-thumb:hover { border-color: #f97316; transform: scale(1.06); }
        .gl-lb-thumb.active { border-color: #f97316; }
        .gl-lb-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .gl-lb-thumb-play { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); color: #fff; font-size: 0.7rem; }

        .gl-cta { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap; padding: 3rem 1.5rem; border-top: 1px solid rgba(249,115,22,0.15); background: rgba(249,115,22,0.04); }
        .gl-cta-text { font-family: var(--font-cormorant, Georgia, serif); font-size: 1.8rem; font-weight: 600; color: rgba(248,250,252,0.85); margin: 0; }
        .gl-cta-btn { display: inline-flex; align-items: center; padding: 0.9rem 2.25rem; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; text-decoration: none; border-radius: 100px; font-weight: 700; font-size: 0.95rem; box-shadow: 0 10px 28px rgba(249,115,22,0.38); transition: transform 0.2s, box-shadow 0.2s; }
        .gl-cta-btn:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(249,115,22,0.55); }

        @media (max-width: 1100px) { .gl-mosaic { grid-template-columns: repeat(3, 1fr); grid-auto-rows: 200px; } }
        @media (max-width: 768px) {
          .gl-mosaic { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 180px; gap: 0.75rem; }
          .span-2-2 { grid-column: span 2; grid-row: span 1; }
          .gl-lb-prev { left: 0.25rem; }
          .gl-lb-next { right: 0.25rem; }
          .gl-overlay { opacity: 0 !important; pointer-events: none; }
          .gl-card:hover .gl-overlay { opacity: 0 !important; }
          .gl-featured-badge, .gl-play-btn { opacity: 1 !important; pointer-events: auto; }
          .gl-card-info { display: none !important; }
        }
        @media (max-width: 480px) {
          .gl-mosaic { grid-template-columns: 1fr 1fr; grid-auto-rows: 160px; gap: 0.5rem; }
          .span-1-2, .span-2-1, .span-2-2 { grid-column: span 1; grid-row: span 1; }
          .gl-hero { padding: 6rem 1rem 2.5rem; }
          .gl-stat { padding: 0.75rem 1.25rem; }
          .gl-stat-num { font-size: 1.5rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gl-card, .gl-media, .gl-shimmer, .gl-bg-orb1, .gl-bg-orb2 { animation: none !important; transition: none !important; }
          .gl-card { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
