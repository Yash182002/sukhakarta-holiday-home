"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ---------- TYPES ---------- */
export type Room = {
  id: string;
  name: string;
  max_guests: number;
  base_price: number;
  description?: string;
  images?: string[];
  amenities?: string[];
};

/* ---------- PROPS ---------- */
interface HomeClientProps {
  rooms: Room[];
}

/* ---------- COMPONENT ---------- */
export default function HomeClient({ rooms: initialRooms }: HomeClientProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  useEffect(() => {
    // Set up real-time subscription
    const subscription = supabase
      .channel('home-rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        async () => {
          console.log('Room change detected on homepage');
          // Fetch updated rooms
          const { data } = await supabase
            .from('rooms')
            .select('*')
            .order('created_at', { ascending: true });
          
          if (data) {
            setRooms(data);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const features = [
    { icon: '🏖️', title: 'Beach Access', description: 'Minutes from pristine beaches' },
    { icon: '🍽️', title: 'Fine Dining', description: 'Authentic coastal cuisine' },
    { icon: '🏊', title: 'Pool & Spa', description: 'Relax in luxury' },
    { icon: '🎯', title: 'Activities', description: 'Water sports & adventures' }
  ];

  return (
    <main className="home-page">
      {/* Animated Background */}
      <div className="bg-gradient">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Paradise</h1>
          <p>Discover luxury coastal living in the heart of Alibag</p>
          <div className="hero-buttons">
            <Link href="/book" className="cta-button">
              Book Your Stay
            </Link>
            <Link href="/rooms" className="cta-button">
              Explore Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Sukhakarta</h2>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="rooms-section">
        <div className="container">
          <h2 className="section-title">Our Premium Rooms</h2>
          <p className="section-subtitle">Choose your perfect coastal retreat</p>
          
          <div className="rooms-grid">
            {rooms.map((room, idx) => (
              <article key={room.id} className="room-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                {room.images && room.images.length > 0 ? (
                  <div className="room-image-container">
                    <img 
                      src={room.images[0]} 
                      alt={room.name}
                      className="room-image"
                    />
                    {room.images.length > 1 && (
                      <div className="image-badge">
                        📷 {room.images.length} photos
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="room-icon">🏨</div>
                )}
                <div className="room-content">
                  <h3>{room.name}</h3>
                  {room.description && (
                    <p className="room-description">{room.description.slice(0, 100)}...</p>
                  )}
                  <div className="room-meta">
                    <span className="meta-item">
                      <span className="icon">👥</span>
                      <span>Max {room.max_guests} Guests</span>
                    </span>
                  </div>
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="amenities-preview">
                      {room.amenities.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="amenity-tag">✓ {amenity}</span>
                      ))}
                    </div>
                  )}
                  <div className="room-footer">
                    <div className="pricing">
                      <span className="price">₹{room.base_price}</span>
                      <span className="price-label">/ night</span>
                    </div>
                    <Link href="/book" className="book-btn">
                      Book Now →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready for Your Dream Vacation?</h2>
            <p>Book now and experience the best of coastal living</p>
            <Link href="/book" className="cta-button">
              Reserve Your Stay
            </Link>
          </div>
        </div>
      </section>

     
    </main>
  );
}
