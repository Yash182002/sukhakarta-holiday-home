import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/user/'] },
    sitemap: 'https://sukhakartaholidayhome.in/sitemap.xml',
  };
}
