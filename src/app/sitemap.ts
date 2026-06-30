import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = 'https://sukhakartaholidayhome.in'
  const now = new Date().toISOString()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                                          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/rooms`,                               lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BASE}/book`,                                lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/gallery`,                             lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/places`,                              lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/about`,                               lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${BASE}/contact`,                             lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${BASE}/blog`,                                lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${BASE}/faq`,                                 lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Location landing pages
    { url: `${BASE}/stay/near-nagaon-beach`,              lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/stay/near-alibaug-beach`,             lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/stay/near-varsoli-beach`,             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/stay/near-akshi-beach`,               lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/stay/near-kihim-beach`,               lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/stay/weekend-getaway-from-mumbai`,    lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/stay/family-homestay-alibag`,         lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/stay/couple-homestay-alibag`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/stay/group-stay-alibag`,              lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    // Policy pages (low priority, still indexed)
    { url: `${BASE}/privacy-policy`,                      lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/terms-of-service`,                    lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/cancellation-policy`,                 lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // Dynamic room pages from Supabase
  const { data: rooms } = await supabase
    .from('rooms')
    .select('slug, updated_at')
    .eq('active', true)

  const roomPages: MetadataRoute.Sitemap = (rooms ?? []).map(room => ({
    url: `${BASE}/rooms/${room.slug}`,
    lastModified: room.updated_at ?? now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  // Dynamic blog posts from Supabase
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map(post => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.updated_at ?? post.published_at ?? now,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }))

  return [...staticPages, ...roomPages, ...blogPages]
}