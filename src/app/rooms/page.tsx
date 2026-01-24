"use client";
import { useState } from 'react';

type Room = {
  id: number;
  name: string;
  type: string;
  price: number;
  originalPrice: number;
  maxGuests: number;
  size: string;
  view: string;
  images: string[];
  amenities: string[];
  description: string;
  highlights: string[];
};

export default function RoomsPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [filterPrice, setFilterPrice] = useState('all');

  const rooms = [
    {
      id: 1,
      name: 'Standard Room',
      type: 'standard',
      price: 2500,
      originalPrice: 3000,
      maxGuests: 2,
      size: '250 sq ft',
      view: 'Garden View',
      images: ['🛏️', '🪟', '🚿', '📺'],
      amenities: [
        'Air Conditioning',
        'Free WiFi',
        'LED TV',
        'Hot Water',
        'Room Service',
        'Wardrobe',
        'Work Desk',
        'Complimentary Breakfast'
      ],
      description: 'Cozy and comfortable rooms perfect for couples or solo travelers. Enjoy modern amenities and a peaceful garden view.',
      highlights: ['Best Value', 'Garden View', 'Free WiFi']
    },
    {
      id: 2,
      name: 'Deluxe Sea View',
      type: 'deluxe',
      price: 3500,
      originalPrice: 4200,
      maxGuests: 3,
      size: '350 sq ft',
      view: 'Sea View',
      images: ['🌊', '🛏️', '🏖️', '🌅'],
      amenities: [
        'Air Conditioning',
        'Free WiFi',
        'Smart TV',
        'Private Balcony',
        'Sea View',
        'Mini Fridge',
        'Hot Water',
        'Premium Toiletries',
        'Room Service',
        'Complimentary Breakfast'
      ],
      description: 'Spacious rooms with stunning sea views from your private balcony. Wake up to the sound of waves and breathtaking sunsets.',
      highlights: ['Most Popular', 'Sea View', 'Private Balcony']
    },
    {
      id: 3,
      name: 'Premium Suite',
      type: 'suite',
      price: 5000,
      originalPrice: 6000,
      maxGuests: 4,
      size: '500 sq ft',
      view: 'Panoramic Sea View',
      images: ['👑', '🌊', '🛋️', '🍾'],
      amenities: [
        'Air Conditioning',
        'Free WiFi',
        'Smart TV',
        'Separate Living Area',
        'Panoramic Sea View',
        'Premium Furnishing',
        'King Size Bed',
        'Jacuzzi',
        'Mini Bar',
        'Hot Water',
        'Luxury Toiletries',
        '24/7 Room Service',
        'Complimentary Breakfast',
        'Welcome Drinks'
      ],
      description: 'Ultimate luxury with separate living space, premium furnishings, and panoramic ocean views. Perfect for families or special occasions.',
      highlights: ['Luxury', 'Jacuzzi', 'Living Area']
    },
    {
      id: 4,
      name: 'Family Room',
      type: 'family',
      price: 4000,
      originalPrice: 4800,
      maxGuests: 5,
      size: '450 sq ft',
      view: 'Garden & Pool View',
      images: ['👨‍👩‍👧‍👦', '🏊', '🛏️', '🎮'],
      amenities: [
        'Air Conditioning',
        'Free WiFi',
        'Two LED TVs',
        'Two Beds',
        'Pool View',
        'Hot Water',
        'Extra Space',
        'Gaming Console',
        'Mini Fridge',
        'Room Service',
        'Complimentary Breakfast',
        'Kids Play Area Access'
      ],
      description: 'Spacious family room with pool view, perfect for families with children. Extra amenities to keep everyone entertained.',
      highlights: ['Family Friendly', 'Pool View', 'Gaming Console']
    },
    {
      id: 5,
      name: 'Honeymoon Suite',
      type: 'honeymoon',
      price: 5500,
      originalPrice: 6500,
      maxGuests: 2,
      size: '400 sq ft',
      view: 'Private Beach View',
      images: ['💑', '🌹', '🥂', '🌊'],
      amenities: [
        'Air Conditioning',
        'Free WiFi',
        'Smart TV',
        'Romantic Decor',
        'Private Beach Access',
        'King Size Bed',
        'Jacuzzi',
        'Champagne on Arrival',
        'Flower Decoration',
        'Candlelight Dinner',
        'Luxury Toiletries',
        '24/7 Room Service',
        'Late Checkout'
      ],
      description: 'Romantic suite designed for couples. Enjoy private beach access, romantic decor, and special honeymoon amenities.',
      highlights: ['Romantic', 'Private Beach', 'Special Decor']
    },
    {
      id: 6,
      name: 'Executive Room',
      type: 'executive',
      price: 4200,
      originalPrice: 5000,
      maxGuests: 2,
      size: '380 sq ft',
      view: 'City & Sea View',
      images: ['💼', '🖥️', '☕', '🌊'],
      amenities: [
        'Air Conditioning',
        'High-Speed WiFi',
        'Smart TV',
        'Work Desk',
        'Ergonomic Chair',
        'Coffee Maker',
        'Sea View',
        'Hot Water',
        'Premium Toiletries',
        'Business Center Access',
        'Room Service',
        'Complimentary Breakfast',
        'Express Laundry'
      ],
      description: 'Perfect for business travelers. Dedicated workspace, high-speed internet, and all business amenities you need.',
      highlights: ['Business', 'Work Desk', 'High-Speed WiFi']
    }
  ];

  const priceRanges = [
    { id: 'all', label: 'All Rooms', min: 0, max: Infinity },
    { id: 'budget', label: 'Under ₹3000', min: 0, max: 3000 },
    { id: 'mid', label: '₹3000 - ₹4500', min: 3000, max: 4500 },
    { id: 'luxury', label: 'Above ₹4500', min: 4500, max: Infinity }
  ];

  const filteredRooms = rooms.filter(room => {
    const range = priceRanges.find(r => r.id === filterPrice);
    return room.price >= range!.min && room.price <= range!.max;
  });

  const openRoomDetails = (room: Room) => {
    setSelectedRoom(room);
    setActiveImageIndex(0);
  };

  const closeRoomDetails = () => {
    setSelectedRoom(null);
    setActiveImageIndex(0);
  };

  const nextImage = () => {
    if (selectedRoom) {
      setActiveImageIndex((prev) => 
        prev === selectedRoom.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedRoom) {
      setActiveImageIndex((prev) => 
        prev === 0 ? selectedRoom.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="rooms-page">
      {/* Animated Background */}
      <div className="bg-gradient">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1>Our Rooms & Suites</h1>
          <p>Choose your perfect coastal retreat</p>
        </div>
      </div>

      <div className="container">
        {/* Filter Section */}
        <div className="filter-bar">
          <h3>Filter by Price</h3>
          <div className="filter-buttons">
            {priceRanges.map((range) => (
              <button
                key={range.id}
                className={`filter-btn ${filterPrice === range.id ? 'active' : ''}`}
                onClick={() => setFilterPrice(range.id)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="rooms-grid">
          {filteredRooms.map((room, idx) => (
            <div
              key={room.id}
              className="room-card"
              style={{ animationDelay: `${idx * 0.1}s` }}
              onClick={() => openRoomDetails(room)}
            >
              {/* Room Image Gallery Preview */}
              <div className="room-gallery-preview">
                <div className="main-image">{room.images[0]}</div>
                <div className="thumbnail-strip">
                  {room.images.slice(1, 4).map((img, i) => (
                    <div key={i} className="thumbnail">{img}</div>
                  ))}
                </div>
                <div className="image-count">+{room.images.length} photos</div>
              </div>

              {/* Room Info */}
              <div className="room-info">
                <div className="room-header">
                  <h3>{room.name}</h3>
                  <div className="room-highlights">
                    {room.highlights.slice(0, 2).map((h, i) => (
                      <span key={i} className="highlight-badge">{h}</span>
                    ))}
                  </div>
                </div>

                <div className="room-meta">
                  <div className="meta-item">
                    <span className="icon">👥</span>
                    <span>{room.maxGuests} Guests</span>
                  </div>
                  <div className="meta-item">
                    <span className="icon">📏</span>
                    <span>{room.size}</span>
                  </div>
                  <div className="meta-item">
                    <span className="icon">🪟</span>
                    <span>{room.view}</span>
                  </div>
                </div>

                <p className="room-description">{room.description.substring(0, 100)}...</p>

                <div className="amenities-preview">
                  {room.amenities.slice(0, 4).map((amenity, i) => (
                    <span key={i} className="amenity-tag">✓ {amenity}</span>
                  ))}
                  {room.amenities.length > 4 && (
                    <span className="more-amenities">+{room.amenities.length - 4} more</span>
                  )}
                </div>

                <div className="room-footer">
                  <div className="pricing">
                    <span className="original-price">₹{room.originalPrice}</span>
                    <span className="current-price">₹{room.price}</span>
                    <span className="price-label">/ night</span>
                  </div>
                  <button className="details-btn">View Details →</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No rooms found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="modal" onClick={closeRoomDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeRoomDetails}>×</button>

            {/* Image Gallery */}
            <div className="gallery">
              <div className="gallery-main">
                <button className="gallery-nav prev" onClick={prevImage}>‹</button>
                <div className="gallery-image">{selectedRoom.images[activeImageIndex]}</div>
                <button className="gallery-nav next" onClick={nextImage}>›</button>
                <div className="gallery-counter">
                  {activeImageIndex + 1} / {selectedRoom.images.length}
                </div>
              </div>
              <div className="gallery-thumbnails">
                {selectedRoom.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`gallery-thumb ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    {img}
                  </div>
                ))}
              </div>
            </div>

            {/* Room Details */}
            <div className="modal-details">
              <div className="modal-header">
                <div>
                  <h2>{selectedRoom.name}</h2>
                  <div className="modal-highlights">
                    {selectedRoom.highlights.map((h, i) => (
                      <span key={i} className="highlight-pill">{h}</span>
                    ))}
                  </div>
                </div>
                <div className="modal-pricing">
                  <span className="modal-original-price">₹{selectedRoom.originalPrice}</span>
                  <span className="modal-current-price">₹{selectedRoom.price}</span>
                  <span className="modal-price-label">per night</span>
                </div>
              </div>

              <div className="modal-meta-grid">
                <div className="modal-meta-item">
                  <span className="meta-icon">👥</span>
                  <div>
                    <strong>Max Guests</strong>
                    <p>{selectedRoom.maxGuests} People</p>
                  </div>
                </div>
                <div className="modal-meta-item">
                  <span className="meta-icon">📏</span>
                  <div>
                    <strong>Room Size</strong>
                    <p>{selectedRoom.size}</p>
                  </div>
                </div>
                <div className="modal-meta-item">
                  <span className="meta-icon">🪟</span>
                  <div>
                    <strong>View</strong>
                    <p>{selectedRoom.view}</p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Description</h3>
                <p>{selectedRoom.description}</p>
              </div>

              <div className="modal-section">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {selectedRoom.amenities.map((amenity, i) => (
                    <div key={i} className="amenity-item">
                      <span className="check">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <a href="/book" className="book-btn primary">Book Now</a>
                <a href="/contact" className="book-btn secondary">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rooms-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
        }

        .bg-gradient {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 0;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float 15s ease-in-out infinite;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: #f97316;
          top: -200px;
          right: -200px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: #0ea5e9;
          bottom: -150px;
          left: -150px;
          animation-delay: 5s;
        }

        .orb-3 {
          width: 400px;
          height: 400px;
          background: #22c55e;
          top: 50%;
          left: 50%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(100px, -100px);
          }
          66% {
            transform: translate(-100px, 100px);
          }
        }

        .hero {
          position: relative;
          padding: 8rem 2rem 4rem;
          text-align: center;
          z-index: 1;
        }

        .hero-content h1 {
          font-size: clamp(3rem, 8vw, 5rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 0.8s ease-out;
        }

        .hero-content p {
          font-size: 1.5rem;
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
          padding: 0 2rem 4rem;
          position: relative;
          z-index: 1;
        }

        .filter-bar {
          margin-bottom: 3rem;
          text-align: center;
        }

        .filter-bar h3 {
          color: #f97316;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .filter-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.875rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(249, 115, 22, 0.2);
          border-radius: 50px;
          color: #f8fafc;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-btn:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: #f97316;
          transform: translateY(-2px);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-color: #f97316;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
        }

        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 2.5rem;
        }

        .room-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: cardSlideUp 0.6s ease-out both;
        }

        @keyframes cardSlideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .room-card:hover {
          transform: translateY(-10px);
          border-color: #f97316;
          box-shadow: 0 25px 60px rgba(249, 115, 22, 0.3);
        }

        .room-gallery-preview {
          position: relative;
          height: 250px;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(14, 165, 233, 0.1));
          overflow: hidden;
        }

        .main-image {
          font-size: 8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 180px;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .thumbnail-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          padding: 0 1rem;
          margin-top: -20px;
        }

        .thumbnail {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 8px;
          padding: 0.5rem;
          text-align: center;
          font-size: 1.5rem;
        }

        .image-count {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          border: 1px solid rgba(249, 115, 22, 0.3);
        }

        .room-info {
          padding: 1.5rem;
        }

        .room-header {
          margin-bottom: 1rem;
        }

        .room-header h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #f8fafc;
        }

        .room-highlights {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .highlight-badge {
          padding: 0.25rem 0.75rem;
          background: rgba(249, 115, 22, 0.2);
          border: 1px solid rgba(249, 115, 22, 0.4);
          border-radius: 12px;
          font-size: 0.75rem;
          color: #f97316;
          font-weight: 600;
        }

        .room-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .meta-item .icon {
          font-size: 1.2rem;
        }

        .room-description {
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .amenities-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .amenity-tag {
          padding: 0.4rem 0.8rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 8px;
          font-size: 0.85rem;
          color: #cbd5e1;
        }

        .more-amenities {
          padding: 0.4rem 0.8rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 8px;
          font-size: 0.85rem;
          color: #f97316;
          font-weight: 600;
        }

        .room-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(249, 115, 22, 0.2);
        }

        .pricing {
          display: flex;
          flex-direction: column;
        }

        .original-price {
          font-size: 0.9rem;
          color: #64748b;
          text-decoration: line-through;
        }

        .current-price {
          font-size: 1.8rem;
          font-weight: 700;
          color: #f97316;
        }

        .price-label {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .details-btn {
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .details-btn:hover {
          transform: translateX(5px);
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
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
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(249, 115, 22, 0.3);
          border-radius: 30px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
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
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.2);
          border: 1px solid rgba(249, 115, 22, 0.4);
          color: #f8fafc;
          font-size: 1.8rem;
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
          height: 350px;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(14, 165, 233, 0.1));
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .gallery-image {
          font-size: 12rem;
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
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(249, 115, 22, 0.2);
          border-radius: 12px;
          padding: 0.75rem;
          font-size: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
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

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        .modal-header h2 {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .modal-highlights {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .highlight-pill {
          padding: 0.5rem 1rem;
          background: rgba(249, 115, 22, 0.2);
          border: 1px solid rgba(249, 115, 22, 0.4);
          border-radius: 20px;
          font-size: 0.9rem;
          color: #f97316;
          font-weight: 600;
        }

        .modal-pricing {
          text-align: right;
        }

        .modal-original-price {
          display: block;
          font-size: 1rem;
          color: #64748b;
          text-decoration: line-through;
        }

        .modal-current-price {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          color: #f97316;
        }

        .modal-price-label {
          display: block;
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .modal-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .modal-meta-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
        }

        .meta-icon {
          font-size: 2rem;
        }

        .modal-meta-item strong {
          display: block;
          color: #f97316;
          margin-bottom: 0.25rem;
        }

        .modal-meta-item p {
          color: #cbd5e1;
          margin: 0;
        }

        .modal-section {
          margin-bottom: 2rem;
        }

        .modal-section h3 {
          font-size: 1.5rem;
          color: #f97316;
          margin-bottom: 1rem;
        }

        .modal-section p {
          color: #cbd5e1;
          line-height: 1.8;
        }

        .amenities-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .amenity-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 10px;
          color: #cbd5e1;
          transition: all 0.3s;
        }

        .amenity-item:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: #f97316;
        }

        .amenity-item .check {
          color: #22c55e;
          font-weight: 700;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .book-btn {
          padding: 1.2rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s;
          display: block;
        }

        .book-btn.primary {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
          border: none;
        }

        .book-btn.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
        }

        .book-btn.secondary {
          background: transparent;
          color: #f97316;
          border: 2px solid #f97316;
        }

        .book-btn.secondary:hover {
          background: rgba(249, 115, 22, 0.1);
          transform: translateY(-3px);
        }

        @media (max-width: 968px) {
          .rooms-grid {
            grid-template-columns: 1fr;
          }

          .modal-header {
            flex-direction: column;
          }

          .modal-pricing {
            text-align: left;
          }

          .modal-meta-grid {
            grid-template-columns: 1fr;
          }

          .amenities-grid {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            grid-template-columns: 1fr;
          }

          .gallery-image {
            font-size: 8rem;
          }

          .filter-buttons {
            flex-direction: column;
          }

          .filter-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .modal-content {
            padding: 1rem;
          }

          .gallery {
            padding: 1rem;
          }

          .gallery-main {
            height: 250px;
          }

          .gallery-image {
            font-size: 6rem;
          }

          .modal-details {
            padding: 0 1rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
