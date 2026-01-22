import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const metadata = {
  title: "Luxury Rooms in Alibag | Sukhakarta Holiday Home",
  description:
    "Luxury rooms near Alibag beach. Book directly at Sukhakarta Holiday Home for peaceful coastal stay.",
};

export const revalidate = 60;

export default async function RoomsPage() {
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, max_guests, base_price, image_url")
    .order("created_at");

  return (
    <main className="bg-white">
      <section className="text-center py-24">
        <h1 className="text-6xl font-bold">Luxury Rooms in Alibag</h1>
        <p className="mt-4 opacity-70">
          Comfortable stays close to Alibag beaches
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-10">
          {rooms?.map((room) => (
            <article
              key={room.id}
              className="group rounded-3xl overflow-hidden border transition-transform duration-500 hover:-translate-y-2 will-change-transform"
            >
              <div className="relative h-56">
                <Image
                  src={room.image_url}
                  alt={room.name}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="/blur-placeholder.png"
                />
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-semibold">{room.name}</h2>
                <p className="text-sm opacity-70">
                  Up to {room.max_guests} guests
                </p>

                <p className="mt-3 text-xl font-bold">
                  ₹{room.base_price} / night
                </p>

                <Link
                  href="/book"
                  className="inline-block mt-5 rounded-full bg-black text-white px-6 py-3 hover:scale-105 transition-transform"
                >
                  Book Now
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
