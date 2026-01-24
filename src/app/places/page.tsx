"use client";

import { useState } from 'react';

type Place = {
  id: number;
  name: string;
  category: string;
  distance: string;
  time: string;
  description: string;
  image: string;
  rating: number;
  highlights: string[];
};

export default function PlacesToVisit() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const places = [
    {
      id: 1,
      name: 'Alibag Beach',
      category: 'beach',
      distance: '3 km',
      time: '10 min',
      description: 'The main beach of Alibag, perfect for evening walks, water sports, and watching stunning sunsets.',
      image: '🏖️',
      rating: 4.5,
      highlights: ['Sunset Views', 'Water Sports', 'Horse Riding', 'Street Food']
    },
    {
      id: 2,
      name: 'Kolaba Fort',
      category: 'historical',
      distance: '4 km',
      time: '15 min',
      description: 'Ancient sea fort accessible during low tide. Built in 1662, features temples and stunning sea views.',
      image: '🏰',
      rating: 4.7,
      highlights: ['Historical Site', 'Low Tide Walk', 'Photography', 'Temple Visit']
    },
    {
      id: 3,
      name: 'Kashid Beach',
      category: 'beach',
      distance: '30 km',
      time: '45 min',
      description: 'Pristine white sand beach with crystal clear waters, perfect for swimming and relaxation.',
      image: '🌊',
      rating: 4.8,
      highlights: ['White Sand', 'Clean Beach', 'Swimming', 'Water Activities']
    },
    {
      id: 4,
      name: 'Murud-Janjira Fort',
      category: 'historical',
      distance: '45 km',
      time: '1 hour',
      description: 'Unconquered island fort with impressive architecture and rich history from the 15th century.',
      image: '🏛️',
      rating: 4.6,
      highlights: ['Island Fort', 'Boat Ride', 'History', 'Architecture']
    },
    {
      id: 5,
      name: 'Kihim Beach',
      category: 'beach',
      distance: '12 km',
      time: '25 min',
      description: 'Peaceful beach known for bird watching and beautiful flora, ideal for nature lovers.',
      image: '🦜',
      rating: 4.4,
      highlights: ['Bird Watching', 'Nature Trails', 'Quiet Beach', 'Photography']
    },
    {
      id: 6,
      name: 'Kanakeshwar Temple',
      category: 'spiritual',
      distance: '15 km',
      time: '30 min',
      description: 'Ancient hilltop temple with panoramic views of the Arabian Sea and Sahyadri mountains.',
      image: '🛕',
      rating: 4.5,
      highlights: ['Hilltop Temple', 'Panoramic Views', 'Trekking', 'Spiritual']
    },
    {
      id: 7,
      name: 'Birla Temple',
      category: 'spiritual',
      distance: '8 km',
      time: '20 min',
      description: 'Modern temple complex with beautiful architecture and serene atmosphere.',
      image: '🕉️',
      rating: 4.3,
      highlights: ['Modern Architecture', 'Peaceful', 'Well Maintained', 'Gardens']
    },
    {
      id: 8,
      name: 'Mandwa Beach',
      category: 'beach',
      distance: '18 km',
      time: '35 min',
      description: 'Popular beach destination with water sports, shacks, and stunning sunset views.',
      image: '🏄',
      rating: 4.6,
      highlights: ['Water Sports', 'Beach Shacks', 'Sunset', 'Parasailing']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Places', icon: '🗺️' },
    { id: 'beach', name: 'Beaches', icon: '🏖️' },
    { id: 'historical', name: 'Historical', icon: '🏰' },
    { id: 'spiritual', name: 'Spiritual', icon: '🛕' }
  ];

  const filteredPlaces = activeFilter === 'all' 
    ? places 
    : places.filter(p => p.category === activeFilter);

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
          {categories.map((cat, idx) => (
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

        {/* Places Grid */}
        <div className="places-grid">
          {filteredPlaces.map((place, idx) => (
            <div
              key={place.id}
              className="place-card"
              onClick={() => setSelectedPlace(place)}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="place-icon">{place.image}</div>
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
      </div>

      {/* Detail Modal */}
      {selectedPlace && (
        <div className="modal" onClick={() => setSelectedPlace(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPlace(null)}>×</button>
            
            <div className="modal-icon">{selectedPlace.image}</div>
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
              <button className="action-btn primary">Get Directions</button>
              <button className="action-btn secondary">Learn More</button>
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
          padding: 2rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: cardFadeIn 0.6s ease-out both;
          position: relative;
          overflow: hidden;
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

        .place-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
          padding: 3rem;
          max-width: 600px;
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
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
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
        }

        .close-btn:hover {
          background: #f97316;
          transform: rotate(90deg);
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

        .modal-content h2 {
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

          .modal-content {
            padding: 2rem 1.5rem;
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
        }
      `}</style>
    </div>
  );
}
