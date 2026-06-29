import { createClient } from '@supabase/supabase-js';
import PlacesClient from './PlacesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Places to Visit Near Alibag | Sukhakarta Holiday Home",
  description: "Discover the best beaches, forts, temples and attractions near Sukhakarta Holiday Home in Alibag, Maharashtra. Plan your perfect coastal getaway.",
};

export const revalidate = 600;

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

  return <PlacesClient initialPlaces={places || []} />;
}
