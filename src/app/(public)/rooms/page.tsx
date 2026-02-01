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
    </div>
  );
}
