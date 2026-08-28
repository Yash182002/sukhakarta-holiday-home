import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

/* ─── Supabase server client ─── */
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const revalidate = 60;

/* ─── Generate static params for known slugs ─── */
export async function generateStaticParams() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((row) => ({ slug: row.slug }));
}

/* ─── Dynamic metadata ─── */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, slug, tags, published_at, cover_color, cover_image_url, meta_description, meta_keywords")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Post Not Found" };

  const description = post.meta_description || post.excerpt || "";
  const keywords = (post.meta_keywords?.length ? post.meta_keywords : post.tags) ?? [];
  const ogImage = post.cover_image_url || "https://sukhakartaholidayhome.in/logo.webp";

  return {
    title: `${post.title} | Sukhakarta Holiday Home Blog`,
    description,
    keywords,
    openGraph: {
      title: post.title,
      description,
      url: `https://sukhakartaholidayhome.in/blog/${post.slug}`,
      siteName: "Sukhakarta Holiday Home",
      locale: "en_IN",
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://sukhakartaholidayhome.in/blog/${post.slug}`,
    },
  };
}

/* ─── Escape raw HTML special chars so embedded <script>/<img onerror> etc.
   in post.content can never execute — must run BEFORE markdown transforms
   convert our own generated tags ─── */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/* ─── Simple markdown → HTML renderer (no external deps) ─── */
/* ─── Simple markdown → HTML renderer (no external deps) ─── */
function renderMarkdown(md: string): string {
  return escapeHtml(md)
    // headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // images — must run before links (similar [] () syntax, leading !)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    // markdown links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => {
      const external = /^https?:\/\//i.test(url);
      return external
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
        : `<a href="${url}">${text}</a>`;
    })
    // bare full URLs not already inside an <a> tag
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (m, pre, url) => {
      // skip if this URL is already the href of a tag we just built
      return `${pre}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    })
    // bare internal paths mentioned in prose, e.g. /places, /book, /blog/some-post
    // (avoids matching things already inside href="…" or mid-word like 24/7)
    .replace(
      /(^|[\s(])(?!<a )(\/[a-zA-Z][a-zA-Z0-9-]*(?:\/[a-zA-Z0-9-]+)*)(?=[\s.,!?)]|$)/g,
      (m, pre, path) => `${pre}<a href="${path}">${path}</a>`
    )
    // bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // inline code
    .replace(/`(.+?)`/g, "<code>$1</code>")
    // unordered lists
    .replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>")
    // ordered lists
    .replace(/^\s*\d+\. (.+)$/gm, "<li>$1</li>")
    // wrap any run of <li> lines in a list (both bullet & numbered end up here)
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    // blockquotes
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // horizontal rule
    .replace(/^---$/gm, "<hr>")
    // paragraphs — wrap lines that aren't already HTML tags
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|ul|ol|li|blockquote|hr|pre|code|img|a )/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

/* ─── Page ─── */
export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !post) notFound();

  /* increment views (fire-and-forget) */
  supabase
    .from("blog_posts")
    .update({ views: (post.views ?? 0) + 1 })
    .eq("id", post.id)
    .then(() => {});

  const dateFormatted = new Date(post.published_at ?? post.created_at).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const htmlContent = post.content ? renderMarkdown(post.content) : "";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Sukhakarta Holiday Home",
      url: "https://sukhakartaholidayhome.in",
    },
    url: `https://sukhakartaholidayhome.in/blog/${post.slug}`,
    keywords: (post.tags ?? []).join(", "),
    wordCount: post.word_count,
    image: post.cover_image_url ?? undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="bp-page">
        {/* ── Background ── */}
        <div className="bp-bg" aria-hidden="true">
          <div className="bp-bg-glow" style={{ background: `radial-gradient(ellipse 60% 40% at 70% 0%, ${post.cover_color}22 0%, transparent 60%)` }} />
          <div className="bp-grid" />
        </div>

        {/* ── Hero ── */}
        <header className="bp-hero">
          {/* Back link */}
          <Link href="/blog" className="bp-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            All Articles
          </Link>

          {/* Category + featured */}
          <div className="bp-hero-meta">
            <span
              className="bp-category"
              style={{ color: post.cover_color, background: `${post.cover_color}15`, border: `1px solid ${post.cover_color}30` }}
            >
              {post.category}
            </span>
            {post.featured && (
              <span className="bp-featured-tag">✦ Featured</span>
            )}
          </div>

          {/* Title */}
          <h1 className="bp-title" style={{ "--accent": post.cover_color } as React.CSSProperties}>
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="bp-excerpt">{post.excerpt}</p>
          )}

          {/* Meta row */}
          <div className="bp-info-row">
            <span className="bp-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {dateFormatted}
            </span>
            <span className="bp-dot">·</span>
            <span className="bp-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {post.read_time}
            </span>
            <span className="bp-dot">·</span>
            <span className="bp-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              {(post.views ?? 0).toLocaleString()} views
            </span>
            {post.word_count > 0 && (
              <>
                <span className="bp-dot">·</span>
                <span className="bp-info-item">{post.word_count.toLocaleString()} words</span>
              </>
            )}
          </div>

          {/* Tags */}
          {(post.tags ?? []).length > 0 && (
            <div className="bp-tags">
              {(post.tags as string[]).map((tag) => (
                <span key={tag} className="bp-tag">#{tag}</span>
              ))}
            </div>
          )}

          {/* Accent line */}
          <div className="bp-hero-line" style={{ background: `linear-gradient(90deg, ${post.cover_color}, ${post.accent_color}, transparent)` }} />
        </header>

        {/* ── Cover image (if set) ── */}
        {post.cover_image_url && (
          <div className="bp-cover-img-wrap">
            <img src={post.cover_image_url} alt={post.title} className="bp-cover-img" />
          </div>
        )}

        {/* ── Body ── */}
        <div className="bp-body">
          {htmlContent ? (
            <div
              className="bp-content"
              style={{ "--accent": post.cover_color, "--accent2": post.accent_color } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <div className="bp-no-content">
              <p>Content coming soon.</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="bp-footer">
          <div className="bp-author-card">
            <div className="bp-author-avatar" style={{ background: `linear-gradient(135deg, ${post.cover_color}, ${post.accent_color})` }}>
              {post.author.charAt(0)}
            </div>
            <div>
              <span className="bp-author-name">{post.author}</span>
              <span className="bp-author-sub">Sukhakarta Holiday Home · Alibag</span>
            </div>
          </div>

          <div className="bp-footer-nav">
            <Link href="/blog" className="bp-back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back to Blog
            </Link>
            <Link href="/book" className="bp-book-btn" style={{ background: `linear-gradient(135deg, ${post.cover_color}, ${post.accent_color ?? post.cover_color})` }}>
              Book Your Stay
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </footer>
      </article>

      <style>{`
        /* ── Shell ── */
        .bp-page {
          min-height: 100vh;
          background: #04070f;
          color: #f8fafc;
          font-family: var(--font-outfit, system-ui, sans-serif);
          position: relative;
          overflow-x: hidden;
        }

        /* ── Background ── */
        .bp-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .bp-bg-glow { position: absolute; inset: 0; }
        .bp-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── Hero ── */
        .bp-hero {
          position: relative; z-index: 1;
          max-width: 780px; margin: 0 auto;
          padding: 3rem 2rem 2.5rem;
        }

        /* ── Back link ── */
        .bp-back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.82rem; font-weight: 600; color: #64748b;
          text-decoration: none; margin-bottom: 2rem;
          transition: color 0.2s ease, gap 0.2s ease;
        }
        .bp-back:hover { color: #f97316; gap: 0.6rem; }

        /* ── Category / featured ── */
        .bp-hero-meta {
          display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem;
        }
        .bp-category {
          display: inline-block; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.3rem 0.85rem; border-radius: 100px;
        }
        .bp-featured-tag {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #f97316;
          background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25);
          padding: 0.3rem 0.85rem; border-radius: 100px;
        }

        /* ── Title ── */
        .bp-title {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700; line-height: 1.12;
          letter-spacing: -0.03em;
          color: #f8fafc;
          margin: 0 0 1.25rem;
        }

        /* ── Excerpt ── */
        .bp-excerpt {
          font-size: clamp(1rem, 2vw, 1.18rem);
          color: #94a3b8; line-height: 1.75; font-weight: 300;
          margin: 0 0 1.75rem;
          padding-left: 1rem;
          border-left: 3px solid var(--accent, #f97316);
        }

        /* ── Info row ── */
        .bp-info-row {
          display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;
          font-size: 0.82rem; color: #64748b; margin-bottom: 1rem;
        }
        .bp-info-item { display: flex; align-items: center; gap: 0.3rem; }
        .bp-dot { color: #334155; }

        /* ── Tags ── */
        .bp-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 2rem; }
        .bp-tag {
          font-size: 0.72rem; font-weight: 500; color: #64748b;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 0.2rem 0.65rem; border-radius: 100px;
        }

        /* ── Accent line ── */
        .bp-hero-line { height: 1px; width: 100%; margin-top: 0.5rem; opacity: 0.5; }

        /* ── Cover image ── */
        .bp-cover-img-wrap {
          position: relative; z-index: 1;
          max-width: 780px; margin: 0 auto 0;
          padding: 0 2rem;
        }
        .bp-cover-img {
          width: 100%; border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          display: block;
        }

        /* ── Body ── */
        .bp-body {
          position: relative; z-index: 1;
          max-width: 780px; margin: 0 auto;
          padding: 3rem 2rem;
        }

        /* ── Content (rendered markdown) ── */
        .bp-content { color: #cbd5e1; font-size: 1.05rem; line-height: 1.85; }

        .bp-content h1,
        .bp-content h2,
        .bp-content h3 {
          font-family: var(--font-cormorant, Georgia, serif);
          font-weight: 700; line-height: 1.2;
          color: #f8fafc; margin: 2.5rem 0 1rem;
          letter-spacing: -0.02em;
        }
        .bp-content h1 { font-size: 2rem; }
        .bp-content h2 {
          font-size: 1.65rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .bp-content h3 { font-size: 1.3rem; color: var(--accent, #f97316); }

        .bp-content p { margin: 0 0 1.4rem; }

        .bp-content a { color: var(--accent, #f97316); text-decoration: underline; text-underline-offset: 3px; }
        .bp-content a:hover { opacity: 0.8; }

        .bp-content strong { color: #f8fafc; font-weight: 700; }
        .bp-content em { color: #cbd5e1; font-style: italic; }

        .bp-content ul, .bp-content ol {
          margin: 0 0 1.4rem 1.5rem; padding: 0;
          display: flex; flex-direction: column; gap: 0.4rem;
        }
        .bp-content li { color: #cbd5e1; }
        .bp-content li::marker { color: var(--accent, #f97316); }

        .bp-content blockquote {
          margin: 1.75rem 0;
          padding: 1rem 1.5rem;
          border-left: 3px solid var(--accent, #f97316);
          background: rgba(255,255,255,0.03);
          border-radius: 0 10px 10px 0;
          color: #94a3b8; font-style: italic;
        }

        .bp-content code {
          font-family: "Courier New", monospace;
          font-size: 0.88em;
          color: var(--accent, #f97316);
          background: rgba(249,115,22,0.1);
          padding: 0.15em 0.45em; border-radius: 4px;
        }

        .bp-content hr {
          border: none; border-top: 1px solid rgba(255,255,255,0.08);
          margin: 2.5rem 0;
        }

        /* ── No content placeholder ── */
        .bp-no-content {
          text-align: center; padding: 4rem 2rem;
          border: 1px dashed rgba(249,115,22,0.15); border-radius: 16px;
          color: #475569; font-style: italic;
        }

        /* ── Footer ── */
        .bp-footer {
          position: relative; z-index: 1;
          max-width: 780px; margin: 0 auto;
          padding: 0 2rem 5rem;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 2rem;
        }
        .bp-author-card { display: flex; align-items: center; gap: 0.875rem; }
        .bp-author-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 800; color: #fff; flex-shrink: 0;
        }
        .bp-author-name { display: block; font-weight: 700; color: #f0f4f8; font-size: 0.9rem; }
        .bp-author-sub { display: block; font-size: 0.75rem; color: #64748b; margin-top: 2px; }

        .bp-footer-nav { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .bp-back-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.7rem 1.25rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; color: #94a3b8;
          text-decoration: none; font-size: 0.85rem; font-weight: 600;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .bp-back-btn:hover { background: rgba(255,255,255,0.09); color: #f8fafc; }

        .bp-book-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.7rem 1.4rem; border-radius: 100px;
          color: #fff; text-decoration: none;
          font-size: 0.85rem; font-weight: 700;
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .bp-book-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.4); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .bp-hero { padding: 2rem 1.25rem 2rem; }
          .bp-body { padding: 2rem 1.25rem; }
          .bp-cover-img-wrap { padding: 0 1.25rem; }
          .bp-footer { padding: 2rem 1.25rem 4rem; }
          .bp-title { font-size: clamp(1.75rem, 7vw, 2.5rem); }
          .bp-content { font-size: 1rem; }
        }
        @media (max-width: 480px) {
          .bp-hero { padding: 1.5rem 1rem 1.5rem; }
          .bp-body { padding: 1.5rem 1rem; }
          .bp-cover-img-wrap { padding: 0 1rem; }
          .bp-footer { padding: 1.5rem 1rem 3rem; flex-direction: column; align-items: flex-start; }
          .bp-footer-nav { width: 100%; }
          .bp-book-btn { flex: 1; justify-content: center; }
        }
      `}</style>
    </>
  );
}
