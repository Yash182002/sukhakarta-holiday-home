import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const baseUrl = 'https://sukhakartaholidayhome.in';

/* ── Fetch published blog slugs for the sitemap. Uses the anon key — ──
   sitemap generation is exactly the kind of public, read-only request
   that should never need the service role key. Fails closed to an
   empty list (sitemap still works, just without blog entries) rather
   than breaking the whole sitemap if Supabase is briefly unavailable. */
async function getBlogSlugs(): Promise<{ slug: string; updated: string }[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, published_at, created_at')
      .eq('published', true);

    if (error || !data) return [];

    return data.map((p) => ({
      slug: p.slug,
      updated: p.published_at ?? p.created_at ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const blogSlugs = await getBlogSlugs();

  return [
    { url: baseUrl,                          lastModified, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${baseUrl}/rooms`,               lastModified, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/book`,                lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/gallery`,             lastModified, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/places`,              lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`,               lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog`,                lastModified, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${baseUrl}/contact`,             lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/cancellation-policy`, lastModified, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${baseUrl}/privacy-policy`,      lastModified, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`,    lastModified, changeFrequency: 'yearly',  priority: 0.3 },
    ...blogSlugs.map(({ slug, updated }) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(updated),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
