"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BookPage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkAvailability() {
    setResult("");

    if (!checkIn || !checkOut) {
      setResult("Please select both check-in and check-out dates.");
      return;
    }

    setLoading(true);

    const { data: rooms } = await supabase
      .from("rooms")
      .select("*");

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .lt("check_in", checkOut)
      .gt("check_out", checkIn);

    const bookedRoomIds = bookings?.map((b) => b.room_id) || [];

    const availableRooms =
      rooms?.filter(
        (room) =>
          !bookedRoomIds.includes(room.id) &&
          guests <= room.max_guests
      ) || [];

    if (availableRooms.length === 0) {
      setResult("No rooms available for selected dates.");
    } else {
      setResult(
        "Available rooms: " +
          availableRooms.map((r) => r.name).join(", ")
      );
    }

    setLoading(false);
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

        {result && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
