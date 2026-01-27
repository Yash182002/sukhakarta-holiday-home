import HomeClient, { Room } from "./HomeClient";
import { supabase } from "@/lib/supabaseClient";

export const metadata = {
  title: "Sukhakarta Holiday Home - Luxury Stay in Alibag | Sea View Rooms",
  description:
    "Experience luxury at Sukhakarta Holiday Home in Alibag. Premium sea-view rooms, modern amenities, and unforgettable coastal experiences.",
};

export const revalidate = 60;

export default async function Page() {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load rooms");
  }

  return <HomeClient rooms={data as Room[]} />;
}
