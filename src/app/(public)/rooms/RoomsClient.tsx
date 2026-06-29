"use client";

import { useEffect, useState, useCallback, memo, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from 'next/image';

type DBRoom = {
  id: string;
  name: string;
  base_price: number;
  max_guests: number;
  description: string | null;
  amenities: string[] | null;
  images: string[] | null;
  size: string | null;
  view: string | null;
  created_at?: string;
};

type Room = {
  id: string;
  name: string;
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

function mapRoom(room: DBRoom): Room {
  return {
    id: room.id,
    name: room.name,
    price: room.base_price,
    originalPrice: Math.round(room.base_price * 1.25),
    maxGuests: room.max_guests,
    size: room.size || "Not specified",
    view: room.view || "Standard View",
    images: room.images && room.images.length > 0 ? room.images : ['/placeholder-room.jpg'],
    amenities: room.amenities || [],
    description: room.description || "Beautiful room with modern amenities",
    highlights: room.amenities?.slice(0, 3) || [],
  };
}

const GalleryThumbnail = memo(({
  image, index, isActive, onClick, roomName,
}: {
  image: string; index: number; isActive: boolean;
  onClick: (i: number) => void; roomName: string;
}) => {
  const handleClick = useCallback(() => onClick(index), [index, onClick]);
  return (
    <div className={`gallery-thumb ${isActive ? "active" : ""}`} onClick={handleClick}>
      <div className="thumb-bg" style={{ backgroundImage: `url(${image})` }} aria-hidden="true" />
      <Image src={image} alt={`${roomName} ${index + 1}`} fill sizes="72px"
        style={{ objectFit: "contain", zIndex: 1 }} loading="lazy" />
    </div>
  );
});
GalleryThumbnail.displayName = "GalleryThumbnail";

const AmenityItem = memo(({ amenity }: { amenity: string }) => (
  <div className="hc-amenity-item">
    <svg className="hc-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <span>{amenity}</span>
  </div>
));
AmenityItem.displayName = "AmenityItem";

const RoomCard = memo(({
  room, index, onOpenDetails,
}: {
  room: Room; index: number; onOpenDetails: (room: Room) => void;
}) => {
  const handleClick = useCallback(() => onOpenDetails(room), [room, onOpenDetails]);
  return (
    <div
      className="room-card reveal"
      onClick={handleClick}
      style={{ "--delay": `${index * 80}ms` } as React.CSSProperties}
    >
      <div className="card-image-wrap">
        <div
          className="card-img-bg"
          style={{ backgroundImage: `url(${room.images[0]})` }}
          aria-hidden="true"
        />
        <Image
          src={room.images[0]} alt={room.name} fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          style={{ objectFit: "contain", zIndex: 1 }}
          priority={index < 2} loading={index < 2 ? "eager" : "lazy"}
        />
        <div className="card-image-overlay" />
        {room.images.length > 1 && (
          <div className="photo-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {room.images.length}
          </div>
        )}
        <div className="price-badge">
          <span className="price-orig">₹{room.originalPrice}</span>
          <span className="price-curr">₹{room.price}</span>
          <span className="price-unit">/night</span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-name">{room.name}</h3>
        <div className="card-tags">
          <span className="tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {room.maxGuests} guests
          </span>
          <span className="tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            {room.size}
          </span>
          <span className="tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            </svg>
            {room.view}
          </span>
        </div>
        <p className="card-desc">{room.description}</p>
        {room.highlights.length > 0 && (
          <div className="card-highlights">
            {room.highlights.map((h, i) => (
              <span key={i} className="highlight-chip">✓ {h}</span>
            ))}
          </div>
        )}
        <div className="card-footer">
          <button className="view-btn">View Details</button>
        </div>
      </div>
    </div>
  );
});
RoomCard.displayName = "RoomCard";

// ─── Main client component ───────────────────────────────────────────────────

export default function RoomsClient({ initialRooms }: { initialRooms: DBRoom[] }) {
  // Seed state from SSR data — no loading spinner on first paint
  const [rooms, setRooms]               = useState<Room[]>(initialRooms.map(mapRoom));
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
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
    document.querySelectorAll(".reveal").forEach((el) => observerRef.current?.observe(el));
  }, []);

  useEffect(() => {
    // Realtime updates only — initial data came from the server
    const abortController = new AbortController();

    const fetchRooms = async () => {
      try {
        const { data, error } = await supabase
          .from("rooms").select("id, name, base_price, max_guests, description, images, amenities, size, view")
          .order("created_at", { ascending: true })
          .abortSignal(abortController.signal);
        if (error) throw error;
        if (data) setRooms((data as DBRoom[]).map(mapRoom));
      } catch (error: any) {
        if (error.name !== "AbortError" && !abortController.signal.aborted)
          console.error("Error fetching rooms:", error);
      }
    };

    const channel = supabase
      .channel("public-rooms-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, fetchRooms)
      .subscribe();

    return () => {
      abortController.abort();
      supabase.removeChannel(channel);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;
    raf = requestAnimationFrame(() => { timeout = setTimeout(setupObserver, 50); });
    return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
  }, [rooms, setupObserver]);

  const openRoomDetails = useCallback((room: Room) => {
    setSelectedRoom(room); setActiveImageIndex(0);
    document.body.style.overflow = "hidden";
  }, []);

  const closeRoomDetails = useCallback(() => {
    setSelectedRoom(null); setActiveImageIndex(0);
    document.body.style.overflow = "";
  }, []);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedRoom((prev) => {
      if (!prev) return prev;
      setActiveImageIndex((curr) => (curr === prev.images.length - 1 ? 0 : curr + 1));
      return prev;
    });
  }, []);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedRoom((prev) => {
      if (!prev) return prev;
      setActiveImageIndex((curr) => (curr === 0 ? prev.images.length - 1 : curr - 1));
      return prev;
    });
  }, []);

  const handleThumbnailClick = useCallback((index: number) => setActiveImageIndex(index), []);

  return (
    <>
      <div className="rooms-page">
        <div className="bg-mesh" aria-hidden="true">
          <div className="mesh-layer-1" />
          <div className="mesh-layer-2" />
          <div className="grid-overlay" />
        </div>

        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">✦ Accommodations ✦</div>
            <h1 className="hero-title">Our Rooms</h1>
            <p className="hero-subtitle">Choose your perfect coastal retreat</p>
          </div>
        </section>

        <div className="container">
          {rooms.length === 0 && (
            <div className="no-results">
              <h3>No rooms available</h3>
              <p>Check back soon for availability.</p>
            </div>
          )}
          {rooms.length > 0 && (
            <div className="rooms-grid">
              {rooms.map((room, idx) => (
                <RoomCard key={room.id} room={room} index={idx} onOpenDetails={openRoomDetails} />
              ))}
            </div>
          )}
        </div>

        {selectedRoom && (
          <div className="modal-overlay" onClick={closeRoomDetails}>
            <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>

              <div className="sheet-handle" aria-hidden="true" />

              <button className="close-btn" onClick={closeRoomDetails} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="sheet-gallery">
                <div className="gallery-main">
                  <div
                    className="gallery-img-bg"
                    style={{ backgroundImage: `url(${selectedRoom.images[activeImageIndex]})` }}
                    aria-hidden="true"
                  />
                  <Image
                    src={selectedRoom.images[activeImageIndex]}
                    alt={selectedRoom.name}
                    fill sizes="(max-width: 640px) 100vw, 680px"
                    style={{ objectFit: "contain", zIndex: 1 }} priority
                  />
                  <div className="gallery-scrim" />

                  {selectedRoom.images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="gallery-arrow prev" aria-label="Previous photo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button onClick={nextImage} className="gallery-arrow next" aria-label="Next photo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                      <div className="gallery-counter">
                        {activeImageIndex + 1} / {selectedRoom.images.length}
                      </div>
                    </>
                  )}
                </div>

                {selectedRoom.images.length > 1 && (
                  <div className="thumbs-strip">
                    {selectedRoom.images.map((img, i) => (
                      <GalleryThumbnail
                        key={i} image={img} index={i}
                        isActive={i === activeImageIndex}
                        onClick={handleThumbnailClick}
                        roomName={selectedRoom.name}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="sheet-body">
                <div className="detail-header">
                  <div className="detail-title-col">
                    <h2 className="detail-name">{selectedRoom.name}</h2>
                    {selectedRoom.highlights.length > 0 && (
                      <div className="detail-pills">
                        {selectedRoom.highlights.map((h, i) => (
                          <span key={i} className="detail-pill">{h}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="detail-price-col">
                    <span className="price-was">₹{selectedRoom.originalPrice}</span>
                    <span className="price-now">₹{selectedRoom.price}</span>
                    <span className="price-per">per night</span>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {selectedRoom.maxGuests} guests
                  </div>
                  <div className="stat-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                    </svg>
                    {selectedRoom.size}
                  </div>
                  <div className="stat-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                    </svg>
                    {selectedRoom.view}
                  </div>
                </div>

                <div className="detail-divider" />

                <div className="detail-block">
                  <p className="block-label">About this room</p>
                  <p className="block-text">{selectedRoom.description}</p>
                </div>

                {selectedRoom.amenities.length > 0 && (
                  <div className="detail-block">
                    <p className="block-label">Amenities</p>
                    <div className="hc-amenities-grid">
                      {selectedRoom.amenities.map((amenity, i) => (
                        <AmenityItem key={i} amenity={amenity} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="sheet-cta">
                  <a href="/book" className="cta-book">
                    Book Now — ₹{selectedRoom.price} / night
                  </a>
                  <button onClick={closeRoomDetails} className="cta-dismiss">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .rooms-page {
          min-height: 100vh;
          color: #f8fafc;
          font-family: var(--font-outfit), system-ui, sans-serif;
          position: relative;
          background: #04070f;
          overflow-x: hidden;
        }

        /* ── BG MESH ── */
        .bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; contain: strict; }
        .mesh-layer-1 {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 100% 0%, rgba(249,115,22,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 0% 100%, rgba(14,165,233,0.15) 0%, transparent 60%),
            linear-gradient(160deg, #04070f 0%, #0b1220 50%, #04070f 100%);
        }
        .mesh-layer-2 {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 40% 40% at 50% 50%, rgba(249,115,22,0.05) 0%, transparent 70%);
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

        /* ── REVEAL ── */
        .reveal {
          opacity: 0; transform: translateY(32px);
          transition:
            opacity 0.65s cubic-bezier(0.22,1,0.36,1) var(--delay,0ms),
            transform 0.65s cubic-bezier(0.22,1,0.36,1) var(--delay,0ms);
          will-change: opacity, transform;
          contain: layout style;
        }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; contain: none; }
          .mesh-layer-2 { animation: none; }
        }

        /* ── HERO ── */
        .hero { position: relative; z-index: 1; padding: 9rem 1.5rem 3.5rem; text-align: center; }
        .hero-badge {
          display: inline-block; font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.25em; text-transform: uppercase; color: #f97316;
          padding: 0.45rem 1.2rem; border: 1px solid rgba(249,115,22,0.4);
          border-radius: 100px; margin-bottom: 1.5rem; background: rgba(249,115,22,0.07);
          animation: fadeInDown 0.7s ease-out both;
        }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
        .hero-title {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(3rem, 8vw, 5.5rem); font-weight: 700;
          line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 1rem;
          background: linear-gradient(140deg, #fff 0%, #f4d5b8 50%, #f97316 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: fadeInUp 0.8s ease-out 0.15s both;
        }
        .hero-subtitle {
          font-size: clamp(0.95rem, 2.5vw, 1.3rem); color: rgba(240,244,248,0.7);
          margin: 0; font-weight: 300; animation: fadeInUp 0.8s ease-out 0.3s both;
        }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

        /* ── LAYOUT ── */
        .container { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem 6rem; position: relative; z-index: 1; }
        .no-results { text-align: center; padding: 4rem 2rem; }
        .no-results h3 { font-size: 2rem; color: #f97316; margin-bottom: 0.5rem; }
        .no-results p { color: #64748b; }

        /* ── ROOMS GRID ── */
        .rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.75rem; }

        /* ── ROOM CARD ── */
        .room-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 18px; overflow: hidden; cursor: pointer;
          transition:
            transform 0.4s cubic-bezier(0.22,1,0.36,1),
            border-color 0.25s ease,
            box-shadow 0.4s cubic-bezier(0.22,1,0.36,1);
          will-change: transform;
        }
        .room-card:hover { transform: translateY(-7px); border-color: rgba(249,115,22,0.45); box-shadow: 0 20px 50px rgba(249,115,22,0.18); }
        .room-card:active { transform: translateY(-3px); }

        .card-image-wrap { position: relative; height: 210px; overflow: hidden; background: #04070f; }
        .card-img-bg {
          position: absolute; inset: 0; z-index: 0;
          background-size: cover; background-position: center;
          filter: blur(16px) brightness(0.4) saturate(0.7);
          transform: scale(1.1);
        }
        .card-image-overlay {
          position: absolute; inset: 0; z-index: 2;
          background: linear-gradient(to top, rgba(4,7,15,0.75) 0%, rgba(4,7,15,0.1) 55%, transparent 100%);
        }
        .photo-pill {
          position: absolute; top: 10px; right: 10px; z-index: 3;
          display: flex; align-items: center; gap: 4px;
          padding: 4px 9px; background: rgba(4,7,15,0.75); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
          color: rgba(255,255,255,0.8); font-size: 0.75rem; font-weight: 600;
        }
        .price-badge {
          position: absolute; bottom: 12px; left: 14px; z-index: 3;
          display: flex; align-items: baseline; gap: 5px;
        }
        .price-orig { font-size: 0.8rem; color: rgba(255,255,255,0.38); text-decoration: line-through; }
        .price-curr { font-size: 1.55rem; font-weight: 700; color: #fff; line-height: 1; }
        .price-unit { font-size: 0.75rem; color: rgba(255,255,255,0.5); }

        .card-body { padding: 1.1rem 1.1rem 0.9rem; }
        .card-name {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin: 0 0 0.45rem; line-height: 1.2;
        }
        .card-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
        .tag {
          font-size: 0.72rem; color: #64748b;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 5px; padding: 3px 8px;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .tag svg { color: #f97316; flex-shrink: 0; }
        .card-desc {
          font-size: 0.875rem; color: #64748b; line-height: 1.5; margin: 0 0 0.7rem;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .card-highlights { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.875rem; }
        .highlight-chip {
          font-size: 0.7rem; color: #f97316;
          background: rgba(249,115,22,0.07); border: 1px solid rgba(249,115,22,0.18);
          border-radius: 5px; padding: 2px 7px;
        }
        .card-footer { padding-top: 0.7rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; }
        .view-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.6rem 1.1rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none; border-radius: 9px; color: #fff;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease;
          font-family: inherit;
        }
        .view-btn:hover { transform: translateX(4px); box-shadow: 0 6px 20px rgba(249,115,22,0.4); }

        /* ── MODAL ── */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(4,7,15,0.88);
          backdrop-filter: blur(20px);
          display: flex; align-items: flex-end; justify-content: center;
          animation: overlayIn 0.22s ease-out;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-sheet {
          position: relative; width: 100%; max-width: 660px; max-height: 96dvh;
          overflow-y: auto; background: #080f1c;
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 24px 24px 0 0;
          animation: sheetUp 0.38s cubic-bezier(0.22,1,0.36,1);
          scrollbar-width: thin; scrollbar-color: rgba(249,115,22,0.2) transparent;
        }
        .modal-sheet::-webkit-scrollbar { width: 3px; }
        .modal-sheet::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.2); border-radius: 2px; }
        @keyframes sheetUp { from { opacity: 0; transform: translateY(56px); } to { opacity: 1; transform: translateY(0); } }
        .sheet-handle { width: 36px; height: 3px; background: rgba(255,255,255,0.12); border-radius: 2px; margin: 10px auto 0; }
        .close-btn {
          position: absolute; top: 12px; right: 12px; z-index: 20;
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: #94a3b8; cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, transform 0.25s ease;
        }
        .close-btn:hover { background: rgba(249,115,22,0.25); color: #fff; transform: rotate(90deg); }

        .sheet-gallery { width: 100%; }
        .gallery-main { position: relative; height: 260px; overflow: hidden; background: #04070f; }
        .gallery-img-bg {
          position: absolute; inset: 0; z-index: 0;
          background-size: cover; background-position: center;
          filter: blur(20px) brightness(0.35) saturate(0.7);
          transform: scale(1.1);
        }
        .gallery-scrim {
          position: absolute; inset: 0; z-index: 2; pointer-events: none;
          background: linear-gradient(to top, rgba(8,15,28,0.5) 0%, transparent 45%);
        }
        .gallery-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 3;
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 54px;
          background: rgba(4,7,15,0.65); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
          color: #f8fafc; cursor: pointer;
          transition: background 0.2s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .gallery-arrow.prev { left: 10px; }
        .gallery-arrow.next { right: 10px; }
        .gallery-arrow:hover { background: rgba(249,115,22,0.55); transform: translateY(-50%) scale(1.05); }
        .gallery-counter {
          position: absolute; bottom: 10px; right: 10px; z-index: 3;
          font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.75);
          background: rgba(4,7,15,0.7); backdrop-filter: blur(6px);
          padding: 3px 9px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.08);
        }

        .thumbs-strip {
          display: flex; gap: 5px; padding: 8px 10px;
          overflow-x: auto; scrollbar-width: none;
          background: rgba(4,7,15,0.5); border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .thumbs-strip::-webkit-scrollbar { display: none; }
        .gallery-thumb {
          position: relative; flex-shrink: 0; width: 60px; height: 46px;
          border-radius: 6px; overflow: hidden; border: 2px solid transparent;
          cursor: pointer; transition: border-color 0.18s ease, transform 0.2s ease;
          background: #04070f;
        }
        .gallery-thumb:hover { transform: scale(1.06); }
        .gallery-thumb.active { border-color: #f97316; }
        .thumb-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          filter: blur(6px) brightness(0.5);
          transform: scale(1.1); z-index: 0;
        }

        .sheet-body { padding: 1.1rem 1.1rem 1.75rem; }
        .detail-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.875rem; }
        .detail-title-col { flex: 1; min-width: 0; }
        .detail-name {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700;
          line-height: 1.1; margin: 0 0 0.4rem;
          background: linear-gradient(135deg, #fff 30%, #f97316 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .detail-pills { display: flex; gap: 0.35rem; flex-wrap: wrap; }
        .detail-pill {
          font-size: 0.68rem; font-weight: 600; color: #f97316;
          background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2);
          border-radius: 5px; padding: 2px 7px;
        }
        .detail-price-col { text-align: right; flex-shrink: 0; }
        .price-was { display: block; font-size: 0.8rem; color: #334155; text-decoration: line-through; }
        .price-now { display: block; font-size: 1.65rem; font-weight: 700; color: #f97316; line-height: 1; }
        .price-per { display: block; font-size: 0.7rem; color: #475569; }

        .stats-row { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.875rem; }
        .stat-chip {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.8rem; color: #94a3b8;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 7px; padding: 5px 9px;
        }
        .stat-chip svg { color: #f97316; flex-shrink: 0; }
        .detail-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 0.75rem 0; }
        .detail-block { margin-bottom: 1rem; }
        .block-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #f97316; margin: 0 0 0.45rem; }
        .block-text { font-size: 0.875rem; color: #64748b; line-height: 1.65; margin: 0; }
        .hc-amenities-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; }
        .hc-amenity-item {
          display: flex; align-items: center; gap: 7px; padding: 7px 9px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 7px; color: #94a3b8; font-size: 0.82rem;
          transition: background 0.18s ease, border-color 0.18s ease;
        }
        .hc-amenity-item:hover { background: rgba(249,115,22,0.07); border-color: rgba(249,115,22,0.18); }
        .hc-check-icon { width: 13px; height: 13px; color: #22c55e; flex-shrink: 0; }
        .sheet-cta {
          display: flex; flex-direction: column; gap: 0.5rem;
          padding-top: 1rem; margin-top: 0.5rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .cta-book {
          display: block; width: 100%; padding: 0.95rem 1rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none; border-radius: 11px; color: #fff;
          font-size: 0.95rem; font-weight: 700; text-align: center; text-decoration: none;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease;
          box-shadow: 0 6px 22px rgba(249,115,22,0.38); font-family: inherit;
        }
        .cta-book:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(249,115,22,0.5); }
        .cta-dismiss {
          display: block; width: 100%; padding: 0.75rem;
          background: transparent; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px; color: #475569; font-size: 0.875rem; cursor: pointer;
          transition: color 0.18s ease, border-color 0.18s ease; font-family: inherit;
        }
        .cta-dismiss:hover { color: #94a3b8; border-color: rgba(255,255,255,0.14); }

        @media (min-width: 600px) {
          .modal-overlay { align-items: center; padding: 1.5rem; }
          .modal-sheet { border-radius: 20px; max-height: 90vh; }
          .sheet-handle { display: none; }
          .gallery-main { height: 310px; }
          .sheet-cta { flex-direction: row; }
          .cta-book { flex: 1; }
          .cta-dismiss { width: auto; padding: 0.95rem 1.4rem; }
          .hc-amenities-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 768px) {
          .gallery-main { height: 340px; }
          .sheet-body { padding: 1.4rem 1.6rem 1.75rem; }
          .hc-amenities-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .rooms-grid { grid-template-columns: 1fr; gap: 1rem; }
          .hero { padding: 5.5rem 1rem 2rem; }
          .container { padding: 0 0.875rem 3.5rem; }
        }
      `}</style>
    </>
  );
}
