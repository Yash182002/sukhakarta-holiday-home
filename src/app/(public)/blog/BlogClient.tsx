"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

/* ─── Types ─── */
type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTime: string;
  date: string;
  dateFormatted: string;
  featured: boolean;
  gradient: string;
  coverColor: string;
  accentColor: string;
  coverImageUrl: string | null;
  author: string;
  wordCount: number;
};

const CATEGORIES = ["All", "Travel Guide", "Getting There", "Family Travel", "Couples", "Beaches", "Planning", "Sightseeing", "Food & Drink"];

/* ─── Supabase browser client (singleton) ─── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ─── Helper: normalise a raw Supabase row → BlogPost ─── */
function normaliseRow(row: Record<string, unknown>): BlogPost {
  const dateStr = (row.published_at ?? row.created_at) as string;
  return {
    id:            row.id as string,
    slug:          row.slug as string,
    title:         row.title as string,
    excerpt:       (row.excerpt as string) ?? "",
    category:      row.category as string,
    tags:          (row.tags as string[]) ?? [],
    readTime:      row.read_time as string,
    date:          dateStr,
    dateFormatted: new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    }),
    featured:      (row.featured as boolean) ?? false,
    gradient:      "",
    coverColor:    row.cover_color as string,
    accentColor:   row.accent_color as string,
    coverImageUrl: (row.cover_image_url as string) ?? null,
    author:        row.author as string,
    wordCount:     (row.word_count as number) ?? 0,
  };
}

/* ─── Category SVG illustrations ─── */
function CategoryIllustration({ category, coverColor, accentColor, size }: {
  category: string;
  coverColor: string;
  accentColor: string;
  size: "hero" | "normal" | "small";
}) {
  const dim = size === "small" ? 40 : size === "normal" ? 64 : 96;

  const illustrations: Record<string, React.ReactNode> = {
    "Travel Guide": (
      <svg width={dim} height={dim} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="26" r="13" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.5" />
        <circle cx="32" cy="26" r="6" fill={coverColor} opacity="0.8" />
        <line x1="32" y1="10" x2="32" y2="6" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="32" y1="42" x2="32" y2="46" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="26" x2="12" y2="26" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="48" y1="26" x2="52" y2="26" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M32 39 C32 39 22 50 22 54 A10 10 0 0 0 42 54 C42 50 32 39 32 39Z" fill={coverColor} opacity="0.6" />
        <path d="M28 26 L32 18 L36 26 L32 24Z" fill={accentColor} opacity="0.9" />
      </svg>
    ),
    "Getting There": (
      <svg width={dim} height={dim} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 38 Q16 34 22 38 Q28 42 34 38 Q40 34 46 38 Q52 42 56 38" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M12 44 Q18 40 24 44 Q30 48 36 44 Q42 40 48 44 Q52 46 56 44" stroke={accentColor} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />
        <path d="M16 38 L16 24 L48 24 L52 38Z" fill={coverColor} opacity="0.6" />
        <path d="M24 24 L24 14 L40 14 L40 24Z" fill={accentColor} opacity="0.5" />
        <rect x="28" y="10" width="8" height="4" rx="1" fill={accentColor} opacity="0.8" />
        <line x1="32" y1="10" x2="32" y2="6" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    "Family Travel": (
      <svg width={dim} height={dim} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="12" r="5" fill={accentColor} opacity="0.7" />
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <line key={i}
            x1={32 + 8 * Math.cos((deg * Math.PI) / 180)}
            y1={12 + 8 * Math.sin((deg * Math.PI) / 180)}
            x2={32 + 12 * Math.cos((deg * Math.PI) / 180)}
            y2={12 + 12 * Math.sin((deg * Math.PI) / 180)}
            stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"
          />
        ))}
        <circle cx="20" cy="34" r="4" fill={coverColor} opacity="0.7" />
        <path d="M14 52 C14 44 26 44 26 52" fill={coverColor} opacity="0.5" />
        <circle cx="44" cy="34" r="4" fill={coverColor} opacity="0.7" />
        <path d="M38 52 C38 44 50 44 50 52" fill={coverColor} opacity="0.5" />
        <circle cx="32" cy="38" r="3" fill={accentColor} opacity="0.8" />
        <path d="M27 52 C27 46 37 46 37 52" fill={accentColor} opacity="0.5" />
      </svg>
    ),
    "Couples": (
      <svg width={dim} height={dim} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="28" r="11" stroke={coverColor} strokeWidth="2" fill="none" opacity="0.7" />
        <circle cx="40" cy="28" r="11" stroke={accentColor} strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M32 18 C36 22 36 34 32 38 C28 34 28 22 32 18Z" fill={accentColor} opacity="0.25" />
        <line x1="8" y1="46" x2="56" y2="46" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <path d="M8 50 Q20 44 32 50 Q44 56 56 50" stroke={coverColor} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      </svg>
    ),
    "Beaches": (
      <svg width={dim} height={dim} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="16" r="8" fill={accentColor} opacity="0.4" />
        <circle cx="48" cy="16" r="4" fill={accentColor} opacity="0.7" />
        {[0,40,50,60].map((deg,i) => (
          <line key={i}
            x1={48 + 11 * Math.cos(((deg-20)*Math.PI)/180)}
            y1={16 + 11 * Math.sin(((deg-20)*Math.PI)/180)}
            x2={48 + 15 * Math.cos(((deg-20)*Math.PI)/180)}
            y2={16 + 15 * Math.sin(((deg-20)*Math.PI)/180)}
            stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"
          />
        ))}
        <path d="M4 34 Q12 28 20 34 Q28 40 36 34 Q44 28 60 34 L60 56 L4 56Z" fill={coverColor} opacity="0.35" />
        <path d="M4 40 Q14 34 24 40 Q34 46 44 40 Q52 35 60 40 L60 56 L4 56Z" fill={coverColor} opacity="0.5" />
        <path d="M4 47 Q16 42 28 47 Q40 52 52 47 Q56 45 60 47 L60 56 L4 56Z" fill={accentColor} opacity="0.4" />
      </svg>
    ),
    "Planning": (
      <svg width={dim} height={dim} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="14" width="44" height="38" rx="4" stroke={coverColor} strokeWidth="1.5" fill="none" opacity="0.6" />
        <line x1="10" y1="24" x2="54" y2="24" stroke={accentColor} strokeWidth="1.2" opacity="0.5" />
        <line x1="22" y1="10" x2="22" y2="20" stroke={accentColor} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <line x1="42" y1="10" x2="42" y2="20" stroke={accentColor} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        {[
          [18,31],[28,31],[38,31],[48,31],
          [18,39],[28,39],[38,39],[48,39],
          [18,47],[28,47],[38,47],
        ].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill={coverColor} opacity={i === 4 ? 1 : 0.4} />
        ))}
        <circle cx="28" cy="39" r="2.5" fill={accentColor} opacity="0.9" />
      </svg>
    ),
    "Sightseeing": (
      <svg width={dim} height={dim} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="32" width="24" height="24" fill={coverColor} opacity="0.5" />
        {[20,27,34,37,44].map((x,i) => i % 2 === 0 && (
          <rect key={i} x={x} y="26" width="6" height="8" fill={coverColor} opacity="0.7" />
        ))}
        <rect x="26" y="14" width="12" height="20" fill={accentColor} opacity="0.5" />
        <polygon points="26,14 32,6 38,14" fill={accentColor} opacity="0.8" />
        <path d="M28 56 L28 46 A4 4 0 0 1 36 46 L36 56Z" fill="rgba(4,7,15,0.8)" />
        <line x1="32" y1="6" x2="32" y2="2" stroke={accentColor} strokeWidth="1.2" />
        <polygon points="32,2 40,5 32,8" fill={coverColor} opacity="0.9" />
      </svg>
    ),
    "Food & Drink": (
      <svg width={dim} height={dim} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 18 Q20 14 22 10 Q24 6 22 2" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M32 18 Q30 13 32 8 Q34 3 32 0" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M42 18 Q40 14 42 10 Q44 6 42 2" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M10 30 Q10 52 32 52 Q54 52 54 30Z" fill={coverColor} opacity="0.55" />
        <path d="M10 30 L54 30" stroke={accentColor} strokeWidth="1.5" opacity="0.6" />
        <ellipse cx="32" cy="30" rx="22" ry="3" fill={accentColor} opacity="0.2" />
        <line x1="40" y1="20" x2="52" y2="44" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="44" y1="20" x2="56" y2="44" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  };

  return (illustrations[category] ?? (
    <svg width={dim} height={dim} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32,8 56,32 32,56 8,32" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.6" />
      <polygon points="32,16 48,32 32,48 16,32" stroke={coverColor} strokeWidth="1.5" fill="none" opacity="0.5" />
      <polygon points="32,24 40,32 32,40 24,32" fill={coverColor} opacity="0.7" />
    </svg>
  )) as React.ReactNode;
}

/* ─── Visual cover for non-featured cards only ─── */
function PostCover({ post, size = "normal" }: { post: BlogPost; size?: "normal" | "small" }) {
  return (
       <div
        className={`post-cover post-cover--${size}`}
        style={{
          background: `radial-gradient(ellipse at 30% 30%, ${post.accentColor}40 0%, ${post.coverColor}28 40%, rgba(4,7,15,0.85) 100%)`,
          border: `1px solid ${post.coverColor}25`,
        }}
      >
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className={`cover-photo cover-photo--${size}`}
          loading="lazy"
        />
      )}
      <div className="cover-ring" style={{ borderColor: `${post.coverColor}20` }} />
      <div className="cover-ring cover-ring--2" style={{ borderColor: `${post.accentColor}12` }} />
      <div className="cover-grid" />
      {!post.coverImageUrl && (
        <span className="cover-illustration">
          <CategoryIllustration category={post.category} coverColor={post.coverColor} accentColor={post.accentColor} size={size} />
        </span>
      )}
      <div className="cover-shimmer" style={{ background: `linear-gradient(90deg, transparent, ${post.accentColor}35, transparent)` }} />
    </div>
  );
}

/* ─── Category badge ─── */
function CategoryBadge({ category, color }: { category: string; color: string }) {
  return (
    <span className="category-badge" style={{ color, border: `1px solid ${color}30`, background: `${color}12` }}>
      {category}
    </span>
  );
}

/* ─── Featured hero card ─── */
function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="featured-card" aria-label={`Read: ${post.title}`}>
      {/* LEFT: text content */}
      <div className="featured-content">
        <div className="featured-meta">
          <CategoryBadge category={post.category} color={post.coverColor} />
          <span className="featured-tag">✦ Featured</span>
        </div>
        <h2 className="featured-title">{post.title}</h2>
        <p className="featured-excerpt">{post.excerpt}</p>
        <div className="featured-footer">
          <div className="post-info">
            <span className="post-date">{post.dateFormatted}</span>
            <span className="dot" aria-hidden="true">·</span>
            <span className="post-readtime">{post.readTime}</span>
          </div>
          <span className="read-cta" style={{ color: post.coverColor }}>
            Read Article
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* RIGHT: dedicated image column — no absolute positioning, no overlay */}
      <div className="featured-image-col">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="featured-real-img"
            loading="eager"
            decoding="sync"
          />
        ) : (
          /* fallback illustration when no photo */
          <div
            className="featured-illustration-fallback"
            style={{
              background: `radial-gradient(ellipse at 30% 30%, ${post.accentColor}40 0%, ${post.coverColor}28 40%, rgba(4,7,15,0.85) 100%)`,
            }}
          >
            <CategoryIllustration category={post.category} coverColor={post.coverColor} accentColor={post.accentColor} size="hero" />
          </div>
        )}
      </div>

      <div className="card-shine" aria-hidden="true" />
    </Link>
  );
}

/* ─── Standard blog card ─── */
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="blog-card reveal"
      style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}
      aria-label={`Read: ${post.title}`}
    >
      <PostCover post={post} size="normal" />
      <div className="blog-card-body">
        <CategoryBadge category={post.category} color={post.coverColor} />
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">{post.excerpt}</p>
        <div className="blog-card-footer">
          <span className="blog-card-date">{post.dateFormatted}</span>
          <span className="blog-card-readtime">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {post.readTime}
          </span>
        </div>
      </div>
      <div className="blog-card-accent" style={{ background: `linear-gradient(90deg, ${post.coverColor}, ${post.accentColor})` }} />
      <div className="card-shine" aria-hidden="true" />
    </Link>
  );
}

/* ─── Horizontal compact card ─── */
function CompactCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="compact-card reveal"
      style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
      aria-label={`Read: ${post.title}`}
    >
      <PostCover post={post} size="small" />
      <div className="compact-body">
        <CategoryBadge category={post.category} color={post.coverColor} />
        <h4 className="compact-title">{post.title}</h4>
        <div className="compact-meta">
          <span>{post.dateFormatted}</span>
          <span className="dot">·</span>
          <span>{post.readTime}</span>
        </div>
      </div>
      <svg className="compact-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
      <div className="card-shine" aria-hidden="true" />
    </Link>
  );
}

/* ─── Real-time sync indicator ─── */
function SyncDot({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="sync-dot" title="Syncing new content…" aria-label="Syncing">
      <span className="sync-dot-ring" />
    </span>
  );
}

/* ─── Main component ─── */
export default function BlogClient({ posts: initialPosts }: { posts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [syncing, setSyncing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ── Real-time: subscribe to blog_posts changes ── */
  useEffect(() => {
    const channel = supabase
      .channel("public-blog-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts" },
        async () => {
          setSyncing(true);
          const { data, error } = await supabase
            .from("blog_posts")
            .select(
              "id, slug, title, excerpt, category, tags, read_time, published_at, created_at, featured, cover_color, accent_color, cover_image_url, author, word_count"
            )
            .eq("published", true)
            .order("published_at", { ascending: false, nullsFirst: false });

          if (!error && data) {
            setPosts(data.map(normaliseRow));
          }
          setTimeout(() => setSyncing(false), 800);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  /* ── Reveal animation observer ── */
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
      { threshold: 0.06, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observerRef.current?.observe(el));
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setTimeout(setupObserver, 50));
    return () => { cancelAnimationFrame(raf); observerRef.current?.disconnect(); };
  }, [activeCategory, searchQuery, posts, setupObserver]);

  const filtered = posts.filter((p) => {
    const catMatch = activeCategory === "All" || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const searchMatch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)) ||
      p.category.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  const featured = filtered.find((p) => p.featured);
  const grid = filtered.filter((p) => !p.featured);
  const mainGrid = grid.slice(0, 4);
  const compactList = grid.slice(4);

  return (
    <div className="blog-page">
      {/* ── Mesh background ── */}
      <div className="bg-mesh" aria-hidden="true">
        <div className="mesh-layer-1" />
        <div className="mesh-layer-2" />
        <div className="grid-overlay" />
        <div className="vert-line vert-line--left" />
        <div className="vert-line vert-line--right" />
      </div>

      {/* ════════ HERO ════════ */}
      <section className="blog-hero" aria-label="Blog introduction">
        <div className="hero-eyebrow">
          <span className="eyebrow-pill">✦ Alibag Travel Blog ✦</span>
        </div>
        <h1 className="blog-hero-title">
          <span className="title-line-1">Stories from</span>
          <span className="title-line-2">the Coast</span>
        </h1>
        <p className="blog-hero-sub">
          Travel guides, local secrets, and everything you need to experience the best of Alibag and the Konkan coast.
        </p>
        <div className="hero-stats" aria-label="Blog statistics">
          <div className="hero-stat">
            <span className="hero-stat-num">{posts.length}</span>
            <span className="hero-stat-label">Articles</span>
          </div>
          <div className="hero-stat-div" aria-hidden="true" />
          <div className="hero-stat">
            <span className="hero-stat-num">8</span>
            <span className="hero-stat-label">Topics</span>
          </div>
          <div className="hero-stat-div" aria-hidden="true" />
          <div className="hero-stat">
            <span className="hero-stat-num">Free</span>
            <span className="hero-stat-label">Always</span>
          </div>
        </div>
      </section>

      {/* ════════ FILTERS ════════ */}
      <div className="filters-container" role="search" aria-label="Filter blog posts">
        <div className="filters-top-row">
          <div className="search-wrap">
            <svg className="search-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              className="search-input"
              placeholder="Search articles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search blog articles"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <SyncDot active={syncing} />
        </div>

        <div className="category-pills" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`cat-pill${activeCategory === cat ? " cat-pill--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {activeCategory === cat && (
                <span className="cat-count">{cat === "All" ? posts.length : posts.filter((p) => p.category === cat).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ════════ CONTENT ════════ */}
      <main className="blog-container" id="main-content">
        {filtered.length === 0 ? (
          <div className="empty-state" role="status">
            <div className="empty-icon" aria-hidden="true">
              <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="14" width="44" height="38" rx="5" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" fill="none" />
                <line x1="20" y1="28" x2="44" y2="28" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="20" y1="36" x2="36" y2="36" stroke="rgba(249,115,22,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="46" cy="46" r="10" fill="#04070f" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" />
                <line x1="42" y1="50" x2="50" y2="42" stroke="rgba(249,115,22,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="42" y1="42" x2="50" y2="50" stroke="rgba(249,115,22,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3>No articles found</h3>
            <p>Try a different search or category.</p>
            <button className="empty-reset" onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}>
              Reset filters
            </button>
          </div>
        ) : (
          <>
            {featured && (
              <section className="featured-section" aria-label="Featured article">
                <div className="section-label-row">
                  <span className="section-label">Featured Article</span>
                  <div className="section-rule" aria-hidden="true" />
                </div>
                <FeaturedCard post={featured} />
              </section>
            )}
            {mainGrid.length > 0 && (
              <section className="grid-section" aria-label="Latest articles">
                <div className="section-label-row">
                  <span className="section-label">Latest Articles</span>
                  <div className="section-rule" aria-hidden="true" />
                </div>
                <div className="blog-grid">
                  {mainGrid.map((post, i) => <BlogCard key={post.id} post={post} index={i} />)}
                </div>
              </section>
            )}
            {compactList.length > 0 && (
              <section className="compact-section" aria-label="More articles">
                <div className="section-label-row">
                  <span className="section-label">More Reads</span>
                  <div className="section-rule" aria-hidden="true" />
                </div>
                <div className="compact-list">
                  {compactList.map((post, i) => <CompactCard key={post.id} post={post} index={i} />)}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── CTA band ── */}
        <section className="blog-cta reveal" style={{ "--delay": "0ms" } as React.CSSProperties} aria-label="Book your stay">
          <div className="cta-glow" aria-hidden="true" />
          <div className="cta-content">
            <span className="cta-eyebrow">Ready to experience it?</span>
            <h2 className="cta-heading">Alibag is better in person</h2>
            <p className="cta-sub">Stay at Sukhakarta Holiday Home — just 9 minutes from the beach.</p>
          </div>
          <Link href="/book" className="cta-btn">
            Book Your Stay
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </main>

      {/* ════════ STYLES ════════ */}
      <style jsx global>{`
        /* ── Page shell ── */
        .blog-page { min-height: 100vh; background: #04070f; color: #f8fafc; font-family: var(--font-outfit, system-ui, sans-serif); position: relative; overflow-x: hidden; }

        /* ── Background ── */
        .bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; contain: strict; }
        .mesh-layer-1 { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 55% at 100% 0%, rgba(249,115,22,0.16) 0%, transparent 55%), radial-gradient(ellipse 60% 45% at 0% 100%, rgba(14,165,233,0.11) 0%, transparent 55%), linear-gradient(160deg, #04070f 0%, #080c18 50%, #04070f 100%); }
        .mesh-layer-2 { position: absolute; inset: 0; background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(249,115,22,0.04) 0%, transparent 70%); animation: mesh-pulse 9s ease-in-out infinite alternate; will-change: opacity; }
        @keyframes mesh-pulse { from { opacity: 0.4; } to { opacity: 1; } }
        .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px); background-size: 60px 60px; }
        .vert-line { position: absolute; top: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent 0%, rgba(249,115,22,0.12) 20%, rgba(249,115,22,0.12) 80%, transparent 100%); }
        .vert-line--left  { left:  10%; }
        .vert-line--right { right: 10%; }

        /* ── Reveal ── */
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms); will-change: opacity, transform; contain: layout style; }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; contain: none; } .mesh-layer-2 { animation: none; } }

        /* ── Sync indicator ── */
        .sync-dot { display: inline-flex; align-items: center; justify-content: center; width: 10px; height: 10px; position: relative; flex-shrink: 0; }
        .sync-dot::after { content: ''; display: block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
        .sync-dot-ring { position: absolute; inset: -3px; border-radius: 50%; border: 1.5px solid #22c55e; animation: syncPulse 1s ease-out infinite; }
        @keyframes syncPulse { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(2); } }

        /* ── Filters top row ── */
        .filters-top-row { display: flex; align-items: center; gap: 0.75rem; }

        /* ════════ HERO ════════ */
        .blog-hero { position: relative; z-index: 1; padding: 5rem 2rem 3.5rem; text-align: center; max-width: 900px; margin: 0 auto; }
        .hero-eyebrow { margin-bottom: 1.5rem; animation: fadeInDown 0.7s ease-out both; }
        .eyebrow-pill { display: inline-block; padding: 0.45rem 1.25rem; border: 1px solid rgba(249,115,22,0.4); border-radius: 100px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: #f97316; background: rgba(249,115,22,0.08); }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
        .blog-hero-title { display: flex; flex-direction: column; gap: 0; line-height: 1; margin: 0 0 1.25rem; animation: fadeInUp 0.85s ease-out 0.12s both; }
        .title-line-1 { font-family: var(--font-outfit, system-ui, sans-serif); font-size: clamp(1rem, 3vw, 1.4rem); font-weight: 300; letter-spacing: 0.35em; text-transform: uppercase; color: rgba(248,250,252,0.45); margin-bottom: 0.25rem; }
        .title-line-2 { font-family: var(--font-cormorant, Georgia, serif); font-size: clamp(4rem, 11vw, 8rem); font-weight: 700; line-height: 0.9; letter-spacing: -0.03em; background: linear-gradient(135deg, #ffffff 0%, #f4d5b8 45%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .blog-hero-sub { font-size: clamp(0.95rem, 2vw, 1.15rem); color: rgba(148,163,184,0.9); font-weight: 300; line-height: 1.7; max-width: 580px; margin: 0 auto 2.5rem; animation: fadeInUp 0.85s ease-out 0.28s both; }
        .hero-stats { display: inline-flex; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.15); border-radius: 100px; overflow: hidden; animation: fadeInUp 0.85s ease-out 0.4s both; }
        .hero-stat { padding: 0.75rem 1.75rem; text-align: center; }
        .hero-stat-num { display: block; font-size: 1.4rem; font-weight: 800; color: #f97316; line-height: 1; letter-spacing: -0.03em; }
        .hero-stat-label { display: block; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin-top: 2px; }
        .hero-stat-div { width: 1px; background: rgba(249,115,22,0.15); align-self: stretch; }

        /* ════════ FILTERS ════════ */
        .filters-container { position: relative; z-index: 1; max-width: 1400px; margin: 0 auto; padding: 0 2rem 2.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .search-wrap { position: relative; max-width: 480px; flex: 1; }
        .search-ico { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; }
        .search-input { width: 100%; padding: 0.8rem 2.75rem 0.8rem 2.75rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.18); border-radius: 100px; color: #f8fafc; font-size: 0.9rem; font-family: var(--font-outfit, system-ui, sans-serif); transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease; outline: none; }
        .search-input::placeholder { color: #475569; }
        .search-input:focus { border-color: rgba(249,115,22,0.5); background: rgba(249,115,22,0.04); box-shadow: 0 0 0 3px rgba(249,115,22,0.08); }
        .search-clear { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #64748b; cursor: pointer; padding: 2px; transition: color 0.2s ease; }
        .search-clear:hover { color: #f87171; }
        .category-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .cat-pill { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.15); border-radius: 100px; color: #94a3b8; font-size: 0.8rem; font-weight: 600; font-family: var(--font-outfit, system-ui, sans-serif); cursor: pointer; white-space: nowrap; transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease; will-change: transform; }
        .cat-pill:hover { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.4); color: #f97316; transform: translateY(-1px); }
        .cat-pill--active { background: linear-gradient(135deg, #f97316, #ea580c); border-color: #f97316; color: #fff; box-shadow: 0 4px 16px rgba(249,115,22,0.35); }
        .cat-pill--active:hover { transform: translateY(-1px); }
        .cat-count { display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); border-radius: 100px; font-size: 0.65rem; min-width: 18px; height: 18px; padding: 0 5px; font-weight: 700; }

        /* ════════ CONTAINER ════════ */
        .blog-container { position: relative; z-index: 1; max-width: 1400px; margin: 0 auto; padding: 0 2rem 6rem; display: flex; flex-direction: column; gap: 4rem; }
        .section-label-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem; }
        .section-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #f97316; white-space: nowrap; }
        .section-rule { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(249,115,22,0.25), transparent); }

        /* ════════ POST COVER (grid & compact cards only) ════════ */
        .post-cover { position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .post-cover--normal { width: 100%; height: 220px; border-radius: 16px 16px 0 0; }
        .post-cover--small  { width: 80px; height: 80px; border-radius: 14px; }
        .cover-ring { position: absolute; width: 120%; padding-top: 120%; border-radius: 50%; border: 1px solid; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
        .cover-ring--2 { width: 80%; padding-top: 80%; }
        .cover-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 20px 20px; }
        .cover-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; z-index: 2; }
        .cover-photo--normal { border-radius: 16px 16px 0 0; }
        .cover-photo--small  { border-radius: 14px; }
        .cover-illustration { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 24px rgba(0,0,0,0.45)); }
        .cover-shimmer { position: absolute; bottom: 0; left: -100%; right: -100%; height: 1px; opacity: 0.6; z-index: 3; }

        /* ════════ FEATURED CARD ════════ */
        .featured-card {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 420px;
          border-radius: 24px;
          overflow: hidden;
          text-decoration: none;
          border: 1px solid rgba(249,115,22,0.2);
          background: rgba(255,255,255,0.03);
          transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, box-shadow 0.45s ease;
          will-change: transform;
        }
        .featured-card:hover { transform: translateY(-6px); border-color: rgba(249,115,22,0.5); box-shadow: 0 28px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.2); }

        /* LEFT column */
        .featured-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          padding: 2.5rem;
          background: linear-gradient(135deg, rgba(8,12,24,0.96), rgba(4,7,15,0.92));
        }

        /* RIGHT column — image lives here, fills naturally */
        .featured-image-col {
          position: relative;
          overflow: hidden;
        }

        /* The actual photo — fills the right column perfectly */
        .featured-real-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        /* Fallback illustration panel when no photo */
        .featured-illustration-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .featured-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
        .featured-tag { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #f97316; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); padding: 0.2rem 0.7rem; border-radius: 100px; }
        .featured-title { font-family: var(--font-cormorant, Georgia, serif); font-size: clamp(1.6rem, 2.5vw, 2.4rem); font-weight: 700; line-height: 1.18; letter-spacing: -0.02em; color: #f8fafc; margin: 0 0 1rem; flex: 1; transition: color 0.2s ease; }
        .featured-card:hover .featured-title { color: #fff; }
        .featured-excerpt { font-size: 0.95rem; color: #64748b; line-height: 1.7; margin: 0 0 1.75rem; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .featured-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1.25rem; }
        .post-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #475569; }
        .dot { color: #334155; }
        .read-cta { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 700; transition: gap 0.25s ease; }
        .featured-card:hover .read-cta { gap: 0.65rem; }

        /* ════════ BLOG CARD ════════ */
        .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .blog-card { position: relative; display: flex; flex-direction: column; border-radius: 20px; overflow: hidden; text-decoration: none; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.25s ease, box-shadow 0.4s ease; will-change: transform; }
        .blog-card:hover { transform: translateY(-8px); border-color: rgba(249,115,22,0.35); box-shadow: 0 20px 48px rgba(0,0,0,0.5); }
        .blog-card-body { display: flex; flex-direction: column; flex: 1; padding: 1.25rem 1.25rem 1rem; }
        .blog-card-title { font-family: var(--font-cormorant, Georgia, serif); font-size: 1.35rem; font-weight: 700; line-height: 1.25; letter-spacing: -0.01em; color: #f0f4f8; margin: 0.6rem 0 0.6rem; transition: color 0.2s ease; }
        .blog-card:hover .blog-card-title { color: #fff; }
        .blog-card-excerpt { font-size: 0.85rem; color: #64748b; line-height: 1.65; margin: 0; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid rgba(255,255,255,0.05); }
        .blog-card-date { font-size: 0.75rem; color: #475569; }
        .blog-card-readtime { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: #475569; }
        .blog-card-accent { height: 2px; width: 0%; transition: width 0.4s cubic-bezier(0.22,1,0.36,1); flex-shrink: 0; }
        .blog-card:hover .blog-card-accent { width: 100%; }
        .category-badge { display: inline-block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.2rem 0.7rem; border-radius: 100px; transition: opacity 0.2s ease; }

        /* ════════ COMPACT CARD ════════ */
        .compact-list { display: flex; flex-direction: column; gap: 0.85rem; }
        .compact-card { position: relative; display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; text-decoration: none; transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), border-color 0.2s ease, background 0.2s ease; will-change: transform; }
        .compact-card:hover { transform: translateX(6px); border-color: rgba(249,115,22,0.3); background: rgba(249,115,22,0.04); }
        .compact-body { flex: 1; min-width: 0; }
        .compact-title { font-family: var(--font-cormorant, Georgia, serif); font-size: 1.1rem; font-weight: 700; line-height: 1.3; color: #e2e8f0; margin: 0.3rem 0 0.3rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.2s ease; }
        .compact-card:hover .compact-title { color: #fff; }
        .compact-meta { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #475569; }
        .compact-arrow { color: #f97316; flex-shrink: 0; opacity: 0; transform: translateX(-6px); transition: opacity 0.2s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1); }
        .compact-card:hover .compact-arrow { opacity: 1; transform: translateX(0); }
        .card-shine { position: absolute; inset: 0; pointer-events: none; border-radius: inherit; background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%); left: -100%; transition: left 0.5s ease; }
        .blog-card:hover .card-shine, .compact-card:hover .card-shine, .featured-card:hover .card-shine { left: 100%; }

        /* ════════ EMPTY STATE ════════ */
        .empty-state { text-align: center; padding: 5rem 2rem; border: 1px dashed rgba(249,115,22,0.2); border-radius: 24px; }
        .empty-icon { display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; opacity: 0.6; width: 56px; height: 56px; }
        .empty-state h3 { font-size: 1.4rem; color: #f8fafc; margin: 0 0 0.5rem; }
        .empty-state p  { color: #64748b; margin: 0 0 1.5rem; }
        .empty-reset { padding: 0.7rem 1.75rem; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.3); border-radius: 100px; color: #f97316; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.2s ease; }
        .empty-reset:hover { background: rgba(249,115,22,0.2); }

        /* ════════ CTA BAND ════════ */
        .blog-cta { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap; padding: 3rem 3.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(249,115,22,0.2); border-radius: 28px; overflow: hidden; }
        .cta-glow { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 60% 60% at 0% 50%, rgba(249,115,22,0.12) 0%, transparent 65%); }
        .cta-content { position: relative; z-index: 1; }
        .cta-eyebrow { display: block; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #f97316; margin-bottom: 0.5rem; }
        .cta-heading { font-family: var(--font-cormorant, Georgia, serif); font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; background: linear-gradient(135deg, #fff, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 0.5rem; }
        .cta-sub { color: #64748b; font-size: 0.95rem; margin: 0; }
        .cta-btn { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 0.6rem; padding: 1rem 2.25rem; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; text-decoration: none; font-size: 0.95rem; font-weight: 700; border-radius: 100px; white-space: nowrap; box-shadow: 0 8px 28px rgba(249,115,22,0.4); transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease; will-change: transform; }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(249,115,22,0.55); }
        .cta-btn:hover svg { transform: translateX(3px); }
        .cta-btn svg { transition: transform 0.25s ease; }

        /* ════════ RESPONSIVE ════════ */
        @media (max-width: 960px) {
          .featured-card { grid-template-columns: 1fr; }
          .featured-image-col { height: 260px; order: -1; }
          .featured-real-img { border-radius: 24px 24px 0 0; }
          .featured-illustration-fallback { border-radius: 24px 24px 0 0; }
        }
        @media (max-width: 768px) { .blog-hero { padding: 4rem 1.5rem 2.5rem; } .filters-container { padding: 0 1.5rem 2rem; } .blog-container { padding: 0 1.5rem 4rem; gap: 3rem; } .blog-cta { padding: 2rem 1.75rem; } .blog-grid { grid-template-columns: 1fr; } .compact-title { white-space: normal; } }
        @media (max-width: 480px) { .blog-hero { padding: 3rem 1rem 2rem; } .filters-container { padding: 0 1rem 1.5rem; } .blog-container { padding: 0 1rem 3rem; } .hero-stat { padding: 0.65rem 1.1rem; } .hero-stat-num { font-size: 1.2rem; } .featured-content { padding: 1.5rem; } .featured-title { font-size: clamp(1.4rem, 5vw, 1.8rem); } .compact-card { gap: 0.75rem; } .post-cover--small { width: 64px; height: 64px; } .blog-cta { padding: 1.75rem 1.25rem; justify-content: center; text-align: center; } }
      `}</style>
    </div>
  );
}
