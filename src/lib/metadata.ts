import type { Metadata } from 'next'

const BASE_URL    = 'https://sukhakartaholidayhome.in'
const SITE_NAME   = 'Sukhakarta Holiday Home'
const OG_IMAGE    = '/og-image.jpg'   // 1200 × 630px — create this image!
const LOCALE      = 'en_IN'

export function buildMetadata({
  title,
  description,
  path      = '/',
  image     = OG_IMAGE,
  type      = 'website' as 'website' | 'article',
  published,
  modified,
  noIndex   = false,
  keywords  = [],
}: {
  title:        string
  description:  string
  path?:        string
  image?:       string
  type?:        'website' | 'article'
  published?:   string
  modified?:    string
  noIndex?:     boolean
  keywords?:    string[]
}): Metadata {
  const url      = `${BASE_URL}${path}`
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`
  const fullTitle = `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description,
    keywords: [
      ...keywords,
      'Alibag homestay',
      'holiday home Alibag',
      'Sukhakarta Holiday Home',
      'Alibag accommodation',
      'Konkan coast stay',
    ].join(', '),
    metadataBase:   new URL(BASE_URL),
    alternates:     { canonical: url },
    openGraph: {
      title:       fullTitle,
      description,
      url,
      siteName:    SITE_NAME,
      locale:      LOCALE,
      type,
      ...(published ? { publishedTime: published } : {}),
      ...(modified  ? { modifiedTime:  modified  } : {}),
      images: [{
        url:    imageUrl,
        width:  1200,
        height: 630,
        alt:    `${title} — Sukhakarta Holiday Home, Alibag`,
      }],
    },
    twitter: {
      card:        'summary_large_image',   // ← upgraded from 'summary'
      title:       fullTitle,
      description,
      images:      [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index:  true,
          follow: true,
          googleBot: {
            index:               true,
            follow:              true,
            'max-image-preview': 'large',
            'max-snippet':       -1,
          },
        },
  }
}

// ── Per-page metadata presets ─────────────────────────────────

export const PAGE_METADATA = {

  home: buildMetadata({
    title:       'Best Homestay Near Alibag Beach',
    description: 'Book direct at Sukhakarta Holiday Home, Alibag. AC rooms from ₹1499/night near Nagaon & Varsoli Beach. Family & couple-friendly. Free parking & WiFi. Best rates guaranteed.',
    path:        '/',
    keywords:    ['holiday home alibag', 'homestay alibag', 'alibag beach stay'],
  }),

  rooms: buildMetadata({
    title:       'Rooms & Rates — Holiday Home Alibag',
    description: 'Choose from 4 rooms at Sukhakarta Holiday Home. AC rooms with mountain views from ₹1499/night. Family hall for up to 8 guests. Book direct for best rates.',
    path:        '/rooms',
    keywords:    ['rooms in alibag', 'AC rooms alibag', 'cheap homestay alibag'],
  }),

  gallery: buildMetadata({
    title:       'Photo Gallery — Sukhakarta Holiday Home, Alibag',
    description: 'Browse photos of our rooms, balcony, mountain views, and surroundings at Sukhakarta Holiday Home in Alibag, Maharashtra.',
    path:        '/gallery',
  }),

  places: buildMetadata({
    title:       'Places to Visit Near Alibag — Beaches, Forts & More',
    description: 'Explore beaches, forts, and attractions near Sukhakarta Holiday Home in Alibag. Nagaon Beach, Varsoli Beach, Kolaba Fort, Akshi Beach — all within 15 minutes.',
    path:        '/places',
    keywords:    ['places to visit alibag', 'alibag tourist places', 'beaches near alibag'],
  }),

  about: buildMetadata({
    title:       'About Us — Family-Run Homestay in Alibag',
    description: 'Learn about Sukhakarta Holiday Home — a family-run, NOC-approved homestay in Kurul, Alibag. Warm Konkani hospitality since day one.',
    path:        '/about',
  }),

  contact: buildMetadata({
    title:       'Contact Sukhakarta Holiday Home, Alibag',
    description: 'Reach Sukhakarta Holiday Home in Alibag. Call or WhatsApp +91 80875 41496. Email sukhakartaholidayhome@gmail.com. House No. 826, Kurul, Alibag 402209.',
    path:        '/contact',
  }),

  blog: buildMetadata({
    title:       'Alibag Travel Blog — Tips, Guides & Things To Do',
    description: 'Explore Alibag with our local travel guides. Best beaches, things to do, how to reach, monsoon tips, weekend itineraries — from Sukhakarta Holiday Home.',
    path:        '/blog',
    keywords:    ['alibag travel guide', 'things to do in alibag', 'alibag blog'],
  }),

  faq: buildMetadata({
    title:       'FAQs — Booking, Rooms & Stay at Sukhakarta, Alibag',
    description: 'Answers to common questions about rooms, pricing, check-in, food, parking, cancellation and how to reach Sukhakarta Holiday Home in Alibag.',
    path:        '/faq',
    keywords:    ['alibag homestay faq', 'sukhakarta holiday home faq'],
  }),

  book: buildMetadata({
    title:       'Book Your Stay — Best Rates Direct | Alibag',
    description: 'Book Sukhakarta Holiday Home directly and get the best rates. No OTA commissions. Instant confirmation. AC rooms from ₹1499/night in Alibag, Maharashtra.',
    path:        '/book',
    keywords:    ['book homestay alibag', 'alibag homestay booking'],
  }),

  nearNagaonBeach: buildMetadata({
    title: 'Holiday Home Near Nagaon Beach, Alibag',
    description: 'Looking for a holiday home near Nagaon Beach, Alibag? Sukhakarta Holiday Home is just 10-12 minutes away. AC rooms, free WiFi, from ₹1499/night. Book direct.',
    path: '/stay/near-nagaon-beach',
    keywords: ['nagaon beach homestay', 'holiday home near nagaon beach'],
  }),
 
  nearAlibaugBeach: buildMetadata({
    title: 'Holiday Home Near Alibag Beach, Maharashtra',
    description: 'Stay near Alibag beach at Sukhakarta Holiday Home. Just 9 minutes away. Clean AC rooms, free parking, warm hospitality. From ₹1499/night. Direct booking.',
    path: '/stay/near-alibaug-beach',
    keywords: ['alibag beach homestay', 'stay near alibag beach'],
  }),
 
  nearVarsoliBeach: buildMetadata({
    title: 'Holiday Home Near Varsoli Beach, Alibag',
    description: 'Find the best homestay near Varsoli Beach, Alibag. Sukhakarta Holiday Home is close to Varsoli Beach. AC rooms, free WiFi. Book direct from ₹1499/night.',
    path: '/stay/near-varsoli-beach',
    keywords: ['varsoli beach homestay', 'holiday home near varsoli beach'],
  }),
 
  weekendGetaway: buildMetadata({
    title: 'Best Weekend Getaway from Mumbai — Alibag Homestay',
    description: 'Plan your perfect weekend getaway from Mumbai to Alibag. Stay at Sukhakarta Holiday Home. 2-3 hour drive or ferry from Gateway of India. From ₹1499/night.',
    path: '/stay/weekend-getaway-from-mumbai',
    keywords: ['weekend getaway from mumbai', 'mumbai to alibag weekend trip'],
  }),
 
  familyHomestay: buildMetadata({
    title: 'Family Homestay in Alibag — Sukhakarta Holiday Home',
    description: 'Looking for a family homestay in Alibag? Sukhakarta offers spacious family halls, AC rooms, safe parking, home-cooked meals. Up to 8 guests. Book direct.',
    path: '/stay/family-homestay-alibag',
    keywords: ['family homestay alibag', 'family stay alibag'],
  }),
 
  coupleHomestay: buildMetadata({
    title: 'Couple-Friendly Homestay in Alibag — Romantic Getaway',
    description: 'Planning a romantic getaway to Alibag? Sukhakarta Holiday Home offers couple-friendly rooms with mountain views. Clean, private, warm hosts. From ₹1499/night.',
    path: '/stay/couple-homestay-alibag',
    keywords: ['couple stay alibag', 'romantic getaway alibag'],
  }),

}
