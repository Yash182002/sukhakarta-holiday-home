import { createClient } from '@supabase/supabase-js';
import GalleryClient from './GalleryClient';
import { PAGE_METADATA } from '@/lib/metadata';
import { getWebPageSchema } from '@/lib/schemas';
import SchemaScript from '@/components/SchemaScript';
import type { Metadata } from 'next';

export const metadata: Metadata = PAGE_METADATA.gallery;

export const revalidate = 0;

const schema = getWebPageSchema({
  name: "Photo Gallery & Rooms — Sukhakarta Holiday Home",
  description: "Browse photos of our rooms, balcony, mountain views, and surroundings at Sukhakarta Holiday Home in Alibag, Maharashtra.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: items, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching gallery items for SSR:", error);
  }

  return (
    <>
      <SchemaScript schema={schema} />
      <GalleryClient initialItems={items || []} />
    </>
  );
}
