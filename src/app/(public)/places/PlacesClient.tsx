"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

type Place = {
  id: string;
  name: string;
  category: string;
  distance: string;
  time: string;
  description: string;
  images: string[] | null;
  rating: number;
  highlights: string[] | null;
  location_url?: string;
  created_at?: string;
};

const CATEGORIES = [
  { id: "all", name: "All Places" },
  { id: "beach", name: "Beaches" },
  { id: "historical", name: "Historical" },
  { id: "spiritual", name: "Spiritual" },
  { id: "adventure", name: "Adventure" },
  { id: "nature", name: "Nature" },
];

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function PlacesClient({ initialPlaces }: { initialPlaces: Place[] }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

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

  useEffect(() => {
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;
    raf = requestAnimationFrame(() => {
      timeout = setTimeout(setupObserver, 50);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [places, activeFilter, setupObserver]);

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const loadPlaces = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const { data, error } = await supabase
          .from("places")
          .select("*")
          .order("created_at", { ascending: false })
          .abortSignal(signal!);
        if (error) throw error;
        if (data) setPlaces(data);
      } catch (error: any) {
        if (error.name !== "AbortError" && !signal?.aborted)
          console.error("Error loading places:", error);
      }
    },
    []
  );

  useEffect(() => {
    const abortController = new AbortController();
    const channel = supabase
      .channel("places-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "places" },
        () => {
          if (!abortController.signal.aborted)
            loadPlaces(abortController.signal);
        }
      )
      .subscribe();
    return () => {
      abortController.abort();
      supabase.removeChannel(channel);
    };
  }, [loadPlaces]);

  const filteredPlaces =
    activeFilter === "all"
      ? places
      : places.filter((p) => p.category === activeFilter);

  const openPlaceDetails = (place: Place) => {
    setSelectedPlace(place);
    setActiveImageIndex(0);
    document.body.style.overflow = "hidden";
  };

  const closePlaceDetails = () => {
    setSelectedPlace(null);
    setActiveImageIndex(0);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    if (!selectedPlace?.images?.length) return;
    setActiveImageIndex((prev) =>
      prev === (selectedPlace.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!selectedPlace?.images?.length) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? (selectedPlace.images?.length || 1) - 1 : prev - 1
    );
  };

  return (
    <div className="places-page">

      <div className="bg-mesh" aria-hidden="true">
        <div className="mesh-layer-1" />
        <div className="mesh-layer-2" />
        <div className="grid-overlay" />
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge reveal">✦ Explore Alibag ✦</div>
          <h1 className="hero-title">Places to Visit in Alibag</h1>
          <p className="hero-subtitle">
            Discover the best places to visit in Alibag and nearby areas, including beaches, historic forts, temples, nature attractions and adventure activities. Find approximate distances and travel times from Sukhakarta Holiday Home to plan your trip.
          </p>
          <section className="hero-intro reveal" style={{ '--delay': '0.45s' } as React.CSSProperties}>
            <p>
              Sukhakarta Holiday Home sits in Kurul village, just minutes from Alibag's most iconic beaches and historical forts. Whether you're planning a morning walk along Varsoli Beach, a low-tide trek to Kolaba Fort, or a day trip to Murud-Janjira, every major attraction is within easy reach. Use this guide to plan your itinerary from our doorstep.
            </p>
          </section>
        </div>
      </div>

      {/* Filters */}
      <div className="container">
        <div className="filter-section">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              className={`filter-btn reveal ${
                activeFilter === cat.id ? "active" : ""
              }`}
              style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}
              onClick={() => setActiveFilter(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Places Grid */}
        <div className="places-grid">
          {filteredPlaces.map((place, idx) => {
            const images = place.images || [];
            const highlights = place.highlights || [];

            return (
              <div
                key={place.id}
                className="place-card reveal"
                style={
                  {
                    "--delay": `${Math.min(idx * 80, 480)}ms`,
                  } as React.CSSProperties
                }
                onClick={() => openPlaceDetails(place)}
              >
                {images.length > 0 && (
                  <div className="place-image-container">
                    <img
                      src={images[0]}
                      alt={place.name}
                      className="place-image"
                      loading="lazy"
                    />
                    {images.length > 1 && (
                      <div className="image-badge">
                        {images.length} photos
                      </div>
                    )}
                  </div>
                )}

                <div className="place-content">
                  {/* ✅ FIX 1: h2 → h3 for correct heading hierarchy (H1 > H3) */}
                  <h3>{place.name}</h3>

                  <div className="place-meta">
                    <span>{place.distance}</span>
                    <span>{place.time}</span>
                  </div>

                  <p className="description">{place.description}</p>

                  <div className="highlights">
                    {highlights.slice(0, 2).map((h, i) => (
                      <span key={i} className="highlight-tag">
                        {h}
                      </span>
                    ))}
                  </div>

                  <div className="card-footer">
                    <div className="rating">Rating — {place.rating}</div>
                    <span className="view-more">View Details →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPlaces.length === 0 && (
          <div className="no-results reveal">
            {/* ✅ FIX 2: h2 → h3 for no-results heading */}
            <h3>No places found</h3>
            <p>Try selecting a different category</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPlace && (
        <div className="modal" onClick={closePlaceDetails}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={closePlaceDetails}>
              ×
            </button>

            {selectedPlace.images && selectedPlace.images.length > 0 && (
              <div className="gallery">
                <div className="gallery-main">
                  <img
                    src={selectedPlace.images[activeImageIndex]}
                    alt={selectedPlace.name}
                    className="gallery-image"
                  />
                  {selectedPlace.images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="gallery-nav prev">
                        ‹
                      </button>
                      <button onClick={nextImage} className="gallery-nav next">
                        ›
                      </button>
                      <div className="gallery-counter">
                        {activeImageIndex + 1} /{" "}
                        {selectedPlace.images.length}
                      </div>
                    </>
                  )}
                </div>

                {selectedPlace.images.length > 1 && (
                  <div className="gallery-thumbnails">
                    {selectedPlace.images.map((img, i) => (
                      <div
                        key={i}
                        className={`gallery-thumb ${
                          i === activeImageIndex ? "active" : ""
                        }`}
                        onClick={() => setActiveImageIndex(i)}
                      >
                        <img
                          src={img}
                          alt={`${selectedPlace.name} thumbnail ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="modal-details">
              {/* Modal h2 is fine — it's inside a dialog, not the page outline */}
              <h2>{selectedPlace.name}</h2>

              <div className="modal-meta">
                <div className="meta-item">
                  <span className="meta-label">Distance</span>
                  <span className="meta-value">{selectedPlace.distance}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Time</span>
                  <span className="meta-value">{selectedPlace.time}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Rating</span>
                  <span className="meta-value">{selectedPlace.rating}/5</span>
                </div>
              </div>

              <p className="modal-description">{selectedPlace.description}</p>

              <div className="modal-highlights">
                <h4>Highlights</h4>
                <div className="highlights-grid">
                  {(selectedPlace.highlights || []).map((h, i) => (
                    <span key={i} className="highlight-pill">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                {selectedPlace.location_url &&
                  isValidHttpUrl(selectedPlace.location_url) && (
                    <a
                      href={selectedPlace.location_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn primary"
                    >
                      Get Directions
                    </a>
                  )}
                <button
                  onClick={closePlaceDetails}
                  className="action-btn secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .places-page {
          min-height: 100vh;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
          background: #04070f;
          overflow-x: hidden;
        }

        .bg-mesh {
          position: fixed; inset: 0; z-index: 0;
          pointer-events: none; contain: strict;
        }
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

        .hero { position: relative; z-index: 1; padding: 8rem 2rem 4rem; text-align: center; }
        .hero-badge {
          display: inline-block; font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.25em; text-transform: uppercase; color: #f97316;
          padding: 0.5rem 1.25rem; border: 1px solid rgba(249,115,22,0.4);
          border-radius: 100px; margin-bottom: 2rem; background: rgba(249,115,22,0.08);
          animation: fadeInDown 0.7s ease-out both;
        }
        .hero-title {
          font-size: clamp(3rem, 8vw, 5rem); font-weight: 700; line-height: 1.05;
          margin-bottom: 1.25rem;
          background: linear-gradient(135deg, #fff, #f97316, #0ea5e9);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: fadeInUp 0.8s ease-out 0.15s both;
        }
        .hero-subtitle {
          font-size: clamp(1.1rem, 3vw, 1.5rem); color: rgba(240,244,248,0.8);
          font-weight: 300; margin: 0 0 2rem;
          animation: fadeInUp 0.8s ease-out 0.3s both;
        }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }

        .container { max-width: 1400px; margin: 0 auto; padding: 3rem 2rem 5rem; position: relative; z-index: 1; }

        .filter-section { display: flex; gap: 1rem; margin-bottom: 3rem; flex-wrap: wrap; justify-content: center; }
        .filter-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 1rem 2rem; background: rgba(255,255,255,0.05);
          border: 2px solid rgba(249,115,22,0.2); border-radius: 50px;
          color: #f8fafc; font-size: 1rem; font-weight: 600; cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), background 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease;
          will-change: transform;
        }
        .filter-btn:hover { background: rgba(249,115,22,0.1); border-color: #f97316; transform: translateY(-3px); }
        .filter-btn.active { background: linear-gradient(135deg, #f97316, #ea580c); border-color: #f97316; box-shadow: 0 10px 30px rgba(249,115,22,0.4); }

        .places-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }

        .place-card {
          background: rgba(255,255,255,0.05); backdrop-filter: blur(10px);
          border: 1px solid rgba(249,115,22,0.2); border-radius: 24px; overflow: hidden;
          cursor: pointer; position: relative;
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, box-shadow 0.4s ease;
          will-change: transform;
        }
        .place-card::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.12), transparent);
          transition: transform 0.5s ease; will-change: transform;
        }
        .place-card:hover::before { transform: translateX(200%); }
        .place-card:hover { transform: translateY(-10px) scale(1.02); border-color: #f97316; box-shadow: 0 20px 60px rgba(249,115,22,0.3); }

        .place-image-container { position: relative; height: 200px; overflow: hidden; }
        .place-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); will-change: transform; }
        .place-card:hover .place-image { transform: scale(1.08); }
        .image-badge {
          position: absolute; top: 1rem; right: 1rem;
          background: rgba(15,23,42,0.9); padding: 0.5rem 1rem; border-radius: 20px;
          font-size: 0.85rem; backdrop-filter: blur(10px);
        }

        .place-content { padding: 2rem; }
        /* ✅ FIX 1: updated selector from h2 → h3 */
        .place-content h3 { font-size: 1.5rem; margin-bottom: 0.75rem; color: #f97316; }
        .place-meta { display: flex; gap: 1.5rem; margin-bottom: 1rem; font-size: 0.9rem; color: #94a3b8; }
        .description { color: #cbd5e1; line-height: 1.6; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;}
        .highlights { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .highlight-tag {
          padding: 0.25rem 0.75rem; background: rgba(249,115,22,0.1);
          border: 1px solid rgba(249,115,22,0.3); border-radius: 20px;
          font-size: 0.85rem; color: #f97316;
        }
        .card-footer {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);
        }
        .rating { font-weight: 600; color: #fbbf24; }
        .view-more { color: #f97316; font-weight: 600; display: inline-block; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1); will-change: transform; }
        .place-card:hover .view-more { transform: translateX(5px); }

        .no-results { text-align: center; padding: 4rem 2rem; }
        /* ✅ FIX 2: updated selector from h2 → h3 */
        .no-results h3 { font-size: 2rem; margin-bottom: 0.5rem; color: #f97316; }
        .no-results p  { color: #94a3b8; }

        .modal {
          position: fixed; inset: 0; background: rgba(15,23,42,0.95);
          backdrop-filter: blur(10px); display: flex; align-items: center;
          justify-content: center; z-index: 1000; padding: 2rem; overflow-y: auto;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-content {
          background: linear-gradient(135deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98));
          backdrop-filter: blur(20px); border: 2px solid rgba(249,115,22,0.3);
          border-radius: 30px; max-width: 900px; width: 100%;
          max-height: 90vh; overflow-y: auto; position: relative;
          animation: scaleIn 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        .close-btn {
          position: sticky; top: 1.5rem; right: 1.5rem; float: right;
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(249,115,22,0.2); border: 1px solid rgba(249,115,22,0.3);
          color: #f8fafc; font-size: 1.5rem; cursor: pointer;
          transition: background 0.2s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1);
          display: flex; align-items: center; justify-content: center; z-index: 10;
        }
        .close-btn:hover { background: #f97316; transform: rotate(90deg); }

        .gallery { padding: 2rem 2rem 1rem; }
        .gallery-main {
          position: relative; height: 400px; background: rgba(0,0,0,0.2);
          border-radius: 20px; overflow: hidden; margin-bottom: 1rem;
        }
        .gallery-image { width: 100%; height: 100%; object-fit: cover; animation: imageZoom 0.3s cubic-bezier(0.22,1,0.36,1); }
        @keyframes imageZoom { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .gallery-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 45px; height: 45px; border-radius: 50%;
          background: rgba(15,23,42,0.9); border: 1px solid rgba(249,115,22,0.3);
          color: #f8fafc; font-size: 1.5rem; cursor: pointer;
          transition: background 0.2s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1);
          display: flex; align-items: center; justify-content: center;
        }
        .gallery-nav:hover { background: #f97316; transform: translateY(-50%) scale(1.1); }
        .gallery-nav.prev { left: 1rem; }
        .gallery-nav.next { right: 1rem; }
        .gallery-counter {
          position: absolute; bottom: 1rem; right: 1rem;
          background: rgba(15,23,42,0.9); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;
        }
        .gallery-thumbnails { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 0.75rem; }
        .gallery-thumb {
          aspect-ratio: 1; background: rgba(255,255,255,0.05);
          border: 2px solid rgba(249,115,22,0.2); border-radius: 12px; overflow: hidden;
          cursor: pointer; transition: border-color 0.2s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1); will-change: transform;
        }
        .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .gallery-thumb.active { border-color: #f97316; background: rgba(249,115,22,0.2); }
        .gallery-thumb:hover { border-color: #f97316; transform: scale(1.05); }

        .modal-details { padding: 0 2rem 2rem; }
        .modal-details h2 {
          text-align: center; margin-bottom: 2rem; font-size: 2rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .modal-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .meta-item {
          text-align: center; padding: 1rem;
          background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); border-radius: 15px;
        }
        .meta-label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.5rem; }
        .meta-value { display: block; font-weight: 600; color: #f97316; }
        .modal-description { line-height: 1.8; color: #cbd5e1; margin-bottom: 2rem; }
        .modal-highlights h4 { margin-bottom: 1rem; color: #f97316; }
        .highlights-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 2rem; }
        .highlight-pill {
          padding: 0.75rem 1rem; background: rgba(249,115,22,0.1);
          border: 1px solid rgba(249,115,22,0.3); border-radius: 12px; text-align: center;
          color: #f8fafc; font-size: 0.9rem;
          transition: background 0.2s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .highlight-pill:hover { background: rgba(249,115,22,0.2); transform: scale(1.04); }
        .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .action-btn {
          padding: 1rem 1.5rem; border: none; border-radius: 12px; font-size: 1rem;
          font-weight: 600; cursor: pointer; text-decoration: none; display: block; text-align: center;
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, background 0.25s ease;
          will-change: transform;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, #f97316, #ea580c); color: white;
          box-shadow: 0 10px 30px rgba(249,115,22,0.4);
        }
        .action-btn.primary:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(249,115,22,0.6); }
        .action-btn.secondary { background: transparent; color: #f97316; border: 2px solid #f97316; }
        .action-btn.secondary:hover { background: rgba(249,115,22,0.1); transform: translateY(-3px); }

        @media (max-width: 768px) {
          .hero { padding: 6rem 2rem 3rem; }
          .places-grid { grid-template-columns: 1fr; }
          .filter-section { gap: 0.75rem; }
          .filter-btn { padding: 0.75rem 1.5rem; font-size: 0.9rem; }
          .modal-meta { grid-template-columns: 1fr; }
          .highlights-grid { grid-template-columns: 1fr; }
          .modal-actions { grid-template-columns: 1fr; }
          .gallery-main { height: 250px; }
        }

        .hero-intro {
          max-width: 860px;
          margin: 1.5rem auto 0;
          color: rgba(240, 244, 248, 0.55);
          font-size: 1.05rem;
          line-height: 1.9;
          font-weight: 300;
          border-top: 1px solid rgba(249, 115, 22, 0.2);
          padding-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}
