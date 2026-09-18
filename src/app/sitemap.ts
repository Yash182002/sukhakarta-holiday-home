import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 3600 // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = 'https://sukhakartaholidayhome.in'
  
  // Use a fixed deployment/content update date for core static pages 
  // instead of new Date().toISOString(), which fools crawlers into re-crawling unchanged pages.
  const staticLastMod = new Date('2026-09-01').toISOString()

  // Initialize Supabase Client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Core Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: staticLastMod, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/rooms`, lastModified: staticLastMod, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/book`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/gallery`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/places`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/about`, lastModified: staticLastMod, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: staticLastMod, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/blog`, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/faq`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.8 },

    // Location Landing Pages
    { url: `${BASE}/stay/near-nagaon-beach`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/stay/near-alibaug-beach`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/stay/near-varsoli-beach`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/stay/near-akshi-beach`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/stay/near-kihim-beach`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/stay/weekend-getaway-from-mumbai`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/stay/family-homestay-alibag`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/stay/couple-homestay-alibag`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/stay/group-stay-alibag`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.75 },

    // Policy Pages
    { url: `${BASE}/privacy-policy`, lastModified: staticLastMod, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/terms-of-service`, lastModified: staticLastMod, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/cancellation-policy`, lastModified: staticLastMod, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // 2. Fetch Dynamic Room Pages with Error Handling
  let roomPages: MetadataRoute.Sitemap = []
  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('slug, updated_at')
      .eq('active', true)

    if (error) {
      console.error('Sitemap Error fetching rooms:', error.message)
    } else if (rooms) {
      roomPages = rooms.map((room) => ({
        url: `${BASE}/rooms/${room.slug}`,
        lastModified: room.updated_at ? new Date(room.updated_at).toISOString() : staticLastMod,
        changeFrequency: 'monthly' as const,
        priority: 0.85,
      }))
    }
  } catch (err) {
    console.error('Unexpected error fetching rooms for sitemap:', err)
  }

  // 3. Fetch Dynamic Blog Posts with Error Handling
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Sitemap Error fetching blog posts:', error.message)
    } else if (posts) {
      blogPages = posts.map((post) => ({
        url: `${BASE}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.published_at || staticLastMod).toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.65,
      }))
    }
  } catch (err) {
    console.error('Unexpected error fetching blog posts for sitemap:', err)
  }

  return [...staticPages, ...roomPages, ...blogPages]
}
