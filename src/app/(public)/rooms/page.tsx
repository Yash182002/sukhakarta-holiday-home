import { createClient } from '@supabase/supabase-js';
import RoomsClient from './RoomsClient';
import SchemaScript from '@/components/SchemaScript';
import { getRoomsSchema } from '@/lib/schemas';
import { PAGE_METADATA } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = PAGE_METADATA.rooms;

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

  return (
    <>
      {rooms && rooms.length > 0 && (
        <SchemaScript schema={getRoomsSchema(rooms)} />
      )}
      <RoomsClient initialRooms={rooms || []} />
    </>
  );
}
