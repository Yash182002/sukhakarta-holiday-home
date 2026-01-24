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
    <main className="
  relative overflow-hidden text-white
  bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <section className="
  relative min-h-screen flex items-center justify-center text-center px-6
  before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15),transparent_60%)]
  before:animate-pulseSlow">
        <div>
          <h1 className="
  text-5xl md:text-7xl font-extrabold tracking-tight
  bg-gradient-to-r from-white via-orange-300 to-yellow-300
  bg-clip-text text-transparent
  animate-fadeUp">
            Welcome to Paradise
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-10 perspective-1000">
          {rooms.map((room) => (
            <article
              
  key={room.id}
  className="
    group relative rounded-3xl p-8
    bg-white/5 backdrop-blur-xl
    border border-white/10
    shadow-[0_20px_50px_rgba(0,0,0,0.35)]
    transition-all duration-700 ease-out
    will-change-transform
    hover:-translate-y-4 hover:rotate-[0.3deg]">
              
             <h3 className="
  text-2xl font-semibold tracking-wide
  text-orange-300
  group-hover:text-orange-200
  transition-colors">
  {room.name}
</h3>

              <p>Max Guests: {room.max_guests}</p>
              <p className="mt-4 text-3xl font-bold tracking-tight">
  ₹{room.base_price}
  <span className="text-sm font-medium text-white/60"> / night</span>
</p>
              <Link
  href="/book"
  className="
    inline-flex items-center justify-center mt-6
    px-8 py-3 rounded-full
    bg-gradient-to-r from-orange-500 to-yellow-400
    text-black font-semibold
    transition-all duration-500
    hover:scale-105 hover:shadow-[0_10px_40px_rgba(249,115,22,0.45)]
    active:scale-95">
  Book Now
</Link>

            </article>
          ))}
        </div>
      </section>
      
    <style>{`
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulseSlow {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.7;
    }
  }

  .animate-fadeUp {
    animation: fadeUp 1.2s ease-out forwards;
  }

  .animate-pulseSlow {
    animation: pulseSlow 8s ease-in-out infinite;
  }

  .perspective-1000 {
    perspective: 1000px;
  }
`}</style>

    </main>
  );
}
