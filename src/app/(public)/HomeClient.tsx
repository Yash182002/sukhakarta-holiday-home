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
            <Link href="/book" className="cta-btn">
              Reserve Your Stay
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-page {
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
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(100px, -100px); }
          66% { transform: translate(-100px, 100px); }
        }

        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          z-index: 1;
        }

        .hero-content {
          max-width: 900px;
        }

        .hero h1 {
          font-size: clamp(3rem, 8vw, 6rem);
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #fff, #f97316, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 0.8s ease-out;
        }

        .hero p {
          font-size: clamp(1.2rem, 3vw, 1.8rem);
          color: #cbd5e1;
          margin-bottom: 3rem;
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

        .hero-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .cta-button {
          padding: 1.2rem 3rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          display: inline-block;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
        }

        .cta-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
        }

        .features-section, .rooms-section, .cta-section {
          position: relative;
          z-index: 1;
          padding: 6rem 2rem;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          text-align: center;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
          text-align: center;
          color: #94a3b8;
          font-size: 1.2rem;
          margin-bottom: 4rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          text-align: center;
          padding: 2.5rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 24px;
          transition: all 0.4s;
          animation: slideUp 0.6s ease-out both;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .feature-card:hover {
          transform: translateY(-10px);
          border-color: #f97316;
          box-shadow: 0 20px 60px rgba(249, 115, 22, 0.3);
        }

        .feature-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          color: #f97316;
        }

        .feature-card p {
          color: #cbd5e1;
        }

        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2.5rem;
        }

        .room-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 24px;
          overflow: hidden;
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

        .room-image-container {
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

        .room-icon {
          font-size: 5rem;
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(14, 165, 233, 0.1));
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .room-content {
          padding: 2rem;
        }

        .room-content h3 {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          color: #f8fafc;
        }

        .room-description {
          color: #94a3b8;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .room-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #cbd5e1;
        }

        .meta-item .icon {
          font-size: 1.2rem;
        }

        .amenities-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .amenity-tag {
          padding: 0.4rem 0.8rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 8px;
          font-size: 0.85rem;
          color: #f97316;
        }

        .room-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(249, 115, 22, 0.2);
        }

        .pricing {
          display: flex;
          flex-direction: column;
        }

        .price {
          font-size: 2rem;
          font-weight: 700;
          color: #f97316;
        }

        .price-label {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .book-btn {
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-block;
        }

        .book-btn:hover {
          transform: translateX(5px);
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
        }

        .cta-section {
          background: rgba(249, 115, 22, 0.1);
          border-top: 1px solid rgba(249, 115, 22, 0.2);
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .cta-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: clamp(2.5rem, 6vw, 4rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cta-content p {
          font-size: 1.3rem;
          color: #cbd5e1;
          margin-bottom: 2.5rem;
        }

        .cta-btn {
          padding: 1.5rem 4rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          font-size: 1.2rem;
          font-weight: 700;
          text-decoration: none;
          border-radius: 50px;
          display: inline-block;
          transition: all 0.3s;
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.4);
        }

        .cta-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(249, 115, 22, 0.6);
        }

        @media (max-width: 768px) {
          .rooms-grid {
            grid-template-columns: 1fr;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-button {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </main>
  );
}
