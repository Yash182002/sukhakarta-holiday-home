"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────── Types ─────────────────────────── */

type Booking = {
  id: string;
  room_id: string;
  customer_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  total_amount: number;
  advance_amount: number;
  created_at: string;
};

type Room = { id: string; name: string };

/* ─────────────────────────── SVG Icons ─────────────────────────── */

function IconAll() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconPending() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconConfirmed() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconCancelled() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconClose({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconBan() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.99-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function IconEmpty() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ab-spinner" aria-label="Loading">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ─────────────────────────── Component ─────────────────────────── */

export default function AdminBookings() {
  const [bookings, setBookings]             = useState<Booking[]>([]);
  const [rooms, setRooms]                   = useState<Room[]>([]);
  const [loading, setLoading]               = useState(true);
  const [filterStatus, setFilterStatus]     = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data: bookingsData } = await supabase
      .from("bookings").select("*").order("created_at", { ascending: false });
    const { data: roomsData } = await supabase.from("rooms").select("id, name");
    if (bookingsData) setBookings(bookingsData);
    if (roomsData)    setRooms(roomsData);
    setLoading(false);
  }

  function getRoomName(roomId: string) {
    return rooms.find(r => r.id === roomId)?.name ?? "Unknown Room";
  }

  function calculateNights(checkIn: string, checkOut: string) {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  async function updateBookingStatus(bookingId: string, newStatus: Booking["status"]) {
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId);
    if (error) { alert("Error updating booking: " + error.message); return; }
    loadData();
    setShowDetailsModal(false);
  }

  async function deleteBooking(bookingId: string) {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
    if (error) { alert("Error deleting booking: " + error.message); return; }
    loadData();
    setShowDetailsModal(false);
  }

  function openDetailsModal(booking: Booking) {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  }

  const filteredBookings = filterStatus === "all"
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  /* ─── Render ─── */
  return (
    <>
      <PageStyles />

      <div className="ab-page">
        {/* Header */}
        <div className="ab-header">
          <h1 className="ab-title">Bookings Management</h1>
          <p className="ab-subtitle">View and manage all property bookings</p>
        </div>

        {/* Stats */}
        <div className="ab-stats">
          <div className="ab-stat-card ab-stat--total">
            <span className="ab-stat-icon"><IconAll /></span>
            <div className="ab-stat-body">
              <p className="ab-stat-label">Total Bookings</p>
              <h3 className="ab-stat-value">{stats.total}</h3>
            </div>
          </div>
          <div className="ab-stat-card ab-stat--pending">
            <span className="ab-stat-icon"><IconPending /></span>
            <div className="ab-stat-body">
              <p className="ab-stat-label">Pending</p>
              <h3 className="ab-stat-value">{stats.pending}</h3>
            </div>
          </div>
          <div className="ab-stat-card ab-stat--confirmed">
            <span className="ab-stat-icon"><IconConfirmed /></span>
            <div className="ab-stat-body">
              <p className="ab-stat-label">Confirmed</p>
              <h3 className="ab-stat-value">{stats.confirmed}</h3>
            </div>
          </div>
          <div className="ab-stat-card ab-stat--cancelled">
            <span className="ab-stat-icon"><IconCancelled /></span>
            <div className="ab-stat-body">
              <p className="ab-stat-label">Cancelled</p>
              <h3 className="ab-stat-value">{stats.cancelled}</h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="ab-filters">
          {(["all", "pending", "confirmed", "cancelled"] as const).map(s => (
            <button
              key={s}
              className={`ab-filter-btn${filterStatus === s ? " ab-filter-btn--active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All Bookings" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="ab-loading">
            <IconSpinner />
            <p>Loading bookings…</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="ab-empty">
            <span className="ab-empty-icon"><IconEmpty /></span>
            <h3>No bookings found</h3>
            <p>{filterStatus === "all" ? "No bookings have been made yet" : `No ${filterStatus} bookings`}</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="ab-table-wrap">
              <table className="ab-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Nights</th>
                    <th>Guests</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Booked On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>
                        <div className="ab-customer">
                          <strong>{booking.customer_name}</strong>
                          <small>{booking.email}</small>
                        </div>
                      </td>
                      <td>{getRoomName(booking.room_id)}</td>
                      <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                      <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                      <td>{calculateNights(booking.check_in, booking.check_out)}</td>
                      <td>{booking.guests}</td>
                      <td>
                        <div className="ab-amount">
                          <strong>₹{booking.total_amount.toLocaleString()}</strong>
                          <small>Adv: ₹{booking.advance_amount.toLocaleString()}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`ab-badge ab-badge--${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="ab-view-btn"
                          onClick={() => openDetailsModal(booking)}
                          title="View Details"
                        >
                          <IconEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="ab-cards">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="ab-card">
                  <div className="ab-card-top">
                    <div>
                      <div className="ab-card-name">{booking.customer_name}</div>
                      <div className="ab-card-room">{getRoomName(booking.room_id)}</div>
                    </div>
                    <div className="ab-card-right">
                      <span className={`ab-badge ab-badge--${booking.status}`}>{booking.status}</span>
                      <span className="ab-card-price">₹{booking.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="ab-card-meta">
                    <span>Check-in: {new Date(booking.check_in).toLocaleDateString()}</span>
                    <span>Check-out: {new Date(booking.check_out).toLocaleDateString()}</span>
                    <span>{calculateNights(booking.check_in, booking.check_out)} nights · {booking.guests} guests</span>
                  </div>
                  <button className="ab-card-view-btn" onClick={() => openDetailsModal(booking)}>
                    <IconEye /> View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Details Modal ── */}
      {showDetailsModal && selectedBooking && (
        <div className="ab-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="ab-modal" onClick={e => e.stopPropagation()}>

            <div className="ab-modal-header">
              <h2>Booking Details</h2>
              <button className="ab-close-btn" onClick={() => setShowDetailsModal(false)} aria-label="Close">
                <IconClose size={16} />
              </button>
            </div>

            <div className="ab-modal-body">
              {/* Customer */}
              <div className="ab-detail-section">
                <h3>Customer Information</h3>
                <div className="ab-detail-grid">
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Name</span>
                    <span className="ab-detail-value">{selectedBooking.customer_name}</span>
                  </div>
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Email</span>
                    <span className="ab-detail-value">{selectedBooking.email}</span>
                  </div>
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Phone</span>
                    <span className="ab-detail-value">{selectedBooking.phone}</span>
                  </div>
                </div>
              </div>

              {/* Booking */}
              <div className="ab-detail-section">
                <h3>Booking Information</h3>
                <div className="ab-detail-grid">
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Room</span>
                    <span className="ab-detail-value">{getRoomName(selectedBooking.room_id)}</span>
                  </div>
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Check-in</span>
                    <span className="ab-detail-value">{new Date(selectedBooking.check_in).toLocaleDateString()}</span>
                  </div>
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Check-out</span>
                    <span className="ab-detail-value">{new Date(selectedBooking.check_out).toLocaleDateString()}</span>
                  </div>
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Nights</span>
                    <span className="ab-detail-value">{calculateNights(selectedBooking.check_in, selectedBooking.check_out)}</span>
                  </div>
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Guests</span>
                    <span className="ab-detail-value">{selectedBooking.guests}</span>
                  </div>
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Status</span>
                    <span className={`ab-badge ab-badge--${selectedBooking.status}`}>{selectedBooking.status}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="ab-detail-section">
                <h3>Payment Information</h3>
                <div className="ab-detail-grid">
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Total Amount</span>
                    <span className="ab-detail-value ab-amount-val">₹{selectedBooking.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Advance Paid</span>
                    <span className="ab-detail-value ab-amount-val">₹{selectedBooking.advance_amount.toLocaleString()}</span>
                  </div>
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Balance</span>
                    <span className="ab-detail-value ab-amount-val ab-amount-balance">
                      ₹{(selectedBooking.total_amount - selectedBooking.advance_amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="ab-detail-section">
                <h3>Actions</h3>
                <div className="ab-action-grid">
                  {selectedBooking.status === "pending" && (
                    <button className="ab-action-btn ab-action-btn--confirm" onClick={() => updateBookingStatus(selectedBooking.id, "confirmed")}>
                      <IconCheck /> Confirm Booking
                    </button>
                  )}
                  {selectedBooking.status === "confirmed" && (
                    <button className="ab-action-btn ab-action-btn--cancel" onClick={() => updateBookingStatus(selectedBooking.id, "cancelled")}>
                      <IconBan /> Cancel Booking
                    </button>
                  )}
                  {selectedBooking.status === "cancelled" && (
                    <button className="ab-action-btn ab-action-btn--confirm" onClick={() => updateBookingStatus(selectedBooking.id, "confirmed")}>
                      <IconRefresh /> Reactivate Booking
                    </button>
                  )}
                  <button className="ab-action-btn ab-action-btn--delete" onClick={() => deleteBooking(selectedBooking.id)}>
                    <IconTrash /> Delete Booking
                  </button>
                  <a href={`tel:${selectedBooking.phone}`} className="ab-action-btn ab-action-btn--contact">
                    <IconPhone /> Call Customer
                  </a>
                  <a href={`mailto:${selectedBooking.email}`} className="ab-action-btn ab-action-btn--contact">
                    <IconMail /> Email Customer
                  </a>
                  <a
                    href={`https://wa.me/${selectedBooking.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ab-action-btn ab-action-btn--whatsapp"
                  >
                    <IconWhatsApp /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */

function PageStyles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; }
      html, body { max-width: 100%; overflow-x: hidden; }

      /* ── Page ── */
      .ab-page {
        width: 100%;
        max-width: 1400px;
        margin-inline: auto;
        padding: 2rem;
      }

      /* ── Header ── */
      .ab-title {
        font-size: clamp(1.6rem, 4vw, 2.5rem);
        font-weight: 800;
        margin: 0 0 0.4rem;
        background: linear-gradient(135deg, #fff, #f97316);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .ab-subtitle { color: #94a3b8; font-size: 1rem; margin: 0 0 2rem; }

      /* ── Stats ── */
      .ab-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.25rem;
        margin-bottom: 2rem;
      }
      .ab-stat-card {
        padding: 1.25rem 1.5rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(249,115,22,0.2);
        border-radius: 16px;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .ab-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      .ab-stat--pending   { border-color: rgba(234,179,8,0.4); }
      .ab-stat--confirmed { border-color: rgba(34,197,94,0.4); }
      .ab-stat--cancelled { border-color: rgba(239,68,68,0.4); }
      .ab-stat-icon { display: flex; align-items: center; color: #f97316; flex-shrink: 0; }
      .ab-stat--pending   .ab-stat-icon { color: #fbbf24; }
      .ab-stat--confirmed .ab-stat-icon { color: #22c55e; }
      .ab-stat--cancelled .ab-stat-icon { color: #ef4444; }
      .ab-stat-label { color: #94a3b8; font-size: 0.85rem; margin: 0 0 0.2rem; }
      .ab-stat-value { font-size: 1.8rem; font-weight: 700; color: white; margin: 0; }

      /* ── Filters ── */
      .ab-filters { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
      .ab-filter-btn {
        padding: 0.65rem 1.25rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(249,115,22,0.2);
        border-radius: 10px;
        color: #cbd5e1;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
        white-space: nowrap;
      }
      .ab-filter-btn:hover { background: rgba(249,115,22,0.1); border-color: #f97316; }
      .ab-filter-btn--active {
        background: linear-gradient(135deg, #f97316, #ea580c);
        border-color: #f97316;
        color: white;
        box-shadow: 0 4px 14px rgba(249,115,22,0.4);
      }

      /* ── Loading ── */
      .ab-loading {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; min-height: 400px; gap: 1rem; color: #94a3b8;
      }
      @keyframes ab-spin { to { transform: rotate(360deg); } }
      .ab-spinner { animation: ab-spin 0.9s linear infinite; transform-origin: center; }

      /* ── Empty ── */
      .ab-empty { padding: 4rem 2rem; text-align: center; }
      .ab-empty-icon {
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 1rem; color: #f97316; opacity: 0.35;
      }
      .ab-empty h3 { color: white; margin-bottom: 0.5rem; }
      .ab-empty p  { color: #94a3b8; }

      /* ── Table (hidden on mobile) ── */
      .ab-table-wrap {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(249,115,22,0.2);
        border-radius: 16px;
        overflow-x: auto;
      }
      .ab-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 820px;
      }
      .ab-table thead { background: rgba(249,115,22,0.1); }
      .ab-table th {
        padding: 1rem 1.1rem;
        text-align: left;
        font-weight: 700;
        color: #f97316;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        white-space: nowrap;
      }
      .ab-table td {
        padding: 1rem 1.1rem;
        border-top: 1px solid rgba(249,115,22,0.08);
        color: #cbd5e1;
        font-size: 0.9rem;
      }
      .ab-table tbody tr:hover td { background: rgba(249,115,22,0.04); }

      .ab-customer, .ab-amount { display: flex; flex-direction: column; gap: 0.2rem; }
      .ab-customer strong, .ab-amount strong { color: white; font-size: 0.92rem; }
      .ab-customer small, .ab-amount small   { color: #64748b; font-size: 0.75rem; }

      /* ── Status badge ── */
      .ab-badge {
        display: inline-block;
        padding: 0.3rem 0.7rem;
        border-radius: 10px;
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
      }
      .ab-badge--pending   { background: rgba(234,179,8,0.18);  color: #fbbf24; }
      .ab-badge--confirmed { background: rgba(34,197,94,0.18);  color: #22c55e; }
      .ab-badge--cancelled { background: rgba(239,68,68,0.18);  color: #ef4444; }

      /* ── View button ── */
      .ab-view-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 36px; height: 36px;
        border-radius: 8px; border: none;
        background: rgba(59,130,246,0.15);
        color: #60a5fa;
        cursor: pointer; transition: background 0.2s, transform 0.15s;
      }
      .ab-view-btn:hover { background: rgba(59,130,246,0.28); transform: scale(1.1); }

      /* ── Mobile cards (hidden on desktop) ── */
      .ab-cards { display: none; flex-direction: column; gap: 0.85rem; }
      .ab-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(249,115,22,0.15);
        border-radius: 14px;
        padding: 1.1rem;
        display: flex; flex-direction: column; gap: 0.75rem;
      }
      .ab-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
      .ab-card-name { font-weight: 700; color: white; font-size: 0.95rem; }
      .ab-card-room { color: #94a3b8; font-size: 0.82rem; margin-top: 2px; }
      .ab-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.35rem; }
      .ab-card-price { font-weight: 700; color: #f97316; font-size: 1rem; }
      .ab-card-meta { display: flex; flex-direction: column; gap: 0.25rem; }
      .ab-card-meta span { color: #64748b; font-size: 0.82rem; }
      .ab-card-view-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
        padding: 0.6rem 1rem;
        background: rgba(59,130,246,0.12);
        border: 1px solid rgba(59,130,246,0.25);
        border-radius: 8px;
        color: #60a5fa; font-weight: 600; font-size: 0.88rem;
        cursor: pointer; transition: background 0.2s;
        width: 100%;
      }
      .ab-card-view-btn:hover { background: rgba(59,130,246,0.22); }

      /* ── Modal ── */
      .ab-overlay {
        position: fixed; inset: 0;
        background: rgba(15,23,42,0.92);
        backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000; padding: 1rem;
        overflow-y: auto;
      }
      .ab-modal {
        background: linear-gradient(135deg, #1e293b, #0f172a);
        border: 1px solid rgba(249,115,22,0.3);
        border-radius: 20px;
        max-width: 780px; width: 100%;
        max-height: 90vh; overflow-y: auto;
        animation: ab-slideUp 0.28s cubic-bezier(0.22,1,0.36,1);
      }
      @keyframes ab-slideUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .ab-modal-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid rgba(249,115,22,0.2);
        position: sticky; top: 0;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        z-index: 1;
        border-radius: 20px 20px 0 0;
      }
      .ab-modal-header h2 { color: #f97316; margin: 0; font-size: 1.25rem; }
      .ab-close-btn {
        width: 34px; height: 34px; border-radius: 50%;
        border: none; background: rgba(239,68,68,0.15);
        color: #f87171; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s, transform 0.2s; flex-shrink: 0;
      }
      .ab-close-btn:hover { background: rgba(239,68,68,0.3); transform: rotate(90deg); }
      .ab-modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.75rem; }

      /* ── Detail sections ── */
      .ab-detail-section h3 {
        color: #f97316; margin: 0 0 1rem; font-size: 1rem;
        text-transform: uppercase; letter-spacing: 0.06em;
        border-bottom: 1px solid rgba(249,115,22,0.15);
        padding-bottom: 0.5rem;
      }
      .ab-detail-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }
      .ab-detail-item { display: flex; flex-direction: column; gap: 0.3rem; }
      .ab-detail-label { color: #94a3b8; font-size: 0.8rem; font-weight: 600; }
      .ab-detail-value { color: white; font-weight: 500; font-size: 0.9rem; }
      .ab-amount-val { font-size: 1.15rem; font-weight: 700; color: #f97316; }
      .ab-amount-balance { color: #22c55e; }

      /* ── Action buttons (modal) ── */
      .ab-action-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
        gap: 0.75rem;
      }
      .ab-action-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
        padding: 0.8rem 1.25rem;
        border-radius: 10px; border: 1px solid transparent;
        font-weight: 600; font-size: 0.88rem;
        cursor: pointer; text-decoration: none;
        transition: background 0.2s, transform 0.15s;
        white-space: nowrap;
      }
      .ab-action-btn:hover { transform: translateY(-2px); }
      .ab-action-btn--confirm  { background: rgba(34,197,94,0.15);  border-color: rgba(34,197,94,0.3);  color: #22c55e; }
      .ab-action-btn--confirm:hover  { background: rgba(34,197,94,0.25); }
      .ab-action-btn--cancel   { background: rgba(234,179,8,0.15);  border-color: rgba(234,179,8,0.3);  color: #fbbf24; }
      .ab-action-btn--cancel:hover   { background: rgba(234,179,8,0.25); }
      .ab-action-btn--delete   { background: rgba(239,68,68,0.15);  border-color: rgba(239,68,68,0.3);  color: #ef4444; }
      .ab-action-btn--delete:hover   { background: rgba(239,68,68,0.25); }
      .ab-action-btn--contact  { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.3); color: #60a5fa; }
      .ab-action-btn--contact:hover  { background: rgba(59,130,246,0.25); }
      .ab-action-btn--whatsapp { background: rgba(37,211,102,0.12); border-color: rgba(37,211,102,0.3); color: #25d366; }
      .ab-action-btn--whatsapp:hover { background: rgba(37,211,102,0.22); }

      /* ══════════ Responsive ══════════ */

      @media (max-width: 1024px) {
        .ab-stats { grid-template-columns: repeat(2, 1fr); }
      }

      @media (max-width: 768px) {
        .ab-page { padding: 1rem; }
        .ab-detail-grid { grid-template-columns: repeat(2, 1fr); }
      }

      @media (max-width: 640px) {
        /* Swap table for cards */
        .ab-table-wrap { display: none; }
        .ab-cards { display: flex; }

        .ab-stats { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .ab-stat-value { font-size: 1.4rem; }

        .ab-filters { gap: 0.5rem; }
        .ab-filter-btn { flex: 1 1 calc(50% - 0.25rem); text-align: center; }

        .ab-detail-grid { grid-template-columns: 1fr; }
        .ab-action-grid { grid-template-columns: 1fr; }

        .ab-modal { border-radius: 16px; }
        .ab-modal-header { border-radius: 16px 16px 0 0; }
      }

      @media (max-width: 380px) {
        .ab-stats { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
