"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

// --- Types ---
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

export default function PlacesToVisit() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // ✅ 1. Stable Loader with AbortSignal support
  const loadPlaces = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("created_at", { ascending: false })
        .abortSignal(signal!); // Bind signal to Supabase request

      if (error) {
        throw error;
      }

      if (data) {
        setPlaces(data);
      }
    } catch (error: any) {
      // Ignore errors caused by aborting
      if (error.name !== 'AbortError') {
        console.error("Error loading places:", error);
      }
    } finally {
      // Only stop loading if not aborted
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // ✅ 2. UseEffect with AbortController
  useEffect(() => {
    const controller = new AbortController();
    
    // Initial fetch
    loadPlaces(controller.signal);

    // Realtime subscription
    const channel = supabase
      .channel("places-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "places" },
        () => {
          // Re-fetch on change, reusing the controller signal
          if (!controller.signal.aborted) {
            loadPlaces(controller.signal);
          }
        }
      )
      .subscribe();

    // Cleanup: Abort pending requests & remove channel
    return () => {
      controller.abort();
      supabase.removeChannel(channel);
    };
  }, [loadPlaces]);

  // ... (Rest of your component logic remains the same)

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
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <h1>Explore Alibag</h1>
          <p>
            Discover the best beaches, forts, and attractions around Sukhakarta
            Holiday Home
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container">
        <div className="filter-section">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${
                activeFilter === cat.id ? "active" : ""
              }`}
              onClick={() => setActiveFilter(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading places...</p>
          </div>
        ) : (
          <>
            {/* Places Grid */}
            <div className="places-grid">
              {filteredPlaces.map((place) => {
                const images = place.images || [];
                const highlights = place.highlights || [];
                
                return (
                  <div
                    key={place.id}
                    className="place-card"
                    onClick={() => openPlaceDetails(place)}
                  >
                    {images.length > 0 && (
                      <div className="place-image-container">
                        <img
                          src={images[0]}
                          alt={place.name}
                          className="place-image"
                          loading="lazy" // ✅ Added lazy loading
                        />
                        {images.length > 1 && (
                          <div className="image-badge">
                            {images.length} photos
                          </div>
                        )}
                      </div>
                    )}

                    <div className="place-content">
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
                        <div className="rating">Rating: {place.rating}</div>
                        <span className="view-more">View Details</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPlaces.length === 0 && (
              <div className="no-results">
                <h3>No places found</h3>
                <p>Try selecting a different category</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal logic remains identical to your version, just ensure `modal` CSS handles z-index */}
      {selectedPlace && (
        <div className="modal" onClick={closePlaceDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closePlaceDetails}>×</button>
            
            {/* Gallery Section */}
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
                      <button onClick={prevImage} className="gallery-nav prev">‹</button>
                      <button onClick={nextImage} className="gallery-nav next">›</button>
                      <div className="gallery-counter">
                        {activeImageIndex + 1} / {selectedPlace.images.length}
                      </div>
                    </>
                  )}
                </div>
                {selectedPlace.images.length > 1 && (
                  <div className="gallery-thumbnails">
                    {selectedPlace.images.map((img, i) => (
                      <div
                        key={i}
                        className={`gallery-thumb ${i === activeImageIndex ? "active" : ""}`}
                        onClick={() => setActiveImageIndex(i)}
                      >
                        <img src={img} alt="" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Details Section */}
            <div className="modal-details">
              <h2>{selectedPlace.name}</h2>
              <div className="modal-meta">
                <div>Distance: {selectedPlace.distance}</div>
                <div>Time: {selectedPlace.time}</div>
                <div>Rating: {selectedPlace.rating}</div>
              </div>
              <p className="modal-description">{selectedPlace.description}</p>
              <div className="modal-highlights">
                <h4>Highlights</h4>
                <div className="highlights-grid">
                  {(selectedPlace.highlights || []).map((h, i) => (
                    <span key={i} className="highlight-pill">{h}</span>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                {selectedPlace.location_url && isValidHttpUrl(selectedPlace.location_url) && (
                  <a
                    href={selectedPlace.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn primary"
                  >
                    Get Directions
                  </a>
                )}
                <button onClick={closePlaceDetails} className="action-btn secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Optimized CSS with fixes for mobile sizing and animations */}
      <style jsx>{`
        .places-page {
          min-height: 100vh;
          padding-bottom: 50px;
        }
        .hero {
          background: #f3f4f6;
          padding: 60px 20px;
          text-align: center;
          margin-bottom: 30px;
        }
        .hero h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .filter-section {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .filter-btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          white-space: nowrap;
        }
        .filter-btn.active {
          background: #000;
          color: white;
          border-color: #000;
        }
        .places-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .place-card {
          border: 1px solid #eee;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .place-card:hover { transform: translateY(-4px); }
        .place-image-container {
          height: 200px;
          position: relative;
        }
        .place-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .image-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .place-content { padding: 16px; }
        .place-meta { display: flex; justify-content: space-between; color: #666; font-size: 0.9rem; margin-bottom: 10px; }
        .description { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12px; color: #444; }
        .highlights { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
        .highlight-tag { background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; }
        .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 12px; }
        .rating { color: #f59e0b; font-weight: bold; }
        .view-more { color: #2563eb; font-weight: 600; font-size: 0.9rem; }
        .no-results { text-align: center; padding: 40px; color: #666; }
        
        /* Modal Styles */
        .modal {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .modal-content { flex-direction: row; }
          .gallery { width: 50%; }
          .modal-details { width: 50%; padding: 30px; }
        }
        .close-btn {
          position: absolute; top: 10px; right: 10px;
          background: white; border: none; width: 32px; height: 32px;
          border-radius: 50%; cursor: pointer; font-size: 20px; z-index: 10;
        }
        .gallery { background: #000; display: flex; flex-direction: column; }
        .gallery-main { height: 300px; position: relative; display: flex; align-items: center; justify-content: center; }
        .gallery-image { max-width: 100%; max-height: 100%; object-fit: contain; }
        .gallery-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.2); color: white; border: none;
          padding: 10px; cursor: pointer; font-size: 24px;
        }
        .gallery-nav.prev { left: 0; }
        .gallery-nav.next { right: 0; }
        .gallery-counter { position: absolute; bottom: 10px; right: 10px; color: white; font-size: 12px; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; }
        .gallery-thumbnails { display: flex; gap: 8px; padding: 10px; overflow-x: auto; }
        .gallery-thumb { width: 60px; height: 60px; opacity: 0.5; cursor: pointer; border: 2px solid transparent; flex-shrink: 0; }
        .gallery-thumb.active { opacity: 1; border-color: white; }
        .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .modal-details { padding: 20px; }
        .modal-meta { display: flex; gap: 15px; margin: 10px 0 20px; color: #666; font-size: 0.9rem; }
        .highlight-pill { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 6px 12px; border-radius: 20px; margin: 0 8px 8px 0; font-size: 0.9rem; }
        .modal-actions { margin-top: 30px; display: flex; gap: 12px; }
        .action-btn { flex: 1; padding: 12px; text-align: center; border-radius: 8px; cursor: pointer; font-weight: 600; text-decoration: none; border: none; }
        .action-btn.primary { background: #000; color: white; }
        .action-btn.secondary { background: #f3f4f6; color: #000; }
      `}</style>
    </div>
  );
}
