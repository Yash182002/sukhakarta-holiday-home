import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

/* ---------------- SEO ---------------- */

export const metadata = {
  title: "Sukhakarta Holiday Home - Luxury Stay in Alibag | Sea View Rooms",
  description:
    "Experience luxury at Sukhakarta Holiday Home in Alibag. Premium sea-view rooms, modern amenities, and unforgettable coastal experiences.",
  keywords: [
    "Alibag hotels",
    "Sukhakarta Holiday Home",
    "Luxury stay Alibag",
    "Sea view rooms Alibag",
    "Beach resort Maharashtra"
  ]
};

/* ---------------- ISR ---------------- */

export const revalidate = 60;

/* ---------------- PAGE ---------------- */

export default async function RoomsPage() {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return <div className="p-10 text-red-600">Failed to load rooms.</div>;
  }

  return (
    <main className="relative overflow-hidden text-white bg-slate-900">

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(249,115,22,0.12)_1px,transparent_1px)] bg-[length:50px_50px] animate-[move_20s_linear_infinite]" />
      </div>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Welcome to Paradise
          </h1>
          <p className="mt-6 text-xl text-slate-300">
            Luxury & Serenity at Sukhakarta Holiday Home, Alibag
          </p>

          <div className="mt-10 flex justify-center gap-6 flex-wrap">
            <Link
              href="/book"
              className="px-8 py-4 rounded-full bg-orange-500 hover:bg-orange-600 transition transform hover:-translate-y-1"
            >
              Book Your Stay
            </Link>
            <Link
              href="#rooms"
              className="px-8 py-4 rounded-full border border-orange-500 hover:bg-orange-500 transition"
            >
              Explore Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          Our Luxury Rooms
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {rooms?.map((room) => (
            <article
              key={room.id}
              className="bg-white/5 backdrop-blur-lg border border-orange-500/20 rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-3"
            >
              <h3 className="text-2xl font-semibold text-orange-400">
                {room.name}
              </h3>

              <p className="mt-2 text-sm text-slate-300">
                Max Guests: {room.max_guests}
              </p>

              <p className="mt-4 text-xl font-bold">
                ₹{room.base_price} / night
              </p>

              <p className="mt-2 text-sm text-green-400">
                ✔ Best price guaranteed
              </p>

              <Link
                href="/book"
                className="inline-block mt-6 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 transition-transform hover:scale-105"
              >
                Book Now
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-orange-500/5">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why Choose Sukhakarta?
        </h2>

        <div className="grid md:grid-cols-4 gap-10 max-w-7xl mx-auto px-6">
          {[
            ["🌅", "Sea Views", "Wake up to stunning coastal views"],
            ["🏨", "Luxury Rooms", "Modern amenities & comfort"],
            ["🍴", "Fine Dining", "Delicious local cuisine"],
            ["📍", "Prime Location", "Near Alibag beaches"]
          ].map(([icon, title, desc]) => (
            <div
              key={title}
              className="bg-white/5 border border-orange-500/20 backdrop-blur-lg rounded-2xl p-8 text-center transition-transform hover:-translate-y-2"
            >
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-xl font-semibold text-orange-400">
                {title}
              </h3>
              <p className="mt-2 text-slate-300">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-orange-500/20">
        <h3 className="text-xl font-semibold">
          Sukhakarta Holiday Home
        </h3>
        <p className="text-slate-400 mt-2">
          Alibag, Maharashtra, India
        </p>
        <p className="mt-4 text-sm text-slate-500">
          © 2024 Sukhakarta Holiday Home. All rights reserved.
        </p>
      </footer>

      {/* Animation keyframes */}
      <style>{`
        @keyframes move {
          from { transform: translate(0,0); }
          to { transform: translate(50px,50px); }
        }
      `}</style>
    </main>
  );
}
