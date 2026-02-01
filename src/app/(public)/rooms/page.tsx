"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type DBRoom = {
  id: string;
  name: string;
  base_price: number;
  max_guests: number;
  description: string | null;
  amenities: string[] | null;
  images: string[] | null;
};

type Room = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  maxGuests: number;
  size: string;
  images: string[];
  amenities: string[];
  description: string;
  highlights: string[];
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [filterPrice, setFilterPrice] = useState("all");

  useEffect(() => {
    fetchRooms();

    const subscription = supabase
      .channel('public-rooms-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms'
      }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchRooms() {
    setLoading(true);

    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const mappedRooms = (data as DBRoom[]).map(mapRoom);
    setRooms(mappedRooms);
    setLoading(false);
  }

  function mapRoom(room: DBRoom): Room {
    return {
      id: room.id,
      name: room.name,
      price: room.base_price,
      originalPrice: Math.round(room.base_price * 1.25),
      maxGuests: room.max_guests,
      size: "350 sq ft",
      images: room.images && room.images.length > 0 ? room.images : ['/placeholder-room.jpg'],
      amenities: room.amenities || [],
      description: room.description || "Beautiful room with modern amenities",
      highlights: room.amenities?.slice(0, 3) || [],
    };
  }

  const priceRanges = [
    { id: "all", label: "All Rooms", min: 0, max: Infinity },
    { id: "budget", label: "Under ₹2500", min: 0, max: 2500 },
    { id: "standard", label: "₹2500 - ₹3000", min: 2500, max: 3000 },
  ];

  const filteredRooms = rooms.filter((room) => {
    const range = priceRanges.find((r) => r.id === filterPrice)!;
    return room.price >= range.min && room.price <= range.max;
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
    if (!selectedRoom) return;
    setActiveImageIndex((prev) =>
      prev === selectedRoom.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!selectedRoom) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? selectedRoom.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="rooms-page">
      <div className="rooms-hero">
        <div className="hero-content">
          <h1>Our Rooms & Suites</h1>
          <p>Choose your perfect coastal retreat</p>
        </div>
      </div>

      <div className="container">
        <div className="rooms-filter-section">
          <h3>Filter by Price</h3>
          <div className="filter-buttons">
            {priceRanges.map((range) => (
              <button
                key={range.id}
                className={`filter-btn ${filterPrice === range.id ? "active" : ""}`}
                onClick={() => setFilterPrice(range.id)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading rooms...</p>
          </div>
        )}

        {!loading && (
          <div className="rooms-grid">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="room-card card"
                onClick={() => openRoomDetails(room)}
              >
                <div className="room-image-wrapper">
                  <img 
                    src={room.images[0]} 
                    alt={room.name}
                    className="room-image"
                  />
                  {room.images.length > 1 && (
                    <div className="image-count-badge">
                      {room.images.length} photos
                    </div>
                  )}
                </div>

                <div className="room-content">
                  <div className="room-header">
                    <h3>{room.name}</h3>
                    <div className="room-highlights">
                      {room.highlights.map((h, i) => (
                        <span key={i} className="highlight-badge">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="room-meta">
                    <span className="meta-item">
                      Max {room.maxGuests} Guests
                    </span>
                    <span className="meta-item-separator">•</span>
                    <span className="meta-item">
                      {room.size}
                    </span>
                  </div>

                  <p className="room-description">{room.description}</p>

                  <div className="amenities-preview">
                    {room.amenities.slice(0, 4).map((amenity, i) => (
                      <span key={i} className="amenity-tag">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="more-amenities">
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="room-footer">
                    <div className="pricing">
                      <span className="original-price">₹{room.originalPrice}</span>
                      <span className="current-price">₹{room.price}</span>
                      <span className="price-label">per night</span>
                    </div>
                    <button className="view-details-btn">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredRooms.length === 0 && (
          <div className="empty-state">
            <h3>No rooms found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>

      {selectedRoom && (
        <div className="modal-overlay" onClick={closeRoomDetails}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeRoomDetails}>
              &times;
            </button>

            <div className="gallery-section">
              <div className="gallery-main">
                <img 
                  src={selectedRoom.images[activeImageIndex]} 
                  alt={selectedRoom.name}
                  className="gallery-image"
                />
                {selectedRoom.images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="gallery-nav gallery-prev">
                      &lsaquo;
                    </button>
                    <button onClick={nextImage} className="gallery-nav gallery-next">
                      &rsaquo;
                    </button>
                    <div className="gallery-counter">
                      {activeImageIndex + 1} / {selectedRoom.images.length}
                    </div>
                  </>
                )}
              </div>

              {selectedRoom.images.length > 1 && (
                <div className="gallery-thumbnails">
                  {selectedRoom.images.map((img, i) => (
                    <div
                      key={i}
                      className={`gallery-thumb ${i === activeImageIndex ? "active" : ""}`}
                      onClick={() => setActiveImageIndex(i)}
                    >
                      <img src={img} alt={`${selectedRoom.name} ${i + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-details">
              <div className="modal-header-section">
                <div>
                  <h2>{selectedRoom.name}</h2>
                  <div className="modal-highlights">
                    {selectedRoom.highlights.map((h, i) => (
                      <span key={i} className="highlight-pill">
                        {h}
                      </span>
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
                <div className="meta-card">
                  <strong>Max Guests</strong>
                  <p>Up to {selectedRoom.maxGuests} people</p>
                </div>
                <div className="meta-card">
                  <strong>Room Size</strong>
                  <p>{selectedRoom.size}</p>
                </div>
                <div className="meta-card">
                  <strong>View</strong>
                  <p>Garden/Sea View</p>
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
                      <span className="check-icon">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <Link href="/book" className="cta-button">
                  Book Now
                </Link>
                <button onClick={closeRoomDetails} className="btn-secondary">
                  Close
                </button>
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
}

.rooms-hero {
  padding: 8rem 2rem 4rem;
  text-align: center;
  position: relative;
}

.rooms-hero h1 {
  font-size: clamp(3rem, 8vw, 5rem);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff, #f97316, #0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 0.8s ease-out;
}

.rooms-hero p {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  color: #cbd5e1;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.rooms-filter-section {
  margin-bottom: 3rem;
  text-align: center;
}

.rooms-filter-section h3 {
  color: #f97316;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.room-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.room-card:hover {
  transform: translateY(-10px);
  border-color: #f97316;
  box-shadow: 0 25px 60px rgba(249, 115, 22, 0.3);
}

.room-image-wrapper {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.room-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.room-card:hover .room-image {
  transform: scale(1.1);
}

.image-count-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(15, 23, 42, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: white;
  backdrop-filter: blur(10px);
}

/* Room Content */
.room-content {
  padding: 1.5rem;
}

.room-header h3 {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 0.5rem;
}

.room-highlights {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
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
  gap: 0.5rem;
  align-items: center;
  margin: 1rem 0;
  color: #cbd5e1;
  font-size: 0.95rem;
}

.meta-item-separator {
  color: #64748b;
}

.room-description {
  color: #94a3b8;
  line-height: 1.6;
  margin: 1rem 0;
}

.amenities-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
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
  margin-top: 1rem;
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

.view-details-btn {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.view-details-btn:hover {
  transform: translateX(5px);
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
}

.modal-overlay {
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
  overflow-y: auto;
}

.modal-container {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
  border: 2px solid rgba(249, 115, 22, 0.3);
  border-radius: 30px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: scaleIn 0.4s ease-out;
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

.modal-close-btn {
  position: sticky;
  top: 1.5rem;
  right: 1.5rem;
  float: right;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(249, 115, 22, 0.2);
  border: 1px solid rgba(249, 115, 22, 0.4);
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal-close-btn:hover {
  background: #f97316;
  transform: rotate(90deg);
}

.gallery-section {
  padding: 2rem;
}

.gallery-main {
  position: relative;
  height: 400px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(14, 165, 233, 0.1));
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  color: white;
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

.gallery-prev {
  left: 1rem;
}

.gallery-next {
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

.gallery-thumb:hover,
.gallery-thumb.active {
  border-color: #f97316;
  transform: scale(1.05);
}

.gallery-thumb.active {
  background: rgba(249, 115, 22, 0.2);
}

/* Modal Details */
.modal-details {
  padding: 0 2rem 2rem;
}

.modal-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.modal-header-section h2 {
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

.meta-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 16px;
  text-align: center;
}

.meta-card strong {
  display: block;
  color: #f97316;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.meta-card p {
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

.check-icon {
  color: #22c55e;
  font-weight: 700;
  font-size: 1.2rem;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
}

.btn-secondary {
  padding: 1.2rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
  color: #f97316;
  border: 2px solid #f97316;
}

.btn-secondary:hover {
  background: rgba(249, 115, 22, 0.1);
  transform: translateY(-3px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .rooms-grid {
    grid-template-columns: 1fr;
  }

  .modal-header-section {
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

  .gallery-main {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .filter-buttons {
    flex-direction: column;
  }

  .filter-btn {
    width: 100%;
  }
}
    `}</style>
      
    </div>
  );
}
