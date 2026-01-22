import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

/* ---------------- SEO METADATA ---------------- */

export const metadata = {
  title: "Luxury Rooms in Alibag | Sukhakarta Holiday Home",
  description:
    "Book luxury rooms at Sukhakarta Holiday Home in Alibag. Peaceful coastal stay near beaches, ideal for families and weekend getaways.",
  keywords: [
    "Sukhakarta Holiday Home",
    "Alibag holiday home",
    "Luxury rooms Alibag",
    "Stay near Alibag beach",
    "Family stay Alibag",
    "Weekend getaway Alibag"
  ],
  openGraph: {
    title: "Luxury Rooms in Alibag | Sukhakarta Holiday Home",
    description:
      "Premium rooms near Alibag beaches. Book directly for best price and peaceful coastal stay.",
    type: "website"
  }
};

/* ---------------- ISR CONFIG ---------------- */

export const revalidate = 60; // Rebuild page every 60 seconds

/* ---------------- PAGE ---------------- */

export default async function RoomsPage() {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("id, name, max_guests, base_price")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="p-10 text-red-600">
        Failed to load rooms.
      </div>
    );
  }

  return (
    <main className="relative overflow-hidden bg-white">
      {/* ---------- HERO SECTION ---------- */}
      <section className="text-center py-24 px-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Luxury Rooms in Alibag
        </h1>
        <p className="mt-4 text-lg opacity-70 max-w-2xl mx-auto">
          Experience a peaceful coastal stay at Sukhakarta Holiday Home,
          surrounded by nature and close to Alibag beaches.
        </p>
      </section>

      {/* ---------- ROOMS GRID ---------- */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid gap-10 md:grid-cols-3">
          {rooms?.map((room) => (
            <article
              key={room.id}
              className="
                group rounded-3xl p-8
                border border-neutral-200
                transition-transform duration-500
                will-change-transform
                hover:-translate-y-2
              "
            >
              <h2 className="text-2xl font-semibold">
                {room.name}
              </h2>

              <p className="mt-2 text-sm opacity-70">
                Up to {room.max_guests} guests
              </p>

              <p className="mt-4 text-xl font-bold">
                ₹{room.base_price}
                <span className="text-sm opacity-60"> / night</span>
              </p>

              <Link
                href="/book"
                className="
                  inline-block mt-6
                  rounded-full px-6 py-3
                  bg-black text-white
                  transition-transform duration-300
                  hover:scale-105
                "
              >
                Book Now
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- STRUCTURED DATA (LOCAL SEO) ---------- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Hotel",
            name: "Sukhakarta Holiday Home",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Alibag",
              addressRegion: "Maharashtra",
              addressCountry: "IN"
            },
            areaServed: "Alibag",
            hotelCategory: "Holiday Home"
          })
        }}
      />
    </main>
  );
}
