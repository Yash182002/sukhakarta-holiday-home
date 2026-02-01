"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Place = {
  id: string;
  name: string;
  category: string;
  distance: string;
  time: string;
  description: string;
  images: string[];
  rating: number;
  highlights: string[];
  location_url?: string;
};

const CATEGORIES = [
  { id: 'all', name: 'All Places'},
  { id: 'beach', name: 'Beaches'},
  { id: 'historical', name: 'Historical'},
  { id: 'spiritual', name: 'Spiritual'},
  { id: 'adventure', name: 'Adventure'},
  { id: 'nature', name: 'Nature'}
];

export default function PlacesToVisit() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    loadPlaces();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public-places-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'places'
        },
        (payload) => {
          console.log('Place change detected:', payload);
          loadPlaces();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadPlaces() {
    setLoading(true);
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading places:', error);
    } else if (data) {
      setPlaces(data);
    }
    setLoading(false);
  }

  const filteredPlaces = activeFilter === 'all' 
    ? places 
    : places.filter(p => p.category === activeFilter);

  const openPlaceDetails = (place: Place) => {
    setSelectedPlace(place);
    setActiveImageIndex(0);
  };

  const closePlaceDetails = () => {
    setSelectedPlace(null);
    setActiveImageIndex(0);
  };

  const nextImage = () => {
    if (!selectedPlace || !selectedPlace.images) return;
    setActiveImageIndex((prev) =>
      prev === selectedPlace.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!selectedPlace || !selectedPlace.images) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? selectedPlace.images.length - 1 : prev - 1
    );
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.icon : '📍';
  };

  return (
    <div className="places-page">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h1>Explore Alibag</h1>
          <p>Discover the best beaches, forts, and attractions around Sukhakarta Holiday Home</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="container">
        <div className="filter-section">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              className={`filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat.id)}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="filter-icon">{cat.icon}</span>
              <span>{cat.name}</span>
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
              {filteredPlaces.map((place, idx) => (
                <div
                  key={place.id}
                  className="place-card"
                  onClick={() => openPlaceDetails(place)}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {place.images && place.images.length > 0 ? (
                    <div className="place-image-container">
                      <img 
                        src={place.images[0]} 
                        alt={place.name}
                        className="place-image"
                      />
                      {place.images.length > 1 && (
                        <div className="image-badge">
                          📷 {place.images.length} photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="place-icon">{getCategoryIcon(place.category)}</div>
                  )}

                  <div className="place-content">
                    <h3>{place.name}</h3>
                    <div className="place-meta">
                      <span className="distance">📍 {place.distance}</span>
                      <span className="time">⏱️ {place.time}</span>
                    </div>
                    <p className="description">{place.description}</p>
                    <div className="highlights">
                      {place.highlights.slice(0, 2).map((h, i) => (
                        <span key={i} className="highlight-tag">{h}</span>
                      ))}
                    </div>
                    <div className="card-footer">
                      <div className="rating">
                        ⭐ {place.rating}
                      </div>
                      <span className="view-more">View Details →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPlaces.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon">📍</div>
                <h3>No places found</h3>
                <p>Try selecting a different category</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPlace && (
        <div className="modal" onClick={closePlaceDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closePlaceDetails}>×</button>
            
            {/* Image Gallery */}
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
                        className={`gallery-thumb ${
                          i === activeImageIndex ? "active" : ""
                        }`}
                        onClick={() => setActiveImageIndex(i)}
                      >
                        <img src={img} alt={`${selectedPlace.name} ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="modal-details">
              <div className="modal-icon">{getCategoryIcon(selectedPlace.category)}</div>
              <h2>{selectedPlace.name}</h2>
              
              <div className="modal-meta">
                <div className="meta-item">
                  <span className="meta-label">Distance</span>
                  <span className="meta-value">📍 {selectedPlace.distance}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Travel Time</span>
                  <span className="meta-value">⏱️ {selectedPlace.time}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Rating</span>
                  <span className="meta-value">⭐ {selectedPlace.rating}</span>
                </div>
              </div>

              <p className="modal-description">{selectedPlace.description}</p>

              <div className="modal-highlights">
                <h4>Highlights</h4>
                <div className="highlights-grid">
                  {selectedPlace.highlights.map((h, i) => (
                    <span key={i} className="highlight-pill">{h}</span>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                {selectedPlace.location_url ? (
                  <a 
                    href={selectedPlace.location_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-btn primary"
                  >
                    Get Directions
                  </a>
                ) : (
                  <button className="action-btn primary">Get Directions</button>
                )}
                <button onClick={closePlaceDetails} className="action-btn secondary">
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
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .hero {
          position: relative;
          height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(14, 165, 233, 0.3));
          animation: pulse 8s ease-in-out infinite;
        }

        .hero-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 50px,
            rgba(249, 115, 22, 0.1) 50px,
            rgba(249, 115, 22, 0.1) 100px
          );
          animation: slide 20s linear infinite;
        }

        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 2rem;
        }

        .hero h1 {
          font-size: clamp(3rem, 8vw, 5rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 0.8s ease-out;
        }

        .hero p {
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          color: #cbd5e1;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .filter-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(249, 115, 22, 0.2);
          border-radius: 50px;
          color: #f8fafc;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          animation: slideIn 0.5s ease-out both;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filter-btn:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: #f97316;
          transform: translateY(-3px);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-color: #f97316;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
        }

        .filter-icon {
          font-size: 1.5rem;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(249, 115, 22, 0.2);
          border-top-color: #f97316;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .places-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .place-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: cardFadeIn 0.6s ease-out both;
          position: relative;
        }

        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .place-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.2), transparent);
          transition: left 0.5s;
        }

        .place-card:hover::before {
          left: 100%;
        }

        .place-card:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: #f97316;
          box-shadow: 0 20px 60px rgba(249, 115, 22, 0.3);
        }

        .place-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .place-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }

        .place-card:hover .place-image {
          transform: scale(1.1);
        }

        .image-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(15, 23, 42, 0.9);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          backdrop-filter: blur(10px);
        }

        .place-icon {
          font-size: 4rem;
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(14, 165, 233, 0.1));
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .place-content {
          padding: 2rem;
        }

        .place-content h3 {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          color: #f97316;
        }

        .place-meta {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .description {
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .highlights {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .highlight-tag {
          padding: 0.25rem 0.75rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 20px;
          font-size: 0.85rem;
          color: #f97316;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(249, 115, 22, 0.2);
        }

        .rating {
          font-weight: 600;
          color: #fbbf24;
        }

        .view-more {
          color: #f97316;
          font-weight: 600;
          transition: transform 0.3s;
        }

        .place-card:hover .view-more {
          transform: translateX(5px);
        }

        .no-results {
          text-align: center;
          padding: 4rem 2rem;
        }

        .no-results-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-results h3 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #f97316;
        }

        .no-results p {
          color: #94a3b8;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          animation: fadeIn 0.3s ease-out;
          overflow-y: auto;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(249, 115, 22, 0.3);
          border-radius: 30px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .close-btn {
          position: sticky;
          top: 1.5rem;
          right: 1.5rem;
          float: right;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.2);
          border: 1px solid rgba(249, 115, 22, 0.3);
          color: #f8fafc;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .close-btn:hover {
          background: #f97316;
          transform: rotate(90deg);
        }

        .gallery {
          padding: 2rem 2rem 1rem;
        }

        .gallery-main {
          position: relative;
          height: 400px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: imageZoom 0.3s ease-out;
        }

        @keyframes imageZoom {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .gallery-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(249, 115, 22, 0.3);
          color: #f8fafc;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gallery-nav:hover {
          background: #f97316;
          transform: translateY(-50%) scale(1.1);
        }

        .gallery-nav.prev {
          left: 1rem;
        }

        .gallery-nav.next {
          right: 1rem;
        }

        .gallery-counter {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          background: rgba(15, 23, 42, 0.9);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .gallery-thumbnails {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.75rem;
        }

        .gallery-thumb {
          aspect-ratio: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(249, 115, 22, 0.2);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
        }

        .gallery-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-thumb:hover {
          border-color: #f97316;
          transform: scale(1.05);
        }

        .gallery-thumb.active {
          border-color: #f97316;
          background: rgba(249, 115, 22, 0.2);
        }

        .modal-details {
          padding: 0 2rem 2rem;
        }

        .modal-icon {
          font-size: 5rem;
          text-align: center;
          margin-bottom: 1.5rem;
          animation: bounce 0.6s ease-out;
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .modal-details h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 2rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .modal-meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .meta-item {
          text-align: center;
          padding: 1rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 15px;
        }

        .meta-label {
          display: block;
          font-size: 0.85rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .meta-value {
          display: block;
          font-weight: 600;
          color: #f97316;
        }

        .modal-description {
          line-height: 1.8;
          color: #cbd5e1;
          margin-bottom: 2rem;
        }

        .modal-highlights h4 {
          margin-bottom: 1rem;
          color: #f97316;
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .highlight-pill {
          padding: 0.75rem 1rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 12px;
          text-align: center;
          color: #f8fafc;
          font-size: 0.9rem;
          transition: all 0.3s;
        }

        .highlight-pill:hover {
          background: rgba(249, 115, 22, 0.2);
          transform: scale(1.05);
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .action-btn {
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: block;
          text-align: center;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
        }

        .action-btn.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
        }

        .action-btn.secondary {
          background: transparent;
          color: #f97316;
          border: 2px solid #f97316;
        }

        .action-btn.secondary:hover {
          background: rgba(249, 115, 22, 0.1);
          transform: translateY(-3px);
        }

        @media (max-width: 768px) {
          .hero {
            height: 40vh;
          }

          .places-grid {
            grid-template-columns: 1fr;
          }

          .filter-section {
            gap: 0.75rem;
          }

          .filter-btn {
            padding: 0.75rem 1.5rem;
            font-size: 0.9rem;
          }

          .modal-meta {
            grid-template-columns: 1fr;
          }

          .highlights-grid {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            grid-template-columns: 1fr;
          }

          .gallery-main {
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
}
