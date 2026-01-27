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
    <div className="booking-page">
      {/* Animated Background */}
      <div className="bg-gradient">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Book Your Stay</h1>
          <p>Create unforgettable memories at Sukhakarta Holiday Home</p>
        </div>
      </section>

      <div className="container">
        <div className="booking-grid">
          {/* FORM */}
          <div className="form-section">
            <h2>Reservation Details</h2>
            <p className="form-subtitle">Fill in your information to check availability</p>

            <div className="form-group">
              <label>Full Name *</label>
              <input 
                className="input" 
                placeholder="Your full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input 
                  className="input" 
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input 
                  className="input" 
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Check-in Date *</label>
                <input 
                  type="date" 
                  className="input"
                  value={form.checkIn}
                  onChange={e => setForm({ ...form, checkIn: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Check-out Date *</label>
                <input 
                  type="date" 
                  className="input"
                  value={form.checkOut}
                  onChange={e => setForm({ ...form, checkOut: e.target.value })} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Number of Guests *</label>
              <input 
                type="number" 
                min={1} 
                className="input"
                value={form.guests}
                onChange={e => setForm({ ...form, guests: Number(e.target.value) })} 
              />
            </div>

            <button
              onClick={checkAvailability}
              disabled={loading}
              className="check-btn"
            >
              {loading ? (
                <span className="loader">Checking Availability...</span>
              ) : (
                <>Check Availability</>
              )}
            </button>

            {message && (
              <div className={`message ${availableRooms.length > 0 ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
          </div>

          {/* SUMMARY */}
          <div className="summary-section">
            <h2>Available Rooms</h2>

            {availableRooms.length === 0 && !message && (
              <div className="empty-state">
                <div className="empty-icon">🏨</div>
                <p>Select dates to see available rooms</p>
              </div>
            )}

            {availableRooms.length > 0 && (
              <div className="rooms-list">
                {availableRooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`room-option ${
                      selectedRoom?.id === room.id ? "selected" : ""
                    }`}
                  >
                    <div className="room-info">
                      <h3>{room.name}</h3>
                      <div className="room-details">
                        <span>Max {room.max_guests} Guests</span>
                      </div>
                    </div>
                    <div className="room-price">
                      <span className="price">₹{room.base_price}</span>
                      <span className="price-label">/ night</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedRoom && (
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                <div className="summary-item">
                  <span>Room</span>
                  <span>{selectedRoom.name}</span>
                </div>
                <div className="summary-item">
                  <span>Nights</span>
                  <span>{nights()}</span>
                </div>
                <div className="summary-item">
                  <span>Price per night</span>
                  <span>₹{selectedRoom.base_price}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-item total">
                  <span>Total Amount</span>
                  <span>₹{totalAmount()}</span>
                </div>
                <div className="summary-item advance">
                  <span>Advance Payable</span>
                  <span>₹{Math.min(1000, totalAmount())}</span>
                </div>

                <button
                  onClick={startPayment}
                  className="payment-btn"
                >
                  Pay Advance & Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal">
          <div className="modal-content">
            <div className="success-icon">✓</div>
            <h3>Booking Confirmed!</h3>
            <p>Thank you for choosing Sukhakarta Holiday Home</p>
            <p className="modal-subtext">We will contact you shortly with confirmation details</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .booking-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
        }

        .bg-gradient {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 0;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float 15s ease-in-out infinite;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: #f97316;
          top: -200px;
          right: -200px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: #0ea5e9;
          bottom: -150px;
          left: -150px;
          animation-delay: 5s;
        }

        .orb-3 {
          width: 400px;
          height: 400px;
          background: #22c55e;
          top: 50%;
          left: 50%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(100px, -100px); }
          66% { transform: translate(-100px, 100px); }
        }

        .hero {
          position: relative;
          padding: 8rem 2rem 4rem;
          text-align: center;
          z-index: 1;
        }

        .hero-content h1 {
          font-size: clamp(3rem, 8vw, 5rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 0.8s ease-out;
        }

        .hero-content p {
          font-size: 1.3rem;
          color: #cbd5e1;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 4rem;
          position: relative;
          z-index: 1;
        }

        .booking-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 3rem;
        }

        .form-section, .summary-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 24px;
          padding: 2.5rem;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .form-subtitle {
          color: #94a3b8;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .input {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .input:focus {
          outline: none;
          border-color: #f97316;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .input::placeholder {
          color: #64748b;
        }

        .check-btn, .payment-btn {
          width: 100%;
          padding: 1.2rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
        }

        .check-btn:hover:not(:disabled), 
        .payment-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
        }

        .check-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loader {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .message {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 12px;
          text-align: center;
          font-weight: 500;
        }

        .message.error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }

        .message.success {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #86efac;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state p {
          color: #94a3b8;
        }

        .rooms-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .room-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .room-option:hover {
          border-color: #f97316;
          transform: translateX(5px);
        }

        .room-option.selected {
          border-color: #f97316;
          background: rgba(249, 115, 22, 0.1);
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
        }

        .room-info h3 {
          color: #f97316;
          margin-bottom: 0.5rem;
        }

        .room-details {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .room-price {
          text-align: right;
        }

        .price {
          display: block;
          font-size: 1.8rem;
          font-weight: 700;
          color: #f97316;
        }

        .price-label {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .booking-summary {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 16px;
        }

        .booking-summary h3 {
          color: #f97316;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          color: #cbd5e1;
        }

        .summary-divider {
          height: 1px;
          background: rgba(249, 115, 22, 0.3);
          margin: 1.5rem 0;
        }

        .summary-item.total {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f97316;
        }

        .summary-item.advance {
          font-weight: 600;
          color: #22c55e;
        }

        .payment-btn {
          margin-top: 1.5rem;
        }

        .modal {
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
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(249, 115, 22, 0.2));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(34, 197, 94, 0.3);
          border-radius: 24px;
          padding: 3rem;
          text-align: center;
          max-width: 500px;
          animation: scaleIn 0.4s ease-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: white;
          animation: bounce 0.6s ease-out;
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .modal-content h3 {
          margin-bottom: 0.5rem;
          color: #22c55e;
          font-size: 2rem;
        }

        .modal-content p {
          color: #cbd5e1;
          margin-bottom: 0.5rem;
        }

        .modal-subtext {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        @media (max-width: 968px) {
          .booking-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
