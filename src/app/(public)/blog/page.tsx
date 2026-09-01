import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BlogClient from "./BlogClient";

/* ─── SEO Metadata ─── */
export const metadata: Metadata = {
  title: "Alibag Travel Blog, Guides & Tips | Sukhakarta",
  description:
    "Discover the best travel guides, beach recommendations, and local insights for your stay in Alibag.",
  keywords: [
    "Alibag travel guide",
    "things to do in Alibag",
    "Alibag weekend getaway",
    "Mumbai to Alibag ferry",
    "Alibag beaches",
    "Alibag forts",
    "Alibag holiday tips",
    "Sukhakarta Holiday Home blog",
    "Alibag tourist places",
    "Konkan travel guide",
  ],
  openGraph: {
    title: "Travel Blog | Sukhakarta Holiday Home, Alibag",
    description:
      "Discover Alibag through our travel blog. Expert tips, hidden gems, local guides and everything you need to plan the perfect coastal getaway.",
    url: "https://sukhakartaholidayhome.in/blog",
    siteName: "Sukhakarta Holiday Home",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://sukhakartaholidayhome.in/logo.webp",
        width: 1200,
        height: 630,
        alt: "Sukhakarta Holiday Home, Alibag",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Blog | Sukhakarta Holiday Home, Alibag",
    description:
      "Discover Alibag through our travel blog. Expert tips, hidden gems and local guides.",
    images: ["https://sukhakartaholidayhome.in/logo.webp"],
  },
  alternates: {
    canonical: "https://sukhakartaholidayhome.in/blog",
  },
};

/* ─── Supabase server-side client ─── */
// Uses the service role key (never exposed to browser) for server-side fetching.
// Falls back to the anon key if service role is not set.
function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

/* ─── Fetch published posts from Supabase ─── */
// `revalidate = 60` means Next.js re-fetches from Supabase at most once per
// minute (ISR). The real-time subscription in BlogClient handles instant
// updates in the browser without waiting for revalidation.
export const revalidate = 60;

async function getPublishedPosts() {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, category, tags, read_time, published_at, created_at, featured, cover_color, accent_color, author, word_count, cover_image_url"
    )
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[Blog] Failed to fetch posts:", error.message);
    return [];
  }

  // Normalise Supabase row → BlogPost shape expected by BlogClient
  return (data ?? []).map((row) => ({
    id:            row.id,
    slug:          row.slug,
    title:         row.title,
    excerpt:       row.excerpt ?? "",
    category:      row.category,
    tags:          row.tags ?? [],
    readTime:      row.read_time,
    date:          row.published_at ?? row.created_at,
    dateFormatted: new Date(row.published_at ?? row.created_at).toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "long", year: "numeric" }
    ),
    featured:      row.featured ?? false,
    gradient:      "",            // kept for type compat — not used in BlogClient
    coverColor:    row.cover_color,
    accentColor:   row.accent_color,
    coverImageUrl: row.cover_image_url ?? null,
    author:        row.author,
    wordCount:     row.word_count ?? 0,
  }));
}

/* ─── JSON-LD Structured Data ─── */
async function buildSchema(posts: Awaited<ReturnType<typeof getPublishedPosts>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Sukhakarta Holiday Home Travel Blog",
    url: "https://sukhakartaholidayhome.in/blog",
    description:
      "Travel guides, tips and local insights for Alibag and the Konkan coast from Sukhakarta Holiday Home.",
    publisher: {
      "@type": "Organization",
      name: "Sukhakarta Holiday Home",
      url: "https://sukhakartaholidayhome.in",
      logo: {
        "@type": "ImageObject",
        url: "https://sukhakartaholidayhome.in/logo.webp",
      },
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: { "@type": "Organization", name: post.author },
      url: `https://sukhakartaholidayhome.in/blog/${post.slug}`,
      keywords: post.tags.join(", "),
      wordCount: post.wordCount,
    })),
  };
}

/* ─── Page ─── */
export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const schema = await buildSchema(posts);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/*
        Pass initialPosts from the server.
        BlogClient will keep them in state and layer a real-time
        Supabase subscription on top so admin changes appear instantly.
      */}
      <BlogClient posts={posts} />
    </>
  );
}
