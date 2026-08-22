import { createClient } from '@supabase/supabase-js';
import PlacesClient from './PlacesClient';
import { PAGE_METADATA } from '@/lib/metadata';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = PAGE_METADATA.places;
export const revalidate = 600;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Places to Visit Near Alibag",
  "description": "Best beaches, forts, temples and nature attractions near Sukhakarta Holiday Home, Alibag.",
  "url": "https://sukhakartaholidayhome.in/places",
  "itemListElement": [
    {
      "@type": "ListItem", "position": 1,
      "item": { "@type": "TouristAttraction", "name": "Alibag Beach",
        "description": "Popular beach in Alibag with views of Kolaba Fort, known for sunsets and local food.",
        "address": { "@type": "PostalAddress", "addressLocality": "Alibag", "addressRegion": "Maharashtra", "addressCountry": "IN" }
      }
    },
    {
      "@type": "ListItem", "position": 2,
      "item": { "@type": "TouristAttraction", "name": "Varsoli Beach",
        "description": "Peaceful and less crowded beach near Alibag with clean shoreline and coconut trees.",
        "address": { "@type": "PostalAddress", "addressLocality": "Alibag", "addressRegion": "Maharashtra", "addressCountry": "IN" }
      }
    },
    {
      "@type": "ListItem", "position": 3,
      "item": { "@type": "TouristAttraction", "name": "Nagaon Beach",
        "description": "Popular beach near Alibag famous for water sports, jet skiing and vibrant atmosphere.",
        "address": { "@type": "PostalAddress", "addressLocality": "Alibag", "addressRegion": "Maharashtra", "addressCountry": "IN" }
      }
    },
    {
      "@type": "ListItem", "position": 4,
      "item": { "@type": "TouristAttraction", "name": "Kolaba Fort",
        "description": "Historic sea fort built by Chhatrapati Shivaji Maharaj, accessible on foot during low tide.",
        "address": { "@type": "PostalAddress", "addressLocality": "Alibag", "addressRegion": "Maharashtra", "addressCountry": "IN" }
      }
    },
    {
      "@type": "ListItem", "position": 5,
      "item": { "@type": "TouristAttraction", "name": "Murud-Janjira Fort",
        "description": "Majestic sea fort off the coast of Murud, one of Maharashtra's most iconic historical attractions.",
        "address": { "@type": "PostalAddress", "addressLocality": "Murud", "addressRegion": "Maharashtra", "addressCountry": "IN" }
      }
    },
    {
      "@type": "ListItem", "position": 6,
      "item": { "@type": "TouristAttraction", "name": "Kankeshwar Temple",
        "description": "Ancient hilltop Shiva temple near Alibag with breathtaking views of the Konkan coastline.",
        "address": { "@type": "PostalAddress", "addressLocality": "Alibag", "addressRegion": "Maharashtra", "addressCountry": "IN" }
      }
    },
    {
      "@type": "ListItem", "position": 7,
      "item": { "@type": "TouristAttraction", "name": "Korlai Fort",
        "description": "Historic Portuguese fort near Alibag with panoramic Arabian Sea views.",
        "address": { "@type": "PostalAddress", "addressLocality": "Korlai", "addressRegion": "Maharashtra", "addressCountry": "IN" }
      }
    },
    {
      "@type": "ListItem", "position": 8,
      "item": { "@type": "TouristAttraction", "name": "Phansad Wildlife Sanctuary",
        "description": "Wildlife sanctuary near Alibag with diverse flora, fauna and scenic nature trails.",
        "address": { "@type": "PostalAddress", "addressLocality": "Murud", "addressRegion": "Maharashtra", "addressCountry": "IN" }
      }
    }
  ]
};

export default async function PlacesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: places, error } = await supabase
    .from("places")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching places for SSR:", error);
  }

  return (
    <>
      <Script
        id="places-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PlacesClient initialPlaces={places || []} />
    </>
  );
}
