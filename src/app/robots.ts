import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
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
      {
        // Block AI training crawlers (optional but recommended)
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: 'https://sukhakartaholidayhome.in/sitemap.xml',
    host: 'https://sukhakartaholidayhome.in',
  }
}
