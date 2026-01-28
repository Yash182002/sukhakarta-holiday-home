import HomeClient, { Room } from "./HomeClient";
import { supabase } from "@/lib/supabaseClient";

export const metadata = {
  title: "Sukhakarta Holiday Home - Luxury Stay in Alibag | Sea View Rooms",
  description:
    "Experience luxury at Sukhakarta Holiday Home in Alibag. Premium sea-view rooms, modern amenities, and unforgettable coastal experiences.",
};

// Enable revalidation every 10 seconds for fresh data
export const revalidate = 10;

export default async function Page() {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading rooms:", error);
    return <HomeClient rooms={[]} />;
  }

  return <HomeClient rooms={data as Room[]} />;
}
