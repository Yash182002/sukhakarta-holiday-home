"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

type Room = {
  id: string;
  name: string;
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Load bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    // Load rooms
    const { data: roomsData } = await supabase.from("rooms").select("id, name");

    if (bookingsData) setBookings(bookingsData);
    if (roomsData) setRooms(roomsData);

    setLoading(false);
  }

  function getRoomName(roomId: string) {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name : "Unknown Room";
  }

  function calculateNights(checkIn: string, checkOut: string) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  async function updateBookingStatus(
    bookingId: string,
    newStatus: "pending" | "confirmed" | "cancelled"
  ) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      alert("Error updating booking: " + error.message);
      return;
    }

    // Reload bookings
    loadData();
    setShowDetailsModal(false);
  }

  async function deleteBooking(bookingId: string) {
    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      alert("Error deleting booking: " + error.message);
      return;
    }

    loadData();
    setShowDetailsModal(false);
  }

  function openDetailsModal(booking: Booking) {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  }

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <>
      <div className="bookings-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Bookings Management</h1>
            <p>View and manage all property bookings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <p className="stat-label">Total Bookings</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <p className="stat-label">Pending</p>
              <h3 className="stat-value">{stats.pending}</h3>
            </div>
          </div>

          <div className="stat-card confirmed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <p className="stat-label">Confirmed</p>
              <h3 className="stat-value">{stats.confirmed}</h3>
            </div>
          </div>

          <div className="stat-card cancelled">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <p className="stat-label">Cancelled</p>
              <h3 className="stat-value">{stats.cancelled}</h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Bookings
          </button>
          <button
            className={`filter-btn ${
              filterStatus === "pending" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${
              filterStatus === "confirmed" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("confirmed")}
          >
            Confirmed
          </button>
          <button
            className={`filter-btn ${
              filterStatus === "cancelled" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading bookings...</p>
          </div>
        ) : (
          <div className="bookings-table-container">
            {filteredBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>No bookings found</h3>
                <p>
                  {filterStatus === "all"
                    ? "No bookings have been made yet"
                    : `No ${filterStatus} bookings`}
                </p>
              </div>
            ) : (
              <table className="bookings-table">
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
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <div className="customer-info">
                          <strong>{booking.customer_name}</strong>
                          <small>{booking.email}</small>
                        </div>
                      </td>
                      <td>{getRoomName(booking.room_id)}</td>
                      <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                      <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                      <td>
                        {calculateNights(booking.check_in, booking.check_out)}
                      </td>
                      <td>{booking.guests}</td>
                      <td>
                        <div className="amount-info">
                          <strong>₹{booking.total_amount}</strong>
                          <small>Adv: ₹{booking.advance_amount}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="action-btn view"
                          onClick={() => openDetailsModal(booking)}
                          title="View Details"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Customer Info */}
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {selectedBooking.customer_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedBooking.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedBooking.phone}</span>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div className="detail-section">
                <h3>Booking Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Room:</span>
                    <span className="detail-value">
                      {getRoomName(selectedBooking.room_id)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">
                      {new Date(selectedBooking.check_in).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Check-out:</span>
                    <span className="detail-value">
                      {new Date(selectedBooking.check_out).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Nights:</span>
                    <span className="detail-value">
                      {calculateNights(
                        selectedBooking.check_in,
                        selectedBooking.check_out
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Guests:</span>
                    <span className="detail-value">{selectedBooking.guests}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedBooking.status}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="detail-section">
                <h3>Payment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value amount">
                      ₹{selectedBooking.total_amount}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Advance Paid:</span>
                    <span className="detail-value amount">
                      ₹{selectedBooking.advance_amount}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Balance:</span>
                    <span className="detail-value amount highlight">
                      ₹
                      {selectedBooking.total_amount -
                        selectedBooking.advance_amount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="detail-section">
                <h3>Actions</h3>
                <div className="action-buttons">
                  {selectedBooking.status === "pending" && (
                    <button
                      className="modal-action-btn confirm"
                      onClick={() =>
                        updateBookingStatus(selectedBooking.id, "confirmed")
                      }
                    >
                      ✅ Confirm Booking
                    </button>
                  )}

                  {selectedBooking.status === "confirmed" && (
                    <button
                      className="modal-action-btn cancel"
                      onClick={() =>
                        updateBookingStatus(selectedBooking.id, "cancelled")
                      }
                    >
                      ❌ Cancel Booking
                    </button>
                  )}

                  {selectedBooking.status === "cancelled" && (
                    <button
                      className="modal-action-btn confirm"
                      onClick={() =>
                        updateBookingStatus(selectedBooking.id, "confirmed")
                      }
                    >
                      ✅ Reactivate Booking
                    </button>
                  )}

                  <button
                    className="modal-action-btn delete"
                    onClick={() => deleteBooking(selectedBooking.id)}
                  >
                    🗑️ Delete Booking
                  </button>

                  <a
                    href={`tel:${selectedBooking.phone}`}
                    className="modal-action-btn contact"
                  >
                    📞 Call Customer
                  </a>

                  <a
                    href={`mailto:${selectedBooking.email}`}
                    className="modal-action-btn contact"
                  >
                    ✉️ Email Customer
                  </a>

                  <a
                    href={`https://wa.me/${selectedBooking.phone.replace(
                      /[^0-9]/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-action-btn contact"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        .bookings-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-header p {
          color: #94a3b8;
          font-size: 1.1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .stat-card.pending {
          border-color: rgba(234, 179, 8, 0.4);
        }

        .stat-card.confirmed {
          border-color: rgba(34, 197, 94, 0.4);
        }

        .stat-card.cancelled {
          border-color: rgba(239, 68, 68, 0.4);
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0 0 0.25rem 0;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 12px;
          color: #cbd5e1;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-btn:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: #f97316;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-color: #f97316;
          color: white;
          box-shadow: 0 5px 15px rgba(249, 115, 22, 0.4);
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(249, 115, 22, 0.2);
          border-top-color: #f97316;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading p {
          color: #94a3b8;
        }

        .bookings-table-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          overflow-x: auto;
        }

        .bookings-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }

        .bookings-table thead {
          background: rgba(249, 115, 22, 0.1);
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .bookings-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #f97316;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .bookings-table td {
          padding: 1rem;
          border-top: 1px solid rgba(249, 115, 22, 0.1);
          color: #cbd5e1;
        }

        .bookings-table tbody tr {
          transition: background 0.3s;
        }

        .bookings-table tbody tr:hover {
          background: rgba(249, 115, 22, 0.05);
        }

        .customer-info,
        .amount-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .customer-info strong,
        .amount-info strong {
          color: white;
        }

        .customer-info small,
        .amount-info small {
          color: #64748b;
          font-size: 0.75rem;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.pending {
          background: rgba(234, 179, 8, 0.2);
          color: #fbbf24;
        }

        .status-badge.confirmed {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .status-badge.cancelled {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s;
          background: rgba(59, 130, 246, 0.2);
        }

        .action-btn:hover {
          transform: scale(1.1);
          background: rgba(59, 130, 246, 0.3);
        }

        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          color: white;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #94a3b8;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          overflow-y: auto;
        }

        .modal {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 20px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .modal-header h2 {
          color: #f97316;
          margin: 0;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .detail-section h3 {
          color: #f97316;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .detail-value {
          color: white;
          font-weight: 500;
        }

        .detail-value.amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f97316;
        }

        .detail-value.amount.highlight {
          color: #22c55e;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .modal-action-btn {
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .modal-action-btn.confirm {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .modal-action-btn.confirm:hover {
          background: rgba(34, 197, 94, 0.3);
          transform: translateY(-2px);
        }

        .modal-action-btn.cancel {
          background: rgba(234, 179, 8, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(234, 179, 8, 0.3);
        }

        .modal-action-btn.cancel:hover {
          background: rgba(234, 179, 8, 0.3);
          transform: translateY(-2px);
        }

        .modal-action-btn.delete {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .modal-action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.3);
          transform: translateY(-2px);
        }

        .modal-action-btn.contact {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .modal-action-btn.contact:hover {
          background: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .filters {
            flex-direction: column;
          }

          .filter-btn {
            width: 100%;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
