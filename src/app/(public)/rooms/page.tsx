import { createClient } from '@supabase/supabase-js';
import RoomsClient from './RoomsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Rooms at Sukhakarta Holiday Home | Alibag Beach Accommodation",
  description: "Explore our premium A/C rooms with mountain views, beach access and modern amenities in Alibag. Book direct for best rates at Sukhakarta Holiday Home.",
};

export const revalidate = 60;

export default async function RoomsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("id, name, base_price, max_guests, description, images, amenities, size, view")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching rooms for SSR:", error);
  }

  return <RoomsClient initialRooms={rooms || []} />;
}
