"use client";

import Link from "next/link";

/* ---------- TYPES ---------- */
export type Room = {
  id: string;
  name: string;
  max_guests: number;
  base_price: number;
};

/* ---------- PROPS ---------- */
interface HomeClientProps {
  rooms: Room[];
}

/* ---------- COMPONENT ---------- */
export default function HomeClient({ rooms }: HomeClientProps) {
  return (
    <main className="relative overflow-hidden text-white bg-slate-900">
      <section className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold">
            Welcome to Paradise
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-10">
          {rooms.map((room) => (
            <article key={room.id}>
              <h3>{room.name}</h3>
              <p>Max Guests: {room.max_guests}</p>
              <p>₹{room.base_price}</p>
              <Link href="/book">Book Now</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
