import { createClient } from '@supabase/supabase-js';
import GalleryClient from './GalleryClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Gallery | Sukhakarta Holiday Home Alibag",
  description: "Browse photos and videos of Sukhakarta Holiday Home — our rooms, beachfront, surroundings and amenities in Alibag, Maharashtra.",
};

export const revalidate = 0;

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

  return <GalleryClient initialItems={items || []} />;
}
