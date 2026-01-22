import { supabase } from "@/lib/supabaseClient";

export const metadata = {
  title: "Luxury Rooms in Alibag | Sukhakarta Holiday Home",
  description:
    "Book luxury rooms at Sukhakarta Holiday Home in Alibag. Peaceful coastal stay near beaches, perfect for families and weekend getaways.",
  keywords: [
    "Sukhakarta Holiday Home",
    "Alibag cottage",
    "Luxury rooms Alibag",
    "Stay near Alibag beach",
    "Family stay Alibag",
    "Weekend getaway Alibag"
  ],
  openGraph: {
    title: "Luxury Rooms in Alibag | Sukhakarta Holiday Home",
    description:
      "Premium rooms near Alibag beaches. Book directly for best prices and peaceful coastal stay.",
    type: "website"
  }
};

export const revalidate = 0;

export default async function RoomsPage() {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="p-10 text-red-600">
        Failed to load rooms.
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-10">
        Rooms at Sukhakarta Holiday Home
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {rooms?.map((room) => (
          <div
            key={room.id}
            className="border rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              {room.name}
            </h2>

            <p className="mt-2 text-sm">
              Max Guests: {room.max_guests}
            </p>

            <p className="mt-1 font-medium">
              ₹{room.base_price} / night
            </p>

            <a
              href="/book"
              className="inline-block mt-4 px-5 py-2 rounded bg-black text-white"
            >
              Book Now
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
