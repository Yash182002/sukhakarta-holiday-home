export const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LodgingBusiness", "LocalBusiness"],
      "@id": "https://sukhakartaholidayhome.in/#business",
      "name": "Sukhakarta Holiday Home",
      "alternateName": ["Sukhakarta Homestay", "Sukhakarta Holiday Home Alibag"],
      "description": "Family-run holiday home in Kurul, Alibag, Maharashtra. Clean AC rooms with mountain views, near Nagaon Beach, Varsoli Beach, and Akshi Beach. Perfect for families, couples, and groups. Direct booking available.",
      "url": "https://sukhakartaholidayhome.in",
      "telephone": "+918087541496",
      "email": "sukhakartaholidayhome@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "House No. 826, Kurul",
        "addressLocality": "Alibag",
        "addressRegion": "Maharashtra",
        "postalCode": "402209",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 18.6414,
        "longitude": 72.8716
      },
      "image": [
        "https://sukhakartaholidayhome.in/og-image.jpg"
      ],
      "logo": {
        "@type": "ImageObject",
        "url": "https://sukhakartaholidayhome.in/logo.webp",
        "width": 384,
        "height": 128
      },
      "priceRange": "₹₹",
      "currenciesAccepted": "INR",
      "paymentAccepted": "Cash, Credit Card, UPI, Online Transfer",
      "checkinTime": "12:00",
      "checkoutTime": "11:00",
      "numberOfRooms": 4,
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Free Wi-Fi", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Air Conditioning", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Private Bathroom", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Balcony", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Flat Screen TV", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Free Toiletries", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Mountain View", "value": true }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "9.0",
        "reviewCount": "17",
        "bestRating": "10",
        "worstRating": "1"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:00",
          "closes": "22:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Saturday", "Sunday"],
          "opens": "07:00",
          "closes": "23:00"
        }
      ],
      "sameAs": [
        "https://www.instagram.com/sukhakarta.holiday.home/",
        "https://www.booking.com/hotel/in/sukhakarta-holiday-home.html"
      ],
      "hasMap": "https://maps.app.goo.gl/z2MFwbGfMcDXR16dA",
      "tourBookingPage": "https://sukhakartaholidayhome.in/book"
    },
    {
      "@type": "WebSite",
      "@id": "https://sukhakartaholidayhome.in/#website",
      "url": "https://sukhakartaholidayhome.in",
      "name": "Sukhakarta Holiday Home",
      "description": "Book direct at Sukhakarta Holiday Home, Alibag. Best rates guaranteed.",
      "inLanguage": "en-IN",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://sukhakartaholidayhome.in/rooms?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
}

// ─────────────────────────────────────────────────────────────
// 2. ROOM PAGE SCHEMA — HotelRoom + Offer
// Usage: Pass room data dynamically
// ─────────────────────────────────────────────────────────────
export function getRoomsSchema(rooms: {
  id: string
  name: string
  base_price: number
  max_guests: number
  description: string
  images?: string[] | null
  amenities?: string[] | null
  size?: string | null
  view?: string | null
}[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": "https://sukhakartaholidayhome.in/rooms#roomslist",
        "name": "Rooms at Sukhakarta Holiday Home",
        "itemListElement": rooms.map((room, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "HotelRoom",
            "@id": `https://sukhakartaholidayhome.in/rooms#room-${room.id}`,
            "name": room.name,
            "description": room.description,
            "image": room.images && room.images.length > 0 ? room.images[0] : undefined,
            "occupancy": {
              "@type": "QuantitativeValue",
              "maxValue": room.max_guests
            },
            "containedInPlace": {
              "@id": "https://sukhakartaholidayhome.in/#business"
            },
            "offers": {
              "@type": "Offer",
              "price": room.base_price,
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://sukhakartaholidayhome.in/book"
            }
          }
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sukhakartaholidayhome.in" },
          { "@type": "ListItem", "position": 2, "name": "Rooms", "item": "https://sukhakartaholidayhome.in/rooms" }
        ]
      }
    ]
  }
}
// ─────────────────────────────────────────────────────────────
// 3. FAQ PAGE SCHEMA
// ─────────────────────────────────────────────────────────────
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How far is Sukhakarta Holiday Home from Alibag beach?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sukhakarta Holiday Home is just 9 minutes from Alibag beach. We are also close to Nagaon Beach, Varsoli Beach, and Akshi Beach — all within 15 minutes."
      }
    },
    {
      "@type": "Question",
      "name": "What rooms are available at Sukhakarta Holiday Home?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer 4 room options: Signature Comfort Room (4 guests), Luxury Mountain View Room (4 guests), Scenic Open View Room (3 guests), and the Scenic Open View Hall (8 guests) with a large private balcony and traditional wooden swing."
      }
    },
    {
      "@type": "Question",
      "name": "What is the price per night at Sukhakarta Holiday Home?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rooms start from ₹1,799 per night for standard rooms. The family hall starts from ₹2,499 per night. Book directly at sukhakartaholidayhome.in for the best rates — no extra OTA fees."
      }
    },
    {
      "@type": "Question",
      "name": "Is there parking available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Sukhakarta Holiday Home provides free, safe parking space for all guests."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer meals or food at the homestay?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer breakfast and meals on request. Our hosts prepare delicious homemade Konkani-style food. Please inform us in advance when booking."
      }
    },
    {
      "@type": "Question",
      "name": "What are the check-in and check-out times?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Check-in is at 12:00 PM and check-out is at 11:00 AM. Early check-in or late check-out may be arranged on request, subject to availability."
      }
    },
    {
      "@type": "Question",
      "name": "Is Sukhakarta Holiday Home family-friendly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! Sukhakarta Holiday Home is ideal for families. We have a spacious family hall that accommodates up to 8 guests, with a private balcony and traditional wooden swing. We welcome couples, families, and groups."
      }
    },
    {
      "@type": "Question",
      "name": "How do I reach Alibag from Mumbai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can reach Alibag from Mumbai by: (1) Ferry from Gateway of India to Mandwa Jetty (about 1 hour), then bus/taxi to Alibag — most popular route. (2) By road via NH 66 — about 2.5 to 3 hours. We are located in Kurul, Alibag, just 2.5 km from Alibag ST Bus Depot."
      }
    },
    {
      "@type": "Question",
      "name": "Is Wi-Fi available at Sukhakarta Holiday Home?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, high-speed Wi-Fi is available free of charge for all guests in all rooms."
      }
    },
    {
      "@type": "Question",
      "name": "Are the rooms air-conditioned?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, all rooms at Sukhakarta Holiday Home are fully air-conditioned."
      }
    },
    {
      "@type": "Question",
      "name": "What is the cancellation policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our cancellation policy is available at sukhakartaholidayhome.in/cancellation-policy. For the most current terms, please review the policy page or contact us at +91 80875 41496."
      }
    },
    {
      "@type": "Question",
      "name": "Is Sukhakarta Holiday Home NOC approved?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Sukhakarta Holiday Home is NOC approved and operates with all required local permissions in Alibag, Maharashtra."
      }
    }
  ]
}

// ─────────────────────────────────────────────────────────────
// 4. BLOG POST SCHEMA
// ─────────────────────────────────────────────────────────────
export function getBlogPostSchema(post: {
  title: string
  slug: string
  description: string
  publishedDate: string
  modifiedDate: string
  imageUrl: string
  authorName: string
  category: string
  wordCount: number
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://sukhakartaholidayhome.in/blog/${post.slug}#article`,
        "headline": post.title,
        "description": post.description,
        "image": post.imageUrl,
        "datePublished": post.publishedDate,
        "dateModified": post.modifiedDate,
        "author": {
          "@type": "Person",
          "name": post.authorName,
          "url": "https://sukhakartaholidayhome.in/about"
        },
        "publisher": {
          "@id": "https://sukhakartaholidayhome.in/#business"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://sukhakartaholidayhome.in/blog/${post.slug}`
        },
        "articleSection": post.category,
        "wordCount": post.wordCount,
        "inLanguage": "en-IN",
        "keywords": "Alibag, travel guide, homestay, weekend getaway, Maharashtra"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sukhakartaholidayhome.in" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://sukhakartaholidayhome.in/blog" },
          { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://sukhakartaholidayhome.in/blog/${post.slug}` }
        ]
      }
    ]
  }
}

// ─────────────────────────────────────────────────────────────
// 5. PLACES PAGE SCHEMA — TouristAttraction list
// ─────────────────────────────────────────────────────────────
export const placesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Places to Visit Near Sukhakarta Holiday Home, Alibag",
  "description": "Top tourist attractions, beaches, and places to visit near Sukhakarta Holiday Home in Alibag, Maharashtra.",
  "url": "https://sukhakartaholidayhome.in/places",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "TouristAttraction",
        "name": "Nagaon Beach",
        "description": "Popular beach near Alibag, known for water sports and golden sands.",
        "address": { "@type": "PostalAddress", "addressLocality": "Nagaon", "addressRegion": "Maharashtra" },
        "geo": { "@type": "GeoCoordinates", "latitude": 18.6667, "longitude": 72.9167 }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "TouristAttraction",
        "name": "Varsoli Beach",
        "description": "Quiet beach near Alibag, ideal for peaceful walks and sunset views.",
        "address": { "@type": "PostalAddress", "addressLocality": "Varsoli", "addressRegion": "Maharashtra" }
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "TouristAttraction",
        "name": "Kolaba Fort (Alibag Fort)",
        "description": "16th century sea fort visible during low tide, a major landmark of Alibag.",
        "address": { "@type": "PostalAddress", "addressLocality": "Alibag", "addressRegion": "Maharashtra" }
      }
    },
    {
      "@type": "ListItem",
      "position": 4,
      "item": {
        "@type": "TouristAttraction",
        "name": "Akshi Beach",
        "description": "Clean, less crowded beach near Alibag with calm waters.",
        "address": { "@type": "PostalAddress", "addressLocality": "Akshi", "addressRegion": "Maharashtra" }
      }
    }
  ]
}

// ─────────────────────────────────────────────────────────────
// 6. ORGANIZATION SCHEMA — About Page
// ─────────────────────────────────────────────────────────────
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://sukhakartaholidayhome.in/#organization",
  "name": "Sukhakarta Holiday Home",
  "url": "https://sukhakartaholidayhome.in",
  "logo": "https://sukhakartaholidayhome.in/logo.webp",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+918087541496",
    "contactType": "reservations",
    "availableLanguage": ["English", "Hindi", "Marathi"],
    "areaServed": "IN"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "House No. 826, Kurul",
    "addressLocality": "Alibag",
    "addressRegion": "Maharashtra",
    "postalCode": "402209",
    "addressCountry": "IN"
  },
  "sameAs": [
    "https://www.instagram.com/sukhakarta.holiday.home/",
    "https://www.booking.com/hotel/in/sukhakarta-holiday-home.html"
  ]
}

// ─────────────────────────────────────────────────────────────
// 7. NEXT.JS SchemaScript COMPONENT
// Usage: <SchemaScript schema={homepageSchema} />
// ─────────────────────────────────────────────────────────────
// components/SchemaScript.tsx
export const SchemaScriptComponent = `
import React from 'react'

interface SchemaScriptProps {
  schema: object | object[]
}

export default function SchemaScript({ schema }: SchemaScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  )
}
`

// ─────────────────────────────────────────────────────────────
// 8. NEXT.JS generateMetadata HELPER
// Use in each page's generateMetadata export
// ─────────────────────────────────────────────────────────────
export const metadataHelpers = `
// lib/metadata.ts
import type { Metadata } from 'next'

const BASE_URL = 'https://sukhakartaholidayhome.in'
const SITE_NAME = 'Sukhakarta Holiday Home'
const DEFAULT_IMAGE = '/og-image.jpg' // Create a 1200x630 OG image

export function buildMetadata({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
}: {
  title: string
  description: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}): Metadata {
  const url = \`\${BASE_URL}\${path}\`
  const imageUrl = image.startsWith('http') ? image : \`\${BASE_URL}\${image}\`

  return {
    title: \`\${title} | \${SITE_NAME}\`,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    openGraph: {
      title: \`\${title} | \${SITE_NAME}\`,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: \`\${title} — Sukhakarta Holiday Home, Alibag\`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',   // ← Fix from summary
      title: \`\${title} | \${SITE_NAME}\`,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  }
}

// PAGE EXAMPLES:
// app/page.tsx
export const metadata = buildMetadata({
  title: 'Best Homestay Near Alibag Beach',
  description: 'Book direct at Sukhakarta Holiday Home, Alibag. AC rooms from ₹1499/night near Nagaon & Varsoli Beach. Family & couple-friendly. Free parking & WiFi.',
  path: '/',
})

// app/rooms/page.tsx
export const metadata = buildMetadata({
  title: 'Rooms & Rates — Holiday Home Alibag',
  description: 'Choose from 4 room types at Sukhakarta Holiday Home. AC rooms, mountain views, private bathrooms. From ₹1499/night. Book direct for best rates.',
  path: '/rooms',
})

// app/blog/page.tsx
export const metadata = buildMetadata({
  title: 'Alibag Travel Blog — Tips, Guides & Things To Do',
  description: 'Explore Alibag with our travel guides. Best beaches, things to do, how to reach, monsoon tips, weekend itineraries and more from Sukhakarta Holiday Home.',
  path: '/blog',
})

// app/faq/page.tsx
export const metadata = buildMetadata({
  title: 'FAQs — Sukhakarta Holiday Home, Alibag',
  description: 'Answers to common questions about booking, rooms, pricing, check-in times, food, parking, and more at Sukhakarta Holiday Home in Alibag.',
  path: '/faq',
})
`
