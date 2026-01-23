"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/* ---------------- TYPES ---------------- */

type Room = {
  id: string;
  name: string;
  base_price: number;
  max_guests: number;
};

type BookingDate = {
  check_in: string;
  check_out: string;
};

/* ---------------- UTIL ---------------- */

function getBlockedDates(bookings: BookingDate[]) {
  const dates: string[] = [];

  bookings.forEach(b => {
    let d = new Date(b.check_in);
    const end = new Date(b.check_out);

    while (d < end) {
      dates.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
  });

  return dates;
}

/* ---------------- PAGE ---------------- */

export default function BookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  /* ---------------- LOAD RAZORPAY ---------------- */

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* ---------------- FETCH ROOMS ---------------- */

  useEffect(() => {
    supabase.from("rooms").select("*").then(({ data }) => {
      if (data) setRooms(data);
    });
  }, []);

  /* ---------------- FETCH BLOCKED DATES ---------------- */

  useEffect(() => {
    supabase
      .from("bookings")
      .select("check_in, check_out")
      .eq("status", "confirmed")
      .then(({ data }) => {
        if (data) {
          setBlockedDates(getBlockedDates(data));
        }
      });
  }, []);

/* ---------------- STOP OVERBOOKING ---------------- */
  
  useEffect(() => {
  supabase
    .from("blocked_dates")
    .select("date")
    .then(({ data }) => {
      if (data) {
        setBlockedDates(prev => [
          ...new Set([...prev, ...data.map(d => d.date)]),
        ]);
      }
    });
}, []);

  
  /* ---------------- HELPERS ---------------- */

  function nights() {
    if (!form.checkIn || !form.checkOut) return 0;
    return Math.ceil(
      (new Date(form.checkOut).getTime() -
        new Date(form.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }

  function totalAmount() {
    return selectedRoom ? nights() * selectedRoom.base_price : 0;
  }

  /* ---------------- AVAILABILITY ---------------- */

  async function checkAvailability() {
    setMessage("");
    setAvailableRooms([]);
    setSelectedRoom(null);

    if (!form.checkIn || !form.checkOut) {
      setMessage("Please select check-in and check-out dates.");
      return;
    }

    if (blockedDates.includes(form.checkIn)) {
      setMessage("Selected check-in date is unavailable.");
      return;
    }

    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      setMessage("Check-out must be after check-in.");
      return;
    }

    setLoading(true);

    const { data: bookings } = await supabase
      .from("bookings")
      .select("room_id")
      .lt("check_in", form.checkOut)
      .gt("check_out", form.checkIn);

    const bookedIds = bookings?.map(b => b.room_id) || [];

    const freeRooms = rooms.filter(
      r => !bookedIds.includes(r.id) && form.guests <= r.max_guests
    );

    if (freeRooms.length === 0) {
      setMessage("No rooms available for selected dates.");
    } else {
      setAvailableRooms(freeRooms);
    }

    setLoading(false);
  }

  /* ---------------- PAYMENT + INSERT ---------------- */

  async function startPayment() {
    if (!selectedRoom) return;

    const nightsCount = nights();
    const totalAmountValue = nightsCount * selectedRoom.base_price;
    const advanceAmount = Math.min(1000, totalAmountValue);

    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: advanceAmount }),
    });

    const order = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Sukhakarta Holiday Home",
      description: "Booking Advance",
      order_id: order.id,

      handler: async function () {
        const { error } = await supabase.from("bookings").insert({
          room_id: selectedRoom.id,
          check_in: form.checkIn,
          check_out: form.checkOut,
          guests: form.guests,
          customer_name: form.name,
          email: form.email,
          phone: form.phone,
          status: "confirmed",
          total_amount: totalAmountValue,
          advance_amount: advanceAmount,
        });

        if (error) {
          console.error(error);
          alert(error.message);
          return;
        }

        setShowSuccess(true);
      },

      theme: { color: "#f97316" },
    };

    new window.Razorpay(options).open();
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">

      <section className="py-24 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
          Book Your Stay in Alibag
        </h1>
        <p className="mt-4 text-slate-300">
          Sukhakarta Holiday Home
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-10">

        {/* FORM */}
        <div className="bg-white/5 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-orange-400">
            Reservation Details
          </h2>

          <input className="input" placeholder="Full Name"
            onChange={e => setForm({ ...form, name: e.target.value })} />

          <input className="input" placeholder="Email"
            onChange={e => setForm({ ...form, email: e.target.value })} />

          <input className="input" placeholder="Phone"
            onChange={e => setForm({ ...form, phone: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="input"
              onChange={e => setForm({ ...form, checkIn: e.target.value })} />
            <input type="date" className="input"
              onChange={e => setForm({ ...form, checkOut: e.target.value })} />
          </div>

          <input type="number" min={1} className="input"
            value={form.guests}
            onChange={e => setForm({ ...form, guests: Number(e.target.value) })} />

          <button
            onClick={checkAvailability}
            disabled={loading}
            className="w-full mt-4 py-3 rounded bg-orange-500 hover:bg-orange-600"
          >
            {loading ? "Checking..." : "Check Availability"}
          </button>

          {message && <p className="mt-3 text-red-400">{message}</p>}
        </div>

        {/* SUMMARY */}
        <div className="bg-white/5 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>

          {availableRooms.map(room => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 rounded border cursor-pointer mb-3 ${
                selectedRoom?.id === room.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-white/10"
              }`}
            >
              <strong>{room.name}</strong>
              <div>₹{room.base_price} / night</div>
              <div>Max Guests: {room.max_guests}</div>
            </div>
          ))}

          {selectedRoom && (
            <>
              <div className="mt-4">
                <div>Nights: {nights()}</div>
                <div className="text-xl font-bold text-orange-400">
                  Total: ₹{totalAmount()}
                </div>
                <div className="text-sm text-slate-300">
                  Advance payable now: ₹{Math.min(1000, totalAmount())}
                </div>
              </div>

              <button
                onClick={startPayment}
                className="w-full mt-6 py-3 rounded bg-green-600 hover:bg-green-700"
              >
                Pay Advance & Confirm
              </button>
            </>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white text-black p-10 rounded-xl text-center">
            <h3 className="text-2xl font-bold text-green-600">
              Booking Confirmed
            </h3>
            <p className="mt-2">We will contact you shortly.</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(249,115,22,0.3);
          color: white;
        }
      `}</style>
    </div>
  );
}
