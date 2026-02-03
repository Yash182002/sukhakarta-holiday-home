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
    <main className="admin-page">
      <div className="container">
        <header className="page-header">
          <h1>Manage Blocked Dates</h1>
          <p>Prevent bookings on specific days for maintenance or holidays.</p>
        </header>

        <div className="content-grid">
          {/* Block Form */}
          <section className="card form-card">
            <div className="card-header">
              <h2>Block a Date</h2>
            </div>
            
            <div className="form-group">
              <label>Select Date</label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Reason (Optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Maintenance"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              onClick={blockDate}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Blocking..." : "Block Date"}
            </button>

            {message && <p className="error-message">{message}</p>}
          </section>

          {/* Blocked Dates List */}
          <section className="card list-card">
            <div className="card-header">
              <h2>Blocked Dates ({blockedDates.length})</h2>
            </div>

            {blockedDates.length === 0 ? (
              <div className="empty-state">
                <p>No dates are currently blocked.</p>
              </div>
            ) : (
              <div className="list-container">
                {blockedDates.map((d) => (
                  <div key={d.id} className="list-item">
                    <div className="item-info">
                      <span className="date-badge">{d.date}</span>
                      {d.reason ? (
                        <span className="reason-text">{d.reason}</span>
                      ) : (
                        <span className="no-reason">No reason provided</span>
                      )}
                    </div>
                    <button
                      onClick={() => unblockDate(d.id)}
                      className="btn-secondary"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          padding: 2rem;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 3rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #f97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #94a3b8;
          font-size: 1.1rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
        }

        /* Cards */
        .card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          padding: 2rem;
          height: fit-content;
        }

        .card-header {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 1rem;
        }

        .card-header h2 {
          font-size: 1.25rem;
          color: #f8fafc;
          font-weight: 600;
        }

        /* Form Elements */
        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .input:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
        }

        /* Buttons */
        .btn-primary {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }

        /* List Items */
        .list-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          transition: background 0.2s;
        }

        .list-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .date-badge {
          font-weight: 700;
          color: #f97316;
          font-size: 1.1rem;
        }

        .reason-text {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .no-reason {
          font-size: 0.85rem;
          color: #64748b;
          font-style: italic;
        }

        .error-message {
          margin-top: 1rem;
          color: #ef4444;
          font-size: 0.9rem;
          text-align: center;
          background: rgba(239, 68, 68, 0.1);
          padding: 0.5rem;
          border-radius: 6px;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 0;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          
          .admin-page {
            padding: 1rem;
          }
        }
      `}</style>
    </main>
  );
}
