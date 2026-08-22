"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef, memo } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────── TYPES ─────────────────────────── */
export type Room = {
  id: string;
  name: string;
  max_guests: number;
  base_price: number;
  description?: string;
  images?: string[];
  amenities?: string[];
  size?: string;
  view?: string;
};

export type ContentSection = {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  image_url?: string;
  images?: string[]; // NEW — hero slideshow images
  features?: Array<{ icon: string; title: string; description: string }>;
  stats?: Array<{ label: string; value: string }>;
  values_list?: Array<{ title: string; description: string; icon: string }>;
};

/* ─────────────────────────── FEATURE SVG ICONS ─────────────────────────── */
const FeatureIcons: Record<string, React.ReactNode> = {
  beach: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="feature-svg">
      <circle cx="32" cy="13" r="5.5" stroke="#f97316" strokeWidth="2.2" fill="rgba(249,115,22,0.15)"/>
      <line x1="32" y1="4"  x2="32" y2="6.5" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="32" y1="19.5" x2="32" y2="22" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="41" y1="13" x2="43.5" y2="13" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="20.5" y1="13" x2="23" y2="13" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="38.5" y1="6.5"  x2="40.3" y2="4.7"  stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="23.7" y1="21.3" x2="25.5" y2="19.5" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="38.5" y1="19.5" x2="40.3" y2="21.3" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="23.7" y1="4.7"  x2="25.5" y2="6.5"  stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="28" x2="22" y2="44" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M6 28 Q16 14 26 28" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" fill="rgba(249,115,22,0.15)"/>
      <path d="M4 38 Q8.5 34 13 38 Q17.5 42 22 38 Q26.5 34 31 38 Q35.5 42 40 38 Q44.5 34 46 36" stroke="#f97316" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8"/>
      <path d="M4 43 Q8.5 39 13 43 Q17.5 47 22 43 Q26.5 39 31 43 Q35.5 47 40 43" stroke="#f97316" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
    </svg>
  ),
  dining: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="feature-svg">
      <line x1="10" y1="8" x2="10" y2="18" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="8" x2="14" y2="18" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="8" x2="12" y2="18" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 18 Q12 22 12 26 L12 40" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <path d="M38 8 C38 8 36 14 36 20 L36 40" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <path d="M38 8 L36 20" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="28" r="12" stroke="#f97316" strokeWidth="2" fill="rgba(249,115,22,0.08)"/>
      <circle cx="24" cy="28" r="8" stroke="#f97316" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  ),
  mountain: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="feature-svg">
      <path d="M18 38 L32 14 L46 38 Z" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" fill="rgba(249,115,22,0.08)" opacity="0.6"/>
      <path d="M2 38 L18 10 L34 38 Z" stroke="#f97316" strokeWidth="2.2" strokeLinejoin="round" fill="rgba(249,115,22,0.15)"/>
      <path d="M14 18 L18 10 L22 18 Q18 15 14 18 Z" fill="rgba(249,115,22,0.4)" stroke="#f97316" strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="2" y1="38" x2="46" y2="38" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  activities: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="feature-svg">
      <path d="M8 40 Q18 20 40 8" stroke="#f97316" strokeWidth="3" strokeLinecap="round"/>
      <path d="M8 40 Q18 20 40 8" stroke="rgba(249,115,22,0.2)" strokeWidth="8" strokeLinecap="round"/>
      <path d="M4 34 Q10 28 16 34 Q22 40 28 34 Q34 28 40 34" stroke="#f97316" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="38" cy="10" r="4" stroke="#f97316" strokeWidth="1.8" fill="rgba(249,115,22,0.2)"/>
    </svg>
  ),
};

function FeatureIcon({ icon }: { icon: string }) {
  if (FeatureIcons[icon]) return <div className="feature-icon-wrap">{FeatureIcons[icon]}</div>;
  return <div className="feature-icon">{icon}</div>;
}

/* ─────────────────────────── DEFAULTS ─────────────────────────── */
const DEFAULT_HERO: Partial<ContentSection> = {
  title: "Sukhakarta Holiday Home",
  subtitle: "Discover luxury coastal living in the heart of Alibag",
  button_text: "Book Your Stay",
  button_link: "/book",
};

const DEFAULT_FEATURES: ContentSection["features"] = [
  { icon: "beach",      title: "Beach Access",   description: "9 Minutes from pristine beaches" },
  { icon: "dining",     title: "Fine Dining",     description: "Authentic coastal cuisine" },
  { icon: "mountain",   title: "Mountain View",   description: "Relax in luxury" },
  { icon: "activities", title: "Activities",      description: "Water sports & adventures" },
];

const DEFAULT_CTA: Partial<ContentSection> = {
  title: "Ready for Your Dream Vacation?",
  description: "Book now and experience the best of coastal living",
  button_text: "Reserve Your Stay",
  button_link: "/book",
};

/* ─────────────────────────── IMAGE OPTIMIZATION ─────────────────────────── */
function getOptimizedImageUrl(url: string, width: number, quality: number = 75): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes("supabase")) {
      // Convert object URL to render URL for transformations
      // From: /storage/v1/object/public/bucket/path
      // To:   /storage/v1/render/image/public/bucket/path
      const renderUrl = url.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/"
      );
      const ru = new URL(renderUrl);
      ru.searchParams.set("width", width.toString());
      ru.searchParams.set("quality", quality.toString());
      ru.searchParams.set("resize", "cover");
      return ru.toString();
    }
    return url;
  } catch { return url; }
}

function getResponsiveSrcSet(url: string): string {
  if (!url) return "";
  return [
    `${getOptimizedImageUrl(url, 400, 70)} 400w`,
    `${getOptimizedImageUrl(url, 800, 65)} 800w`,
    `${getOptimizedImageUrl(url, 1200, 60)} 1200w`,
    `${getOptimizedImageUrl(url, 1920, 55)} 1920w`,
  ].join(", ");
}

// Tiny, heavily-compressed version used ONLY for blurred backdrop layers.
// These are rendered with a 16-20px CSS blur, so a 32px-wide source is
// visually identical to using the full-res original but a fraction of the KBs.
function getBlurUrl(url: string): string {
  return getOptimizedImageUrl(url, 32, 20);
}

/* ─────────────────────────── PROPS ─────────────────────────── */
interface HomeClientProps {
  rooms: Room[];
  initialContent?: ContentSection[];
}

function getSection(content: ContentSection[], section: string) {
  return content.find((c) => c.section === section);
}

/* ─────────────────────────── MAPPED ROOM TYPE ─────────────────────────── */
type MappedRoom = {
  id: string; name: string; price: number; originalPrice: number;
  maxGuests: number; size: string; view: string;
  images: string[]; amenities: string[]; description: string; highlights: string[];
};

function mapRoom(room: Room): MappedRoom {
  return {
    id: room.id, name: room.name,
    price: room.base_price,
    originalPrice: Math.round(room.base_price * 1.25),
    maxGuests: room.max_guests,
    size: room.size || "Not specified",
    view: room.view || "Standard View",
    images: room.images && room.images.length > 0 ? room.images : ["/placeholder-room.jpg"],
    amenities: room.amenities || [],
    description: room.description || "Beautiful room with modern amenities",
    highlights: room.amenities?.slice(0, 3) || [],
  };
}

/* ─────────────────────────── GALLERY THUMBNAIL ─────────────────────────── */
const GalleryThumbnail = memo(({
  image, index, isActive, onClick, roomName,
}: {
  image: string; index: number; isActive: boolean; onClick: (i: number) => void; roomName: string;
}) => {
  const handleClick = useCallback(() => onClick(index), [index, onClick]);
  return (
    <div className={`gallery-thumb ${isActive ? "active" : ""}`} onClick={handleClick}>
      <div className="thumb-bg" style={{ backgroundImage: `url(${getBlurUrl(image)})` }} aria-hidden="true" />
      <Image src={image} alt={`${roomName} ${index + 1}`} fill sizes="72px"
        style={{ objectFit: "contain", zIndex: 1 }} loading="lazy" />
    </div>
  );
});
GalleryThumbnail.displayName = "GalleryThumbnail";

/* ─────────────────────────── AMENITY ITEM ─────────────────────────── */
const AmenityItem = memo(({ amenity }: { amenity: string }) => (
  <div className="hc-amenity-item">
    <svg className="hc-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <span>{amenity}</span>
  </div>
));
AmenityItem.displayName = "AmenityItem";

/* ─────────────────────────── ROOM CARD ─────────────────────────── */
const RoomCard = memo(({
  room, index, onOpenDetails,
}: {
  room: MappedRoom; index: number; onOpenDetails: (room: MappedRoom) => void;
}) => {
  const handleClick = useCallback(() => onOpenDetails(room), [room, onOpenDetails]);
  return (
    <div
      className="room-card reveal"
      onClick={handleClick}
      style={{ "--delay": `${index * 80}ms` } as React.CSSProperties}
    >
      <div className="card-image-wrap">
        {/* Blurred background — fills dead space for portrait images. Uses a tiny
            32px source since it's blurred anyway; saves large amounts of KB vs. the
            original full-resolution photo. */}
        <div
          className="card-img-bg"
          style={{ backgroundImage: `url(${getBlurUrl(room.images[0])})` }}
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
            {room.highlights.map((h, i) => <span key={i} className="highlight-chip">✓ {h}</span>)}
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

/* ─────────────────────────── HERO SLIDESHOW ─────────────────────────── */
const HERO_SLIDE_MS = 6000;

function useHeroSlideshow(images: string[]) {
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!reducedMotion.current && images.length > 1);
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((idx: number) => {
    setActiveIndex(((idx % images.length) + images.length) % images.length);
    setProgress(0);
  }, [images.length]);

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (images.length <= 1 || !isPlaying || isHovering) return;
    const stepMs = 40;
    const id = setInterval(() => {
      setProgress((p) => {
        const advanced = p + stepMs / HERO_SLIDE_MS;
        if (advanced >= 1) {
          setActiveIndex((i) => (i + 1) % images.length);
          return 0;
        }
        return advanced;
      });
    }, stepMs);
    return () => clearInterval(id);
  }, [images.length, isPlaying, isHovering, activeIndex]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 48) { delta > 0 ? prev() : next(); }
    touchStartX.current = null;
  }, [next, prev]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }, [next, prev]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  return {
    activeIndex, isPlaying, progress,
    goTo, next, prev, togglePlay,
    handleTouchStart, handleTouchEnd, handleKeyDown,
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false),
  };
}

// Only the first hero slide is mounted (and downloaded) immediately.
// The remaining slides mount during idle time (or after a short fallback
// delay), well before autoplay would ever need them. This stops every
// hero photo from fighting the LCP image for bandwidth on first load.
function useDeferredSlideMount(count: number) {
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]));

  useEffect(() => {
    if (count <= 1) return;

    const mountRest = () => {
      setMounted(new Set(Array.from({ length: count }, (_, i) => i)));
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(mountRest, { timeout: 3000 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const id = setTimeout(mountRest, 1200);
    return () => clearTimeout(id);
  }, [count]);

  return mounted;
}

function HeroSlideBackground({
  images, activeIndex, mountedIndices, onMouseEnter, onMouseLeave, onTouchStart, onTouchEnd,
}: {
  images: string[]; activeIndex: number; mountedIndices: Set<number>;
  onMouseEnter: () => void; onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void; onTouchEnd: (e: React.TouchEvent) => void;
}) {
  return (
    <div
      className="hero-img-wrap"
      aria-hidden="true"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {images.map((img, i) => (
        <div key={img + i} className={`hero-slide ${i === activeIndex ? "active" : ""}`}>
          {mountedIndices.has(i) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getOptimizedImageUrl(img, 1920, i === 0 ? 65 : 55)}
              srcSet={getResponsiveSrcSet(img)}
              sizes="100vw"
              alt={`Sukhakarta Holiday Home Alibag — beachfront view ${i + 1}`}
              className="hero-slide-img"
              fetchPriority={i === 0 ? "high" : "low"}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async" width={1920} height={1080}
            />
          )}
        </div>
      ))}
      <div className="hero-img-overlay" />
    </div>
  );
}

function HeroControls({
  count, activeIndex, progress, isPlaying, onGoTo, onPrev, onNext, onTogglePlay, onKeyDown,
}: {
  count: number; activeIndex: number; progress: number; isPlaying: boolean;
  onGoTo: (i: number) => void; onPrev: () => void; onNext: () => void;
  onTogglePlay: () => void; onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div className="hero-controls" role="group" aria-label="Hero slideshow controls" onKeyDown={onKeyDown}>
      <button type="button" className="hero-nav prev" onClick={onPrev} aria-label="Previous photo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="hero-progress-track">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i} type="button"
            className={`hero-progress-seg ${i === activeIndex ? "active" : ""} ${i < activeIndex ? "done" : ""}`}
            onClick={() => onGoTo(i)}
            aria-label={`Go to slide ${i + 1} of ${count}`}
            aria-current={i === activeIndex}
          >
            <span
              className="hero-progress-fill"
              style={i === activeIndex ? { transform: `scaleX(${progress})` } : undefined}
            />
          </button>
        ))}
      </div>

      <button type="button" className="hero-nav next" onClick={onNext} aria-label="Next photo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <button
        type="button" className="hero-playpause"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
            <rect x="5" y="4" width="4" height="16" rx="1" />
            <rect x="15" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
            <path d="M6 4l14 8-14 8V4z" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function HomeClient({ rooms: initialRooms, initialContent = [] }: HomeClientProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [content, setContent] = useState<ContentSection[]>(initialContent);
  const [selectedRoom, setSelectedRoom] = useState<MappedRoom | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const contentChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
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

  const fetchRooms = useCallback(async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("id, name, base_price, max_guests, description, images, amenities, size, view")
      .order("created_at", { ascending: true });
    if (!error && data) setRooms(data);
  }, []);

  const fetchContent = useCallback(async () => {
    const { data, error } = await supabase.from("homepage_content").select("*").order("section");
    if (!error && data) setContent(data);
  }, []);

  // The rooms/content we render on first paint already came from the server
  // (initialRooms / initialContent), so re-fetching them immediately on mount
  // plus opening two realtime websocket channels is pure extra main-thread
  // work competing with the critical rendering path. Defer it to idle time
  // (or a short fallback delay) instead — content still stays live, it just
  // doesn't compete with LCP/TBT during the initial load.
  useEffect(() => {
    let idleId: number | ReturnType<typeof setTimeout>;

    const setup = () => {
      fetchRooms();
      fetchContent();
      channelRef.current = supabase
        .channel("home-rooms-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, fetchRooms)
        .subscribe();
      contentChannelRef.current = supabase
        .channel("home-content-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "homepage_content" }, fetchContent)
        .subscribe();
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = (window as any).requestIdleCallback(setup, { timeout: 2000 });
    } else {
      idleId = setTimeout(setup, 800);
    }

    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback?.(idleId);
      } else {
        clearTimeout(idleId as ReturnType<typeof setTimeout>);
      }
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (contentChannelRef.current) supabase.removeChannel(contentChannelRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [fetchRooms, fetchContent]);

  useEffect(() => {
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;
    raf = requestAnimationFrame(() => { timeout = setTimeout(setupObserver, 50); });
    return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
  }, [rooms, content, setupObserver]);

  const hero = getSection(content, "hero") ?? (DEFAULT_HERO as ContentSection);
  const heroImages = hero.images && hero.images.length > 0
    ? hero.images
    : hero.image_url ? [hero.image_url] : [];
  const heroSlide = useHeroSlideshow(heroImages);
  const mountedSlides = useDeferredSlideMount(heroImages.length);
  const featuresSection = getSection(content, "features");
  const features = featuresSection?.features?.length ? featuresSection.features : DEFAULT_FEATURES!;
  const ctaSection = getSection(content, "cta") ?? (DEFAULT_CTA as ContentSection);
  const roomsSection = getSection(content, "rooms");

  const openRoomDetails = useCallback((room: MappedRoom) => {
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
    <main className="home-page">
      <div className="bg-mesh" aria-hidden="true">
        <div className="mesh-layer-1" />
        <div className="mesh-layer-2" />
        <div className="grid-overlay" />
      </div>

      {/* Real preload hint for the LCP hero image. React/Next will hoist this
          into <head> on modern versions; even rendered in-body it's still
          picked up by the browser's preload scanner while parsing the
          server-rendered HTML. */}
      {heroImages.length > 0 && (
        <link
          rel="preload"
          as="image"
          href={getOptimizedImageUrl(heroImages[0], 1920, 65)}
          imageSrcSet={getResponsiveSrcSet(heroImages[0])}
          imageSizes="100vw"
          fetchPriority="high"
        />
      )}

      {/* ══════════ HERO ══════════ */}
      <section className="hero">
  {heroImages.length > 0 ? (
    <HeroSlideBackground
      images={heroImages}
      activeIndex={heroSlide.activeIndex}
      mountedIndices={mountedSlides}
      onMouseEnter={heroSlide.onMouseEnter}
      onMouseLeave={heroSlide.onMouseLeave}
      onTouchStart={heroSlide.handleTouchStart}
      onTouchEnd={heroSlide.handleTouchEnd}
    />
  ) : (
    <div className="hero-img-wrap hero-img-placeholder" aria-hidden="true">
      <div className="hero-img-overlay" />
    </div>
  )}
  <div className="hero-scanlines" aria-hidden="true" />
  <div className="hero-corner tl" aria-hidden="true" />
  <div className="hero-corner tr" aria-hidden="true" />
  <div className="hero-corner bl" aria-hidden="true" />
  <div className="hero-corner br" aria-hidden="true" />
  <div className="hero-content">
    <div className="hero-badge">✦ Luxury Coastal Retreat ✦</div>
    <h1 className="hero-title">{hero.title || DEFAULT_HERO.title}</h1>
    <p className="hero-subtitle">{hero.subtitle || DEFAULT_HERO.subtitle}</p>
    <div className="hero-buttons">
      <Link href={hero.button_link || "/book"} className="btn btn-primary">
        {hero.button_text || "Book Your Stay"}
      </Link>
      <Link href="/rooms" className="btn btn-ghost">Explore Rooms</Link>
    </div>
    {heroImages.length > 1 && (
      <HeroControls
        count={heroImages.length}
        activeIndex={heroSlide.activeIndex}
        progress={heroSlide.progress}
        isPlaying={heroSlide.isPlaying}
        onGoTo={heroSlide.goTo}
        onPrev={heroSlide.prev}
        onNext={heroSlide.next}
        onTogglePlay={heroSlide.togglePlay}
        onKeyDown={heroSlide.handleKeyDown}
      />
    )}
  </div>
  <div className="scroll-indicator" aria-hidden="true"><div className="scroll-dot" /></div>
</section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="section features-section">
        <div className="container">
          <div className="section-head reveal">
            <span className="section-tag">Our Promise</span>
            <h2 className="section-title">{featuresSection?.title || "Why Choose Sukhakarta"}</h2>
            <p className="section-subtitle">{featuresSection?.subtitle || "Discover what makes us special"}</p>
          </div>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card reveal" style={{ "--delay": `${idx * 80}ms` } as React.CSSProperties}>
                <div className="feature-card-glow" aria-hidden="true" />
                <FeatureIcon icon={feature.icon} />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="card-line" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ROOMS ══════════ */}
      <section className="section rooms-section">
        <div className="container">
          <div className="section-head reveal">
            <span className="section-tag">Accommodations</span>
            <h2 className="section-title">{roomsSection?.title || "Our Premium Rooms"}</h2>
            <p className="section-subtitle">{roomsSection?.subtitle || "Choose your perfect coastal retreat"}</p>
          </div>
          <div className="rooms-grid">
            {rooms.map((room, idx) => (
              <RoomCard key={room.id} room={mapRoom(room)} index={idx} onOpenDetails={openRoomDetails} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="section cta-section">
        <div className="cta-inner reveal">
          <div className="cta-glow" aria-hidden="true" />
          <span className="section-tag">Limited Availability</span>
          <h2 className="cta-title">{ctaSection.title || DEFAULT_CTA.title}</h2>
          <p className="cta-desc">{ctaSection.description || DEFAULT_CTA.description}</p>
          <Link href={ctaSection.button_link || "/book"} className="btn btn-primary btn-lg">
            {ctaSection.button_text || DEFAULT_CTA.button_text}
          </Link>
        </div>
      </section>

      {/* ══════════ ROOM MODAL ══════════ */}
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
                {/* Blurred background for portrait images in modal — tiny source, same as room cards */}
                <div
                  className="gallery-img-bg"
                  style={{ backgroundImage: `url(${getBlurUrl(selectedRoom.images[activeImageIndex])})` }}
                  aria-hidden="true"
                />
                <Image
                  src={selectedRoom.images[activeImageIndex]}
                  alt={selectedRoom.name} fill
                  sizes="(max-width: 640px) 100vw, 900px"
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
                    <GalleryThumbnail key={i} image={img} index={i}
                      isActive={i === activeImageIndex}
                      onClick={handleThumbnailClick} roomName={selectedRoom.name} />
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
                <button onClick={closeRoomDetails} className="cta-dismiss">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}

       <style jsx global>{`
        /* ── BUTTONS ── */
        .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.875rem 2rem; border-radius: 100px; font-size: 1rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; white-space: nowrap; will-change: transform; font-family: var(--font-outfit), system-ui, sans-serif; }
        .btn-primary { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff !important; box-shadow: 0 8px 24px rgba(249,115,22,0.35); }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(249,115,22,0.5); color: #fff !important; }
        .btn-primary:active { transform: translateY(-1px); }
        .btn-ghost { background: rgba(255,255,255,0.08); color: #f0f4f8 !important; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(8px); }
        .btn-ghost:hover { background: rgba(255,255,255,0.14); transform: translateY(-3px); color: #f0f4f8 !important; }
        .btn-lg { padding: 1.1rem 2.75rem; font-size: 1.1rem; }

        /* ── PAGE BASE ── */
        .home-page { min-height: 100vh; color: #f8fafc; font-family: var(--font-outfit), system-ui, sans-serif; position: relative; background: #04070f; overflow-x: hidden; }

        /* ── MESH BACKGROUND ── */
        .bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; contain: strict; }
        .mesh-layer-1 { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 100% 0%, rgba(249,115,22,0.18) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 0% 100%, rgba(14,165,233,0.15) 0%, transparent 60%), linear-gradient(160deg, #04070f 0%, #0b1220 50%, #04070f 100%); }
        .mesh-layer-2 { position: absolute; inset: 0; background: radial-gradient(ellipse 40% 40% at 50% 50%, rgba(249,115,22,0.05) 0%, transparent 70%); animation: mesh-pulse 8s ease-in-out infinite alternate; will-change: opacity; }
        @keyframes mesh-pulse { from { opacity: 0.4; } to { opacity: 1; } }
        .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px); background-size: 60px 60px; }

        /* ── SCROLL REVEAL ── */
        .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1) var(--delay,0ms), transform 0.65s cubic-bezier(0.22,1,0.36,1) var(--delay,0ms); will-change: opacity, transform; contain: layout style; }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; contain: none; } .mesh-layer-2 { animation: none; } .scroll-dot { animation: none; } }

        /* ── HERO ── */
      .hero { 
        position: relative; 
        width: 100vw; 
        min-height: 100svh; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        text-align: center; 
        z-index: 1; 
        overflow: hidden; 
        margin: 0; 
        padding: 0; 
      }
      
      .hero-img-wrap { 
        position: absolute; 
        inset: 0; 
        z-index: 0;
        overflow: hidden;
        background: #04070f; /* fills any gaps around the image */
      }
      
      .hero-img-placeholder { 
        background: linear-gradient(135deg, #0b1220, #1e293b); 
      }
      
      .hero-img { 
        width: 100%; 
        height: 100%; 
        object-fit: cover;
        object-position: center center;
        display: block;
      }
      
      .hero-img-overlay { 
        position: absolute; 
        inset: 0; 
        z-index: 2;
        background: linear-gradient(to bottom, rgba(4,7,15,0.35) 0%, rgba(4,7,15,0.5) 40%, rgba(4,7,15,0.75) 100%); 
      }

      /* ── HERO SLIDESHOW ── */
      .hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.3s cubic-bezier(0.45,0,0.2,1); overflow: hidden; z-index: 1; }
      .hero-slide.active { opacity: 1; z-index: 1; }
      .hero-slide-img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
      .hero-slide.active .hero-slide-img { animation: heroKenBurns 10s ease-in-out infinite alternate; }
      @keyframes heroKenBurns {
        0%   { transform: scale(1)    translate3d(0, 0, 0); }
        100% { transform: scale(1.12) translate3d(-1.5%, -1%, 0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .hero-slide { transition: none; }
        .hero-slide.active .hero-slide-img { animation: none; transform: none; }
      }

      /* ── HERO CONTROLS ── */
      .hero-controls { position: relative; margin-top: 2rem; z-index: 4; display: flex; align-items: center; gap: 0.85rem; padding: 0.55rem 0.75rem; background: rgba(4,7,15,0.45); border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; backdrop-filter: blur(14px) saturate(160%); box-shadow: 0 12px 36px rgba(0,0,0,0.35); animation: fadeInUp 0.8s ease-out 0.6s both; }
      .hero-nav { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #f8fafc; cursor: pointer; flex-shrink: 0; transition: background 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.25s ease; }
      .hero-nav:hover { background: rgba(249,115,22,0.5); border-color: rgba(249,115,22,0.7); transform: scale(1.08); }
      .hero-progress-track { display: flex; gap: 6px; align-items: center; }
      .hero-progress-seg { position: relative; width: 34px; height: 4px; border-radius: 3px; background: rgba(255,255,255,0.18); border: none; padding: 0; cursor: pointer; overflow: hidden; }
      .hero-progress-fill { position: absolute; inset: 0; transform-origin: left; transform: scaleX(0); background: linear-gradient(90deg, #f97316, #fbbf24); border-radius: 3px; }
      .hero-progress-seg.done .hero-progress-fill { transform: scaleX(1); }
      .hero-playpause { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #f8fafc; cursor: pointer; flex-shrink: 0; margin-left: 0.2rem; transition: background 0.2s ease, border-color 0.2s ease; }
      .hero-playpause:hover { background: rgba(249,115,22,0.35); border-color: rgba(249,115,22,0.6); }
      @media (max-width: 480px) {
        .hero-controls {gap: 0.6rem; padding: 0.45rem 0.6rem; }
        .hero-nav { width: 28px; height: 28px; }
        .hero-progress-seg { width: 22px; }
      }

        .hero-scanlines { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px); }
        .hero-corner { position: absolute; width: 40px; height: 40px; z-index: 2; pointer-events: none; }
        .hero-corner.tl { top: 24px; left: 24px; border-top: 2px solid rgba(249,115,22,0.6); border-left: 2px solid rgba(249,115,22,0.6); }
        .hero-corner.tr { top: 24px; right: 24px; border-top: 2px solid rgba(249,115,22,0.6); border-right: 2px solid rgba(249,115,22,0.6); }
        .hero-corner.bl { bottom: 24px; left: 24px; border-bottom: 2px solid rgba(249,115,22,0.6); border-left: 2px solid rgba(249,115,22,0.6); }
        .hero-corner.br { bottom: 24px; right: 24px; border-bottom: 2px solid rgba(249,115,22,0.6); border-right: 2px solid rgba(249,115,22,0.6); }
        .hero-content { position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; padding: 2rem 1.5rem 7rem; max-width: 900px; width: 100%; }
        .hero-badge { display: inline-block; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.25em; text-transform: uppercase; color: #f97316; padding: 0.5rem 1.25rem; border: 1px solid rgba(249,115,22,0.4); border-radius: 100px; margin-bottom: 2rem; background: rgba(249,115,22,0.08); animation: fadeInDown 0.7s ease-out both; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        .hero-title { font-family: var(--font-cormorant), Georgia, serif; font-size: clamp(2.8rem, 8vw, 6.5rem); font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 1.25rem; background: linear-gradient(140deg, #fff 0%, #f4d5b8 50%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: fadeInUp 0.8s ease-out 0.15s both; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        .hero-subtitle { font-size: clamp(1rem, 2.5vw, 1.5rem); color: rgba(240,244,248,0.8); margin: 0 0 2.5rem; font-weight: 300; max-width: 600px; animation: fadeInUp 0.8s ease-out 0.3s both; }
        .hero-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; animation: fadeInUp 0.8s ease-out 0.45s both; }
        .scroll-indicator { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 3; width: 26px; height: 42px; border: 2px solid rgba(249,115,22,0.5); border-radius: 13px; display: flex; align-items: flex-start; justify-content: center; padding-top: 6px; }
        .scroll-dot { width: 5px; height: 10px; background: #f97316; border-radius: 3px; animation: scroll-bounce 2s ease-in-out infinite; }
        @keyframes scroll-bounce { 0%, 100% { transform: translateY(0); opacity: 1; } 60% { transform: translateY(12px); opacity: 0.3; } }

        /* ── SECTIONS ── */
        .section { position: relative; z-index: 1; padding: 6rem 1.5rem; }
        .container { max-width: 1400px; margin: 0 auto; }
        .section-head { text-align: center; margin-bottom: 4rem; }
        .section-tag { display: inline-block; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: #f97316; margin-bottom: 1rem; }
        .section-title { font-family: var(--font-cormorant), Georgia, serif; font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 700; margin: 0 0 1rem; background: linear-gradient(135deg, #fff, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .section-subtitle { color: #94a3b8; font-size: 1.1rem; font-weight: 300; margin: 0; max-width: 540px; margin-inline: auto; }

        /* ── FEATURES ── */
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
        .feature-card { position: relative; text-align: center; padding: 2.5rem 2rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.15); border-radius: 20px; overflow: hidden; contain: layout paint style; transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; will-change: transform; cursor: default; }
        .feature-card:hover { transform: translateY(-8px); border-color: rgba(249,115,22,0.5); box-shadow: 0 20px 50px rgba(249,115,22,0.2); }
        .feature-card-glow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 65%); opacity: 0; transition: opacity 0.3s ease; pointer-events: none; }
        .feature-card:hover .feature-card-glow { opacity: 1; }
        .feature-icon-wrap { width: 72px; height: 72px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2); border-radius: 20px; transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease; }
        .feature-card:hover .feature-icon-wrap { background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.5); transform: scale(1.08) rotate(2deg); }
        .feature-svg { width: 40px; height: 40px; }
        .feature-icon { font-size: 3rem; margin-bottom: 1.25rem; display: block; }
        .feature-card h3 { font-size: 1.25rem; font-weight: 600; color: #f97316; margin: 0 0 0.6rem; }
        .feature-card p { color: #94a3b8; font-size: 0.95rem; margin: 0; }
        .card-line { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%) scaleX(0); width: 60%; height: 2px; background: linear-gradient(90deg, transparent, #f97316, transparent); transition: transform 0.4s ease; }
        .feature-card:hover .card-line { transform: translateX(-50%) scaleX(1); }

        /* ── ROOMS GRID ── */
        .rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.75rem; }

        /* ── ROOM CARD ── */
        .room-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(249,115,22,0.15); border-radius: 18px; overflow: hidden; cursor: pointer; transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.25s ease, box-shadow 0.4s cubic-bezier(0.22,1,0.36,1); will-change: transform; }
        .room-card:hover { transform: translateY(-7px); border-color: rgba(249,115,22,0.45); box-shadow: 0 20px 50px rgba(249,115,22,0.18); }
        .card-image-wrap { position: relative; height: 210px; overflow: hidden; background: #04070f; }

        /* ── Portrait image fix: blurred bg layer ── */
        .card-img-bg {
          position: absolute; inset: 0; z-index: 0;
          background-size: cover; background-position: center;
          filter: blur(16px) brightness(0.4) saturate(0.7);
          transform: scale(1.1);
        }

        .card-image-overlay { position: absolute; inset: 0; z-index: 2; background: linear-gradient(to top, rgba(4,7,15,0.75) 0%, rgba(4,7,15,0.1) 55%, transparent 100%); }
        .photo-pill { position: absolute; top: 10px; right: 10px; z-index: 3; display: flex; align-items: center; gap: 4px; padding: 4px 9px; background: rgba(4,7,15,0.75); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: rgba(255,255,255,0.8); font-size: 0.75rem; font-weight: 600; }
        .price-badge { position: absolute; bottom: 12px; left: 14px; z-index: 3; display: flex; align-items: baseline; gap: 5px; }
        .price-orig { font-size: 0.8rem; color: rgba(255,255,255,0.38); text-decoration: line-through; }
        .price-curr { font-size: 1.55rem; font-weight: 700; color: #fff; line-height: 1; }
        .price-unit { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
        .card-body { padding: 1.1rem 1.1rem 0.9rem; }
        .card-name { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin: 0 0 0.45rem; line-height: 1.2; }
        .card-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
        .tag { font-size: 0.72rem; color: #64748b; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 5px; padding: 3px 8px; display: inline-flex; align-items: center; gap: 4px; }
        .tag svg { color: #f97316; flex-shrink: 0; }
        .card-desc { font-size: 0.875rem; color: #64748b; line-height: 1.5; margin: 0 0 0.7rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .card-highlights { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.875rem; }
        .highlight-chip { font-size: 0.7rem; color: #f97316; background: rgba(249,115,22,0.07); border: 1px solid rgba(249,115,22,0.18); border-radius: 5px; padding: 2px 7px; }
        .card-footer { padding-top: 0.7rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; }
        .view-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.6rem 1.1rem; background: linear-gradient(135deg, #f97316, #ea580c); border: none; border-radius: 9px; color: #fff; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease; font-family: inherit; }
        .view-btn:hover { transform: translateX(4px); box-shadow: 0 6px 20px rgba(249,115,22,0.4); }

        /* ── CTA ── */
        .cta-section { padding: 5rem 1.5rem; }
        .cta-inner { position: relative; max-width: 760px; margin: 0 auto; text-align: center; padding: 4rem 2.5rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.2); border-radius: 28px; overflow: hidden; contain: layout paint style; }
        .cta-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 70%); pointer-events: none; }
        .cta-title { font-family: var(--font-cormorant), Georgia, serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 700; margin: 0.5rem 0 1rem; background: linear-gradient(135deg, #fff, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .cta-desc { font-size: 1.1rem; color: #94a3b8; margin: 0 0 2rem; font-weight: 300; }

        /* ══════════════════════════════════
           MODAL
           ══════════════════════════════════ */
        .modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(4,7,15,0.88); backdrop-filter: blur(20px); display: flex; align-items: flex-end; justify-content: center; animation: overlayIn 0.22s ease-out; }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-sheet { position: relative; width: 100%; max-width: 680px; max-height: 96dvh; overflow-y: auto; background: #080f1c; border: 1px solid rgba(249,115,22,0.2); border-radius: 24px 24px 0 0; animation: sheetUp 0.38s cubic-bezier(0.22,1,0.36,1); scrollbar-width: thin; scrollbar-color: rgba(249,115,22,0.2) transparent; }
        .modal-sheet::-webkit-scrollbar { width: 3px; }
        .modal-sheet::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.2); border-radius: 2px; }
        @keyframes sheetUp { from { opacity: 0; transform: translateY(56px); } to { opacity: 1; transform: translateY(0); } }
        .sheet-handle { width: 36px; height: 3px; background: rgba(255,255,255,0.12); border-radius: 2px; margin: 10px auto 0; }
        .close-btn { position: absolute; top: 12px; right: 12px; z-index: 20; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #94a3b8; cursor: pointer; transition: background 0.2s ease, color 0.2s ease, transform 0.25s ease; }
        .close-btn:hover { background: rgba(249,115,22,0.25); color: #fff; transform: rotate(90deg); }

        .sheet-gallery { width: 100%; }
        .gallery-main { position: relative; height: 260px; overflow: hidden; background: #04070f; }

        /* ── Portrait image fix: blurred bg in modal ── */
        .gallery-img-bg {
          position: absolute; inset: 0; z-index: 0;
          background-size: cover; background-position: center;
          filter: blur(20px) brightness(0.35) saturate(0.7);
          transform: scale(1.1);
        }

        .gallery-scrim { position: absolute; inset: 0; z-index: 2; pointer-events: none; background: linear-gradient(to top, rgba(8,15,28,0.5) 0%, transparent 45%); }
        .gallery-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 3; display: flex; align-items: center; justify-content: center; width: 36px; height: 54px; background: rgba(4,7,15,0.65); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f8fafc; cursor: pointer; transition: background 0.2s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1); }
        .gallery-arrow.prev { left: 10px; }
        .gallery-arrow.next { right: 10px; }
        .gallery-arrow:hover { background: rgba(249,115,22,0.55); transform: translateY(-50%) scale(1.05); }
        .gallery-counter { position: absolute; bottom: 10px; right: 10px; z-index: 3; font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.75); background: rgba(4,7,15,0.7); backdrop-filter: blur(6px); padding: 3px 9px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.08); }

        .thumbs-strip { display: flex; gap: 5px; padding: 8px 10px; overflow-x: auto; scrollbar-width: none; background: rgba(4,7,15,0.5); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .thumbs-strip::-webkit-scrollbar { display: none; }
        .gallery-thumb { position: relative; flex-shrink: 0; width: 60px; height: 46px; border-radius: 6px; overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: border-color 0.18s ease, transform 0.2s ease; background: #04070f; }
        .gallery-thumb:hover { transform: scale(1.06); }
        .gallery-thumb.active { border-color: #f97316; }
        .thumb-bg { position: absolute; inset: 0; background-size: cover; background-position: center; filter: blur(6px) brightness(0.5); transform: scale(1.1); z-index: 0; }

        .sheet-body { padding: 1.1rem 1.1rem 1.75rem; }
        .detail-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.875rem; }
        .detail-title-col { flex: 1; min-width: 0; }
        .detail-name { font-family: var(--font-cormorant), Georgia, serif; font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; line-height: 1.1; margin: 0 0 0.4rem; background: linear-gradient(135deg, #fff 30%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .detail-pills { display: flex; gap: 0.35rem; flex-wrap: wrap; }
        .detail-pill { font-size: 0.68rem; font-weight: 600; color: #f97316; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2); border-radius: 5px; padding: 2px 7px; }
        .detail-price-col { text-align: right; flex-shrink: 0; }
        .price-was { display: block; font-size: 0.8rem; color: #334155; text-decoration: line-through; }
        .price-now { display: block; font-size: 1.65rem; font-weight: 700; color: #f97316; line-height: 1; }
        .price-per { display: block; font-size: 0.7rem; color: #475569; }
        .stats-row { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.875rem; }
        .stat-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 0.8rem; color: #94a3b8; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 7px; padding: 5px 9px; }
        .stat-chip svg { color: #f97316; flex-shrink: 0; }
        .detail-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 0.75rem 0; }
        .detail-block { margin-bottom: 1rem; }
        .block-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #f97316; margin: 0 0 0.45rem; }
        .block-text { font-size: 0.875rem; color: #64748b; line-height: 1.65; margin: 0; }
        .hc-amenities-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; }
        .hc-amenity-item { display: flex; align-items: center; gap: 7px; padding: 7px 9px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 7px; color: #94a3b8; font-size: 0.82rem; transition: background 0.18s ease, border-color 0.18s ease; }
        .hc-amenity-item:hover { background: rgba(249,115,22,0.07); border-color: rgba(249,115,22,0.18); }
        .hc-check-icon { width: 13px; height: 13px; color: #22c55e; flex-shrink: 0; }
        .sheet-cta { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 1rem; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .cta-book { display: block; width: 100%; padding: 0.95rem 1rem; background: linear-gradient(135deg, #f97316, #ea580c); border: none; border-radius: 11px; color: #fff; font-size: 0.95rem; font-weight: 700; text-align: center; text-decoration: none; cursor: pointer; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease; box-shadow: 0 6px 22px rgba(249,115,22,0.38); font-family: inherit; }
        .cta-book:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(249,115,22,0.5); }
        .cta-dismiss { display: block; width: 100%; padding: 0.75rem; background: transparent; border: 1px solid rgba(255,255,255,0.08); border-radius: 11px; color: #475569; font-size: 0.875rem; cursor: pointer; transition: color 0.18s ease, border-color 0.18s ease; font-family: inherit; }
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
        @media (max-width: 968px) { .rooms-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .section { padding: 4rem 1rem; }
          .features-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .hero-content { padding: 2rem 1.5rem 6rem; }
          .hero-badge { margin-bottom: 1.75rem; }
          .hero-title { margin-bottom: 1.25rem; }
          .hero-subtitle { margin-bottom: 2.25rem; }
          .hero-buttons { gap: 0.75rem; }
          .cta-inner { padding: 2.5rem 1.5rem; }
          .hero-corner { display: none; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr; }
          .btn { padding: 0.8rem 1.5rem; font-size: 0.95rem; }
          .hero-content { padding: 2rem 1.25rem 5.5rem; }
          .hero-badge { margin-bottom: 1.5rem; }
          .hero-title { font-size: clamp(2.2rem, 10vw, 3.5rem); margin-bottom: 1rem; }
          .hero-subtitle { margin-bottom: 2rem; }
          .section-title { font-size: clamp(1.8rem, 7vw, 3rem); }
        }
      `}</style>
    </main>
  );
}
