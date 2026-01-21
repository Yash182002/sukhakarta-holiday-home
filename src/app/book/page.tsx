"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Room = {
  id: string;
  name: string;
  max_guests: number;
  base_price: number;
};

export default function BookPage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* Load Razorpay script */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* Fetch rooms */
  useEffect(() => {
    supabase
      .from("rooms")
      .select("*")
      .then(({ data }) => {
        if (data) setRooms(data);
      });
  }, []);

  function getNights() {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    return Math.ceil(
      (outDate.getTime() - inDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }

  async function checkAvailability() {
    setMessage("");
    setAvailableRooms([]);
    setSelectedRoom(null);

    if (!checkIn || !checkOut) {
      setMessage("Please select check-in and check-out dates.");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setMessage("Check-out date must be after check-in date.");
      return;
    }

    setLoading(true);

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .lt("check_in", checkOut)
      .gt("check_out", checkIn);

    const bookedRoomIds = bookings?.map((b) => b.room_id) || [];

    const freeRooms = rooms.filter(
      (room) =>
        !bookedRoomIds.includes(room.id) &&
        guests <= room.max_guests
    );

    if (freeRooms.length === 0) {
      setMessage("No rooms available for selected dates.");
    } else {
      setAvailableRooms(freeRooms);
    }

    setLoading(false);
  }

  async function startPayment() {
    if (!selectedRoom) return;

    const nights = getNights();
    const totalAmount = selectedRoom.base_price * nights;

    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalAmount }),
    });

    const order = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Sukhakarta Holiday Home",
      description: "Full Booking Payment",
      order_id: order.id,

      handler: async function (response: any) {
        /* VERIFY PAYMENT */
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
          alert("Payment verification failed");
          return;
        }

        /* SAVE BOOKING */
        await supabase.from("bookings").insert({
          room_id: selectedRoom.id,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          status: "confirmed",
        });

        window.location.href = "/booking-confirmed";
      },

      theme: {
        color: "#000000",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Book Your Stay</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1">Check-in</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Check-out</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Guests</label>
          <input
            type="number"
            min={1}
            max={11}
            className="w-full border p-2 rounded"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
          />
        </div>

        <button
          onClick={checkAvailability}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded"
        >
          {loading ? "Checking..." : "Check Availability"}
        </button>

        {message && (
          <div className="p-3 border rounded bg-red-50 text-red-700">
            {message}
          </div>
        )}

        {availableRooms.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold mt-6">
              Available Rooms
            </h2>

            {availableRooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 border rounded cursor-pointer ${
                  selectedRoom?.id === room.id
                    ? "border-black bg-gray-100"
                    : ""
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <strong>{room.name}</strong>
                <div>₹{room.base_price} / night</div>
                <div>Max Guests: {room.max_guests}</div>
              </div>
            ))}
          </div>
        )}

        {selectedRoom && (
          <button
            onClick={startPayment}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded"
          >
            Pay
          </button>
        )}
      </div>
    </main>
  );
}
