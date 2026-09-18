import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Fallback to absolute URL if environment variable isn't set
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sukhakartaholidayhome.in'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/user/',
          '/admin/',
          '/api/',
          '/book/confirmation',
          '/book/success',
          '/book/cancel',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
