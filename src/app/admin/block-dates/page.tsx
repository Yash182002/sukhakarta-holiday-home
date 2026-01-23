"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type BlockedDate = {
  id: string;
  date: string;
  reason: string | null;
};

export default function BlockDatesAdmin() {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadBlockedDates() {
    const { data } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("date", { ascending: true });

    if (data) setBlockedDates(data);
  }

  useEffect(() => {
    loadBlockedDates();
  }, []);

  async function blockDate() {
    setMessage("");

    if (!date) {
      setMessage("Please select a date.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("blocked_dates").insert({
      date,
      reason,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setDate("");
      setReason("");
      loadBlockedDates();
    }

    setLoading(false);
  }

  async function unblockDate(id: string) {
    await supabase.from("blocked_dates").delete().eq("id", id);
    loadBlockedDates();
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Admin · Block Dates
      </h1>

      {/* Block Form */}
      <div className="bg-white/5 border border-orange-500/20 rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Block a Date
        </h2>

        <input
          type="date"
          className="input"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <input
          type="text"
          className="input"
          placeholder="Reason (optional)"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />

        <button
          onClick={blockDate}
          disabled={loading}
          className="mt-4 px-6 py-3 rounded bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? "Blocking..." : "Block Date"}
        </button>

        {message && (
          <p className="mt-3 text-red-500">{message}</p>
        )}
      </div>

      {/* Blocked Dates List */}
      <div className="bg-white/5 border border-orange-500/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Blocked Dates
        </h2>

        {blockedDates.length === 0 && (
          <p className="text-slate-400">No blocked dates.</p>
        )}

        <ul className="space-y-3">
          {blockedDates.map(d => (
            <li
              key={d.id}
              className="flex justify-between items-center border border-white/10 rounded p-3"
            >
              <div>
                <strong>{d.date}</strong>
                {d.reason && (
                  <div className="text-sm text-slate-400">
                    {d.reason}
                  </div>
                )}
              </div>

              <button
                onClick={() => unblockDate(d.id)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Unblock
              </button>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .input {
          display: block;
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(249,115,22,0.3);
          color: white;
        }
      `}</style>
    </main>
  );
}
