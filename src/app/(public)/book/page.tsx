"use client";

import { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

declare global {
  interface Window { Razorpay: any; }
}

/* ─────────────────────────── TYPES ─────────────────────────── */

type PricingTier = {
  guests: number;
  price: number;
};

type Room = {
  id: string;
  name: string;
  base_price: number;
  effectiveBasePrice?: number;
  extra_guest_price?: number;
  max_guests: number;
  pricing_tiers?: PricingTier[];
  description?: string;
  images?: string[];
  amenities?: string[];
  is_hall?: boolean;
  room_type?: string;
};

type RoomAllocation = {
  roomId: string;
  roomName: string;
  guests: number;
  pricePerNight: number;
  maxGuests: number;
};

type BookingDate = {
  check_in: string;
  check_out: string;
};

/* ─────────────────────────── HELPERS ─────────────────────────── */

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

function getRoomPrice(room: Room, guestCount: number): number {
  const basePrice = room.effectiveBasePrice ?? room.base_price;
  const surcharge = room.extra_guest_price ?? 0;
  const extraGuests = Math.max(0, guestCount - 2);
  return basePrice + extraGuests * surcharge;
}

function suggestRoomCombinations(
  availableRooms: Room[],
  totalGuests: number
): RoomAllocation[][] {
  const combinations: RoomAllocation[][] = [];
  const seen = new Set<string>();

  const regularRooms = availableRooms.filter(r => !r.is_hall && r.room_type !== 'hall');
  const hallRooms    = availableRooms.filter(r => r.is_hall  || r.room_type === 'hall');

  const totalRoomCapacity = regularRooms.reduce((sum, r) => sum + r.max_guests, 0);

  if (totalGuests > totalRoomCapacity && hallRooms.length > 0) {
    for (const hall of hallRooms) {
      const roomAllocations: RoomAllocation[] = regularRooms.map(room => ({
        roomId: room.id, roomName: room.name,
        guests: room.max_guests,
        pricePerNight: getRoomPrice(room, room.max_guests),
        maxGuests: room.max_guests,
      }));
      const remainingGuests = totalGuests - totalRoomCapacity;
      if (remainingGuests > 0 && remainingGuests <= hall.max_guests) {
        roomAllocations.push({
          roomId: hall.id, roomName: hall.name,
          guests: remainingGuests,
          pricePerNight: getRoomPrice(hall, remainingGuests),
          maxGuests: hall.max_guests,
        });
        combinations.push(roomAllocations);
      }
    }
    for (const hall of hallRooms) {
      if (hall.max_guests >= totalGuests) {
        combinations.push([{
          roomId: hall.id, roomName: hall.name,
          guests: totalGuests,
          pricePerNight: getRoomPrice(hall, totalGuests),
          maxGuests: hall.max_guests,
        }]);
      }
    }
    return combinations.sort((a, b) => {
      const aAll = a.length === regularRooms.length + 1;
      const bAll = b.length === regularRooms.length + 1;
      if (aAll && !bAll) return -1;
      if (!aAll && bAll) return 1;
      return a.reduce((s, r) => s + r.pricePerNight, 0) - b.reduce((s, r) => s + r.pricePerNight, 0);
    });
  }

  if (totalGuests >= 11) {
    for (const hall of hallRooms) {
      if (hall.max_guests >= totalGuests) {
        combinations.push([{
          roomId: hall.id, roomName: hall.name,
          guests: totalGuests,
          pricePerNight: getRoomPrice(hall, totalGuests),
          maxGuests: hall.max_guests,
        }]);
      }
    }
    addMultiRoomCombinations(regularRooms, totalGuests, combinations, seen);
    return combinations.sort((a, b) => {
      const aIsHall = a.length === 1 && (availableRooms.find(r => r.id === a[0].roomId)?.is_hall || availableRooms.find(r => r.id === a[0].roomId)?.room_type === 'hall');
      const bIsHall = b.length === 1 && (availableRooms.find(r => r.id === b[0].roomId)?.is_hall || availableRooms.find(r => r.id === b[0].roomId)?.room_type === 'hall');
      if (aIsHall && !bIsHall) return -1;
      if (!aIsHall && bIsHall) return 1;
      return a.reduce((s, r) => s + r.pricePerNight, 0) - b.reduce((s, r) => s + r.pricePerNight, 0);
    }).slice(0, 6);
  }

  for (const room of regularRooms) {
    if (room.max_guests >= totalGuests) {
      combinations.push([{
        roomId: room.id, roomName: room.name,
        guests: totalGuests,
        pricePerNight: getRoomPrice(room, totalGuests),
        maxGuests: room.max_guests,
      }]);
    }
  }

  if (totalGuests < 4) {
    return combinations.sort((a, b) =>
      a.reduce((s, r) => s + r.pricePerNight, 0) - b.reduce((s, r) => s + r.pricePerNight, 0)
    );
  }

  addMultiRoomCombinations(regularRooms, totalGuests, combinations, seen);

  return combinations.sort((a, b) =>
    a.reduce((s, r) => s + r.pricePerNight, 0) - b.reduce((s, r) => s + r.pricePerNight, 0)
  ).slice(0, 6);
}

function addMultiRoomCombinations(
  availableRooms: Room[],
  totalGuests: number,
  combinations: RoomAllocation[][],
  seen: Set<string>
) {
  for (let i = 0; i < availableRooms.length; i++) {
    for (let j = i; j < availableRooms.length; j++) {
      const room1 = availableRooms[i];
      const room2 = availableRooms[j];
      if (i === j && availableRooms.filter(r => r.id === room1.id).length < 2) continue;

      for (let g1 = 2; g1 <= Math.min(room1.max_guests, totalGuests - 2); g1++) {
        const g2 = totalGuests - g1;
        if (g2 >= 2 && g2 <= room2.max_guests) {
          const combo = [
            { roomId: room1.id, roomName: room1.name, guests: g1, pricePerNight: getRoomPrice(room1, g1), maxGuests: room1.max_guests },
            { roomId: room2.id, roomName: room2.name, guests: g2, pricePerNight: getRoomPrice(room2, g2), maxGuests: room2.max_guests },
          ];
          const key = combo.map(r => `${r.roomId}-${r.guests}`).sort().join('|');
          if (!seen.has(key)) { seen.add(key); combinations.push(combo); }
        }
      }
    }
  }

  if (availableRooms.length >= 3 && totalGuests >= 6) {
    for (let i = 0; i < availableRooms.length; i++) {
      for (let j = i; j < availableRooms.length; j++) {
        for (let k = j; k < availableRooms.length; k++) {
          const room1 = availableRooms[i];
          const room2 = availableRooms[j];
          const room3 = availableRooms[k];
          const base = Math.floor(totalGuests / 3);
          const rem  = totalGuests % 3;
          const g1 = base + (0 < rem ? 1 : 0);
          const g2 = base + (1 < rem ? 1 : 0);
          const g3 = base;
          if (g1 >= 2 && g1 <= room1.max_guests &&
              g2 >= 2 && g2 <= room2.max_guests &&
              g3 >= 2 && g3 <= room3.max_guests) {
            const combo = [
              { roomId: room1.id, roomName: room1.name, guests: g1, pricePerNight: getRoomPrice(room1, g1), maxGuests: room1.max_guests },
              { roomId: room2.id, roomName: room2.name, guests: g2, pricePerNight: getRoomPrice(room2, g2), maxGuests: room2.max_guests },
              { roomId: room3.id, roomName: room3.name, guests: g3, pricePerNight: getRoomPrice(room3, g3), maxGuests: room3.max_guests },
            ];
            const key = combo.map(r => `${r.roomId}-${r.guests}`).sort().join('|');
            if (!seen.has(key)) { seen.add(key); combinations.push(combo); }
          }
        }
      }
    }
  }
}

/* ─────────────────────────── ROOM OPTION COMPONENT ─────────────────────────── */

const RoomOption = memo(({
  room, isSelected, onSelect, guestCount,
}: {
  room: Room; isSelected: boolean; onSelect: (room: Room) => void; guestCount: number;
}) => {
  const handleClick = useCallback(() => onSelect(room), [room, onSelect]);
  const price = getRoomPrice(room, guestCount);
  return (
    <div onClick={handleClick} className={`room-option reveal ${isSelected ? "selected" : ""}`}>
      {room.images && room.images.length > 0 && (
        <div className="room-thumbnail">
          <Image src={room.images[0]} alt={room.name} width={120} height={80}
            style={{ objectFit: "cover", borderRadius: "8px" }} />
          {room.images.length > 1 && <span className="image-count-badge">+{room.images.length - 1}</span>}
        </div>
      )}
      <div className="room-info">
        <h3>{room.name}</h3>
        {room.description && <p className="room-desc">{room.description.slice(0, 60)}...</p>}
        <div className="room-details"><span>Max {room.max_guests} Guests</span></div>
        {room.amenities && room.amenities.length > 0 && (
          <div className="amenities-mini">
            {room.amenities.slice(0, 3).map((a, i) => <span key={i} className="amenity-mini">✓ {a}</span>)}
          </div>
        )}
      </div>
      <div className="room-price">
        <span className="price">₹{price.toLocaleString()}</span>
        <span className="price-label">/ night</span>
      </div>
    </div>
  );
});
RoomOption.displayName = "RoomOption";

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */

export default function BookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<RoomAllocation[]>([]);
  const [roomSuggestions, setRoomSuggestions] = useState<RoomAllocation[][]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const checkoutInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    checkIn: "", checkOut: "", guests: 1,
  });

  const [errors, setErrors] = useState({
    name: "", email: "", phone: "",
    checkIn: "", checkOut: "", guests: "",
  });

  const today    = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrow = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.setProperty("--revealed", "1");
            entry.target.classList.add("in-view");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observerRef.current?.observe(el));
  }, []);

  useEffect(() => {
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;
    raf = requestAnimationFrame(() => { timeout = setTimeout(setupObserver, 50); });
    return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
  }, [availableRooms, roomSuggestions, setupObserver]);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("rooms")
      .select("id, name, base_price, max_guests, extra_guest_price, pricing_tiers, description, images, amenities, is_hall, room_type")
      .then(({ data }) => { if (data && mounted) setRooms(data); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadBlockedDates = async () => {
      try {
        const [bookingsResult, blockedResult] = await Promise.all([
          supabase.from("bookings").select("check_in, check_out").eq("status", "confirmed"),
          supabase.from("blocked_dates").select("date"),
        ]);
        if (!mounted) return;
        const dates = new Set<string>();
        if (bookingsResult.data) getBlockedDates(bookingsResult.data).forEach(d => dates.add(d));
        if (blockedResult.data) blockedResult.data.forEach(d => dates.add(d.date));
        setBlockedDates(Array.from(dates));
      } catch (error) { console.error("Error loading blocked dates:", error); }
    };
    loadBlockedDates();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, []);

  const nights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    return Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000);
  }, [form.checkIn, form.checkOut]);

  const totalAmount = useMemo(() => {
    return selectedRooms.reduce((sum, r) => sum + (r.pricePerNight * nights), 0);
  }, [selectedRooms, nights]);

  const validateName     = (v: string) => !v.trim() ? "Full name is required" : v.trim().length < 2 ? "Name must be at least 2 characters" : !/^[a-zA-Z\s]+$/.test(v) ? "Name should only contain letters and spaces" : "";
  const validateEmail    = (v: string) => !v.trim() ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Please enter a valid email address" : "";
  const validatePhone    = (v: string) => { const n = v.replace(/\D/g, ""); return !v.trim() ? "Phone number is required" : n.length !== 10 ? "Phone number must be exactly 10 digits" : !/^[6-9]/.test(n) ? "Phone number must start with 6, 7, 8, or 9" : ""; };
  const validateCheckIn  = (v: string) => !v ? "Check-in date is required" : v < today ? "Check-in date cannot be in the past" : blockedDates.includes(v) ? "This date is not available" : "";
  const validateCheckOut = (v: string, ci: string) => !v ? "Check-out date is required" : !ci ? "Please select check-in date first" : v <= ci ? "Check-out must be after check-in date" : "";
  const validateGuests   = (v: number) => (!v || v < 1) ? "At least 1 guest is required" : v > 50 ? "Maximum 50 guests allowed" : "";

  const validateForm = (): boolean => {
    const newErrors = {
      name:     validateName(form.name),
      email:    validateEmail(form.email),
      phone:    validatePhone(form.phone),
      checkIn:  validateCheckIn(form.checkIn),
      checkOut: validateCheckOut(form.checkOut, form.checkIn),
      guests:   validateGuests(form.guests),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(e => e !== "");
  };

  const checkAvailability = useCallback(async () => {
    if (!validateForm()) { setMessage("Please fix the errors before checking availability"); return; }
    setMessage(""); setAvailableRooms([]); setSelectedRooms([]); setRoomSuggestions([]); setLoading(true);
    try {
      const { data: bookings } = await supabase
        .from("bookings").select("room_id")
        .eq("status", "confirmed")
        .lt("check_in", form.checkOut)
        .gt("check_out", form.checkIn);

      const bookedIds  = bookings?.map(b => b.room_id) || [];
      const freeRooms  = rooms.filter(r => !bookedIds.includes(r.id));

      if (freeRooms.length === 0) {
        setMessage("No rooms available for selected dates.");
        return;
      }

      const { data: overrideData } = await supabase
        .from("room_rate_overrides")
        .select("room_id, price")
        .in("room_id", freeRooms.map(r => r.id))
        .gte("date", form.checkIn)
        .lt("date", form.checkOut);

      const overrideSums: Record<string, { sum: number; count: number }> = {};
      (overrideData || []).forEach(o => {
        if (!overrideSums[o.room_id]) overrideSums[o.room_id] = { sum: 0, count: 0 };
        overrideSums[o.room_id].sum   += o.price;
        overrideSums[o.room_id].count += 1;
      });

      const freeRoomsWithRates = freeRooms.map(r => {
        const entry = overrideSums[r.id];
        if (!entry) return r;
        return { ...r, effectiveBasePrice: Math.round(entry.sum / entry.count) };
      });

      setAvailableRooms(freeRoomsWithRates);

      const suggestions = suggestRoomCombinations(freeRoomsWithRates, form.guests);
      setRoomSuggestions(suggestions);

      if (suggestions.length === 0) {
        setMessage(`Sorry, we cannot accommodate ${form.guests} guests with available rooms.`);
      } else {
        setMessage(`${suggestions.length} option${suggestions.length > 1 ? 's' : ''} available for ${form.guests} guest${form.guests > 1 ? 's' : ''}!`);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setMessage("Error checking availability. Please try again.");
    } finally { setLoading(false); }
  }, [form, blockedDates, rooms, validateForm]);

  const handleSelectRooms = useCallback((combo: RoomAllocation[]) => {
    setSelectedRooms(combo);
    if (!validateForm()) { alert("Please fill all required fields correctly"); return; }
    if (!user) { setShowLoginPrompt(true); return; }
    startMultiRoomPayment(combo);
  }, [form, user]);

  const startMultiRoomPayment = useCallback(async (roomAllocations: RoomAllocation[]) => {
    const totalAmount = roomAllocations.reduce((sum, r) => sum + (r.pricePerNight * nights), 0);
    const bookingGroupId = crypto.randomUUID();

    try {
      const bookingPromises = roomAllocations.map(allocation =>
        supabase.from("bookings").insert({
          user_id:          user!.id,
          room_id:          allocation.roomId,
          customer_name:    form.name.trim(),
          email:            form.email.trim(),
          phone:            form.phone.replace(/\D/g, ""),
          check_in:         form.checkIn,
          check_out:        form.checkOut,
          guests:           allocation.guests,
          total_amount:     allocation.pricePerNight * nights,
          advance_amount:   allocation.pricePerNight * nights,
          status:           "pending",
          payment_status:   "pending",
          is_multi_room:    roomAllocations.length > 1,
          booking_group_id: bookingGroupId,
          room_ids:         roomAllocations.map(r => r.roomId),
          rooms_count:      roomAllocations.length,
        }).select().single()
      );

      const bookingResults = await Promise.all(bookingPromises);
      const bookingIds = bookingResults.map(b => b.data!.id);

      const res   = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });
      const order = await res.json();

      const options = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      order.amount,
        currency:    "INR",
        name:        "Sukhakarta Holiday Home",
        description: `Booking ${roomAllocations.length} room${roomAllocations.length > 1 ? 's' : ''} - ${nights} night${nights > 1 ? 's' : ''}`,
        order_id:    order.id,
        notes: {
          booking_ids:      bookingIds.join(','),
          booking_group_id: bookingGroupId,
          room_count:       roomAllocations.length,
        },
        handler: async function (response: any) {
          // ── SECURITY: never let the browser mark its own booking as
          // "confirmed"/"completed" directly — that update was reachable
          // by anyone with the public anon key, with or without a real
          // payment. Ask the server to verify the Razorpay HMAC signature
          // first, and only the server (service role) flips the booking.
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                booking_ids:         bookingIds,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              console.error("Payment verification failed:", verifyData);
              alert(
                "We couldn't confirm your payment automatically. If money was deducted, " +
                "please contact us with your payment ID and we'll verify it manually: " +
                response.razorpay_payment_id
              );
              return;
            }
          } catch (err) {
            console.error("Payment verification request failed:", err);
            alert(
              "We couldn't confirm your payment automatically. If money was deducted, " +
              "please contact us with your payment ID and we'll verify it manually: " +
              response.razorpay_payment_id
            );
            return;
          }
          // Notification emails are now triggered server-side by
          // /api/verify-payment immediately after it confirms the booking
          // (using authoritative DB data + the internal secret, which the
          // browser must never hold) — no client-side call needed here.
          setShowSuccess(true);
          setTimeout(() => router.push("/user/dashboard"), 3000);
        },
        prefill: { name: form.name, email: form.email, contact: form.phone.replace(/\D/g, "") },
        theme:   { color: "#f97316" },
      };

      new window.Razorpay(options).open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  }, [form, user, nights, router]);

  const handleNameChange     = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const v = e.target.value; setForm(p => ({ ...p, name: v })); setErrors(p => ({ ...p, name: validateName(v) })); }, []);
  const handleEmailChange    = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const v = e.target.value; setForm(p => ({ ...p, email: v })); setErrors(p => ({ ...p, email: validateEmail(v) })); }, []);
  const handlePhoneChange    = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); setForm(p => ({ ...p, phone: v })); setErrors(p => ({ ...p, phone: validatePhone(v) })); }, []);

  const handleCheckInChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm(p => ({ ...p, checkIn: v }));
    setErrors(p => ({ ...p, checkIn: validateCheckIn(v), checkOut: validateCheckOut(p.checkOut, v) }));
    setAvailableRooms([]); setSelectedRooms([]); setRoomSuggestions([]);
    if (v) setTimeout(() => { checkoutInputRef.current?.focus(); checkoutInputRef.current?.showPicker?.(); }, 150);
  }, [form.checkOut, blockedDates, today]);

  const handleCheckOutChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const v = e.target.value;
  setForm(p => {
    const updated = { ...p, checkOut: v };
    setErrors(prev => ({ ...prev, checkOut: validateCheckOut(v, updated.checkIn) }));
    return updated;
  });
  setAvailableRooms([]);
  setSelectedRooms([]);
  setRoomSuggestions([]);
  }, []);
  const handleGuestsChange   = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const v = Number(e.target.value); setForm(p => ({ ...p, guests: v })); setErrors(p => ({ ...p, guests: validateGuests(v) })); setAvailableRooms([]); setSelectedRooms([]); setRoomSuggestions([]); }, []);

  return (
    <div className="booking-page">
      <div className="bg-mesh" aria-hidden="true">
        <div className="mesh-layer-1" />
        <div className="mesh-layer-2" />
        <div className="grid-overlay" />
      </div>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">✦ Reserve Your Stay ✦</div>
          <h1 className="hero-title">Book Your Stay</h1>
          <p className="hero-subtitle">Create unforgettable memories at Sukhakarta Holiday Home</p>
          {!user && (
            <div className="login-notice reveal">
              <p>
                Already have an account?{" "}
                <a href="/user/login">Login</a> or{" "}
                <a href="/user/register">Register</a>
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="container">

        {/* ── TRUST BAR ── */}
        <div className="trust-bar reveal" style={{ "--delay": "0ms" } as React.CSSProperties}>
          <div className="trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>SSL Secured</span>
          </div>
          <div className="trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span>UPI · Cards · Wallets</span>
          </div>
          <div className="trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <a href="https://wa.me/918087541496" target="_blank" rel="noopener noreferrer">WhatsApp Support 24/7</a>
          </div>
          <div className="trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <span>Instant Confirmation</span>
          </div>
        </div>

        <div className="booking-grid">

          {/* ── Form ── */}
          <div className="form-section reveal">
            <h2>Reservation Details</h2>
            <p className="form-subtitle">All fields are mandatory</p>

            <div className="form-group">
              <label>Full Name *</label>
              <input className={`input ${errors.name ? "error" : ""}`} placeholder="Your full name"
                value={form.name} onChange={handleNameChange}
                onBlur={() => setErrors(p => ({ ...p, name: validateName(form.name) }))} />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input className={`input ${errors.email ? "error" : ""}`} type="email"
                  placeholder="Enter Your Email" value={form.email} onChange={handleEmailChange}
                  onBlur={() => setErrors(p => ({ ...p, email: validateEmail(form.email) }))} />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input className={`input ${errors.phone ? "error" : ""}`} type="tel"
                  placeholder="Your 10-digit number" value={form.phone}
                  onChange={handlePhoneChange} maxLength={10}
                  onBlur={() => setErrors(p => ({ ...p, phone: validatePhone(form.phone) }))} />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Check-in Date *</label>
                <input type="date" className={`input ${errors.checkIn ? "error" : ""}`}
                  value={form.checkIn} onChange={handleCheckInChange} min={today} />
                {errors.checkIn && <span className="error-text">{errors.checkIn}</span>}
              </div>
              <div className="form-group">
                <label>Check-out Date *</label>
                <input ref={checkoutInputRef} type="date"
                  className={`input ${errors.checkOut ? "error" : ""}`}
                  value={form.checkOut} onChange={handleCheckOutChange}
                  min={form.checkIn || tomorrow} disabled={!form.checkIn} />
                {errors.checkOut && <span className="error-text">{errors.checkOut}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Number of Guests *</label>
              <input type="number" min={1} max={50}
                className={`input ${errors.guests ? "error" : ""}`}
                value={form.guests} onChange={handleGuestsChange} />
              {errors.guests && <span className="error-text">{errors.guests}</span>}
            </div>

            {form.guests > 0 && rooms.length > 0 && (
              <div className="price-preview-section">
                <p className="price-preview-label">Estimated starting price</p>
                <div className="price-preview-range">
                  {(() => {
                    const regularRooms = rooms.filter(r => !r.is_hall && r.room_type !== 'hall');
                    if (!regularRooms.length) return null;
                    const minPrice = Math.min(...regularRooms.map(r => getRoomPrice(r, form.guests)));
                    return (
                      <span className="price-from">
                        From <strong>₹{minPrice.toLocaleString()}</strong>/night
                        {form.checkIn && form.checkOut && nights > 0 && (
                          <span className="price-nights"> · ₹{(minPrice * nights).toLocaleString()} for {nights} night{nights > 1 ? 's' : ''}</span>
                        )}
                      </span>
                    );
                  })()}
                </div>
              </div>
)}

            {/* ── CANCELLATION HINT ── */}
            <div className="cancel-hint">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Free cancellation 7+ days before check-in · 50% refund 3–6 days · See{" "}
              <a href="/cancellation-policy" target="_blank" rel="noopener noreferrer">cancellation policy</a>
            </div>

            <button onClick={checkAvailability} disabled={loading} className="check-btn">
              {loading ? <span className="loader">Checking Availability...</span> : "Check Availability"}
            </button>

            {message && (
              <div className={`message ${roomSuggestions.length > 0 ? "success" : "error-msg"}`}>
                {message}
              </div>
            )}
          </div>

          {/* ── Options panel ── */}
          <div className="summary-section reveal" style={{ "--delay": "120ms" } as React.CSSProperties}>
            <h2>Available Options</h2>

            {roomSuggestions.length === 0 && !message && (
              <div className="empty-state">
                <p>Fill in the details and click "Check Availability" to see available rooms</p>
              </div>
            )}

            {roomSuggestions.length > 0 && (
              <div className="suggestions-list">
                {roomSuggestions.map((combo, idx) => {
                  const totalPrice    = combo.reduce((sum, r) => sum + r.pricePerNight, 0);
                  const totalForStay  = totalPrice * nights;
                  const isSelected    = selectedRooms.length > 0 &&
                    selectedRooms.every(sr => combo.some(c => c.roomId === sr.roomId && c.guests === sr.guests));

                  const regularRoomCount = rooms.filter(r => !r.is_hall && r.room_type !== 'hall').length;
                  const hasHall = combo.some(allocation => {
                    const room = rooms.find(r => r.id === allocation.roomId);
                    return room?.is_hall || room?.room_type === 'hall';
                  });
                  const isAllRoomsPlusHall = combo.length === regularRoomCount + 1 && hasHall;

                  return (
                    <div key={idx} className={`combo-card ${isSelected ? "selected" : ""}`}>
                      <div className="combo-header">
                        <div className="combo-title-row">
                          <strong>Option {idx + 1}</strong>
                          {isAllRoomsPlusHall && <span className="combo-badge-special">Complete Floor</span>}
                          {!isAllRoomsPlusHall && combo.length > 1 && (
                            <span className="combo-badge">{combo.length} Rooms</span>
                          )}
                        </div>
                        <div className="combo-price-col">
                          <span className="combo-price-total">₹{totalForStay.toLocaleString()}</span>
                          <span className="combo-price-label">for {nights} night{nights > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="combo-breakdown">
                        {combo.map((allocation, i) => {
                          const room      = rooms.find(r => r.id === allocation.roomId);
                          const isHall    = room?.is_hall || room?.room_type === 'hall';
                          const roomImage = room?.images?.[0] || '/placeholder-room.jpg';
                          const availRoom = availableRooms.find(r => r.id === allocation.roomId);
                          const hasOverride = availRoom?.effectiveBasePrice !== undefined;

                          return (
                            <div key={i} className="allocation-row">
                              <div className="allocation-room-preview">
                                <div className="allocation-img-wrap">
                                  <div className="allocation-img-bg"
                                    style={{ backgroundImage: `url(${roomImage})` }} aria-hidden="true" />
                                  <Image src={roomImage} alt={allocation.roomName} fill
                                    sizes="100px" style={{ objectFit: 'contain', zIndex: 1 }} />
                                </div>
                                <div className="allocation-info">
                                  <span className="allocation-name">
                                    {allocation.roomName}
                                    {isHall    && <span className="hall-badge">Hall</span>}
                                    {hasOverride && <span className="override-badge">Special Rate</span>}
                                  </span>
                                  <span className="allocation-guests">
                                    {allocation.guests} guest{allocation.guests > 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                              <span className="allocation-price">
                                ₹{allocation.pricePerNight.toLocaleString()}/night
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {isAllRoomsPlusHall && (
                        <div className="combo-highlight">
                          Entire Floor booked for your exclusive use
                        </div>
                      )}

                      <button className="select-combo-btn" onClick={() => handleSelectRooms(combo)}>
                        Select & Pay ₹{totalForStay.toLocaleString()}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="modal" onClick={() => setShowLoginPrompt(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Login Required</h3>
            <p>Please login or create an account to complete your booking</p>
            <div className="modal-actions">
              <button onClick={() => router.push("/user/login")}     className="action-btn primary">Login</button>
              <button onClick={() => router.push("/user/register")}  className="action-btn secondary">Register</button>
              <button onClick={() => setShowLoginPrompt(false)}      className="action-btn tertiary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSuccess && (
        <div className="modal">
          <div className="modal-content">
            <div className="success-icon">✓</div>
            <h3>Booking Confirmed!</h3>
            <p>Thank you for choosing Sukhakarta Holiday Home</p>
            {selectedRooms.length > 1 && (
              <p className="modal-subtext">You've booked {selectedRooms.length} rooms for your stay</p>
            )}
            <p className="modal-subtext">Redirecting to your dashboard...</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .booking-page { min-height: 100vh; color: #f8fafc; font-family: var(--font-outfit), system-ui, sans-serif; position: relative; background: #04070f; overflow-x: hidden; }

        .bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; contain: strict; }
        .mesh-layer-1 { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 100% 0%, rgba(249,115,22,0.18) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 0% 100%, rgba(14,165,233,0.15) 0%, transparent 60%), linear-gradient(160deg, #04070f 0%, #0b1220 50%, #04070f 100%); }
        .mesh-layer-2 { position: absolute; inset: 0; background: radial-gradient(ellipse 40% 40% at 50% 50%, rgba(249,115,22,0.05) 0%, transparent 70%); animation: mesh-pulse 8s ease-in-out infinite alternate; will-change: opacity; }
        @keyframes mesh-pulse { from { opacity: 0.4; } to { opacity: 1; } }
        .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px); background-size: 60px 60px; }

        .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1) var(--delay,0ms), transform 0.65s cubic-bezier(0.22,1,0.36,1) var(--delay,0ms); will-change: opacity, transform; contain: layout style; }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; contain: none; } .mesh-layer-2 { animation: none; } }

        .hero { position: relative; z-index: 1; padding: 9rem 1.5rem 4rem; text-align: center; }
        .hero-badge { display: inline-block; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.25em; text-transform: uppercase; color: #f97316; padding: 0.5rem 1.25rem; border: 1px solid rgba(249,115,22,0.4); border-radius: 100px; margin-bottom: 2rem; background: rgba(249,115,22,0.08); animation: fadeInDown 0.7s ease-out both; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        .hero-title { font-family: var(--font-cormorant), Georgia, serif; font-size: clamp(2.8rem, 7vw, 5rem); font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 1.25rem; background: linear-gradient(140deg, #fff 0%, #f4d5b8 50%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: fadeInUp 0.8s ease-out 0.15s both; }
        .hero-subtitle { font-size: clamp(1rem, 2.5vw, 1.4rem); color: rgba(240,244,248,0.8); margin: 0 0 2rem; font-weight: 300; animation: fadeInUp 0.8s ease-out 0.3s both; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }

        .login-notice { margin-top: 1.5rem; padding: 1rem; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; display: inline-block; }
        .login-notice p { margin: 0; font-size: 1rem; }
        .login-notice a { color: #60a5fa; text-decoration: none; font-weight: 600; }
        .login-notice a:hover { color: #93c5fd; }

        .container { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem 5rem; position: relative; z-index: 1; }
        .booking-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; }

        /* ── TRUST BAR ── */
        .trust-bar {
          display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center;
          padding: 0.875rem 1.5rem; margin-bottom: 2rem;
          background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.2);
          border-radius: 12px; font-size: 0.82rem; color: #94a3b8;
        }
        .trust-item { display: inline-flex; align-items: center; gap: 0.4rem; }
        .trust-item svg { color: #22c55e; flex-shrink: 0; }
        .trust-item a { color: #22c55e; text-decoration: none; font-weight: 600; }
        .trust-item a:hover { text-decoration: underline; }
        .trust-item strong { color: #f8fafc; }

        .form-section, .summary-section { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(249,115,22,0.2); border-radius: 24px; padding: 2.5rem; }

        h2 { font-size: 2rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, #fff, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .form-subtitle { color: #94a3b8; margin-bottom: 2rem; font-size: 0.95rem; }

        .form-group { margin-bottom: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-weight: 500; font-size: 0.9rem; }

        .input { width: 100%; padding: 1rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(249,115,22,0.3); border-radius: 12px; color: #f8fafc; font-size: 1rem; transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease; font-family: var(--font-outfit), system-ui, sans-serif; }
        .input:focus { outline: none; border-color: #f97316; background: rgba(255,255,255,0.13); box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .input.error { border-color: #ef4444; background: rgba(239,68,68,0.08); }
        .input.error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .input::placeholder { color: #64748b; }
        .input:disabled { opacity: 0.5; cursor: not-allowed; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); cursor: pointer; }

        .error-text { display: block; color: #fca5a5; font-size: 0.85rem; margin-top: 0.5rem; }

        /* ── CANCELLATION HINT ── */
        .cancel-hint {
          display: flex; align-items: flex-start; gap: 0.4rem;
          font-size: 0.8rem; color: #64748b; padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.03); border-radius: 8px;
          line-height: 1.5; margin-bottom: 1.5rem;
        }
        .cancel-hint svg { color: #f97316; flex-shrink: 0; margin-top: 2px; }
        .cancel-hint a { color: #f97316; text-decoration: none; }
        .cancel-hint a:hover { text-decoration: underline; }

        .check-btn { width: 100%; padding: 1.2rem 2rem; background: linear-gradient(135deg, #f97316, #ea580c); border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease; box-shadow: 0 10px 30px rgba(249,115,22,0.4); will-change: transform; font-family: var(--font-outfit), system-ui, sans-serif; }
        .check-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(249,115,22,0.6); }
        .check-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .loader { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .message { margin-top: 1.5rem; padding: 1rem; border-radius: 12px; text-align: center; font-weight: 500; }
        .message.error-msg { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; }
        .message.success   { background: rgba(34,197,94,0.15);  border: 1px solid rgba(34,197,94,0.4);  color: #86efac; }

        .empty-state { text-align: center; padding: 4rem 2rem; color: #94a3b8; }

        .suggestions-list { display: flex; flex-direction: column; gap: 1rem; }

        .combo-card { background: rgba(255,255,255,0.04); border: 2px solid rgba(249,115,22,0.2); border-radius: 16px; padding: 1.25rem; transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.2s ease, box-shadow 0.3s ease; cursor: pointer; }
        .combo-card:hover { transform: translateY(-4px); border-color: rgba(249,115,22,0.5); box-shadow: 0 10px 30px rgba(249,115,22,0.2); }
        .combo-card.selected { border-color: #f97316; background: rgba(249,115,22,0.08); box-shadow: 0 12px 35px rgba(249,115,22,0.3); }

        .combo-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; gap: 1rem; }
        .combo-title-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .combo-title-row strong { color: #f8fafc; font-size: 1.1rem; }
        .combo-badge { padding: 0.25rem 0.75rem; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); border-radius: 100px; font-size: 0.75rem; color: #60a5fa; font-weight: 600; }
        .combo-badge-special { padding: 0.25rem 0.75rem; background: linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.2)); border: 1px solid rgba(249,115,22,0.5); border-radius: 100px; font-size: 0.75rem; color: #f97316; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
        .combo-price-col { text-align: right; flex-shrink: 0; }
        .combo-price-total { display: block; font-size: 1.75rem; font-weight: 700; color: #f97316; line-height: 1; }
        .combo-price-label { display: block; font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }

        .combo-breakdown { background: rgba(0,0,0,0.2); border-radius: 10px; padding: 0.875rem; margin-bottom: 1rem; }
        .allocation-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .allocation-row:last-child { border-bottom: none; }
        .allocation-room-preview { display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 0; }
        .allocation-img-wrap { position: relative; width: 80px; height: 60px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #04070f; border: 1px solid rgba(249,115,22,0.2); }
        .allocation-img-bg { position: absolute; inset: 0; z-index: 0; background-size: cover; background-position: center; filter: blur(8px) brightness(0.4) saturate(0.7); transform: scale(1.1); }
        .allocation-info { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; min-width: 0; }
        .allocation-name { color: #f8fafc; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
        .allocation-guests { color: #94a3b8; font-size: 0.8rem; }
        .allocation-price { color: #f97316; font-weight: 600; font-size: 0.9rem; flex-shrink: 0; }

        .hall-badge { display: inline-block; padding: 0.15rem 0.5rem; background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-size: 0.65rem; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .override-badge { display: inline-block; padding: 0.15rem 0.5rem; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.35); color: #22c55e; font-size: 0.65rem; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; }

        .combo-highlight { background: linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.1)); border: 1px solid rgba(249,115,22,0.3); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; text-align: center; color: #f97316; font-size: 0.85rem; font-weight: 600; }

        .select-combo-btn { width: 100%; padding: 1rem 1.5rem; background: linear-gradient(135deg, #f97316, #ea580c); border: none; border-radius: 10px; color: white; font-size: 1rem; font-weight: 700; cursor: pointer; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease; font-family: inherit; box-shadow: 0 6px 20px rgba(249,115,22,0.35); }
        .select-combo-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(249,115,22,0.5); }

        .modal { position: fixed; inset: 0; background: rgba(15,23,42,0.95); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-content { background: linear-gradient(135deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98)); backdrop-filter: blur(20px); border: 2px solid rgba(249,115,22,0.3); border-radius: 24px; padding: 3rem; text-align: center; max-width: 500px; width: 100%; animation: scaleIn 0.4s cubic-bezier(0.22,1,0.36,1); }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        .success-icon { width: 80px; height: 80px; margin: 0 auto 1.5rem; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; animation: bounce 0.6s cubic-bezier(0.22,1,0.36,1); }
        @keyframes bounce { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .modal-content h3 { margin-bottom: 0.5rem; color: #22c55e; font-size: 2rem; }
        .modal-content p  { color: #cbd5e1; margin-bottom: 0.5rem; }
        .modal-subtext    { color: #94a3b8; font-size: 0.9rem; }

        .modal-actions { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
        .action-btn { padding: 1rem 2rem; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 1rem; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease; will-change: transform; font-family: var(--font-outfit), system-ui, sans-serif; }
        .action-btn:hover { transform: translateY(-2px); }
        .action-btn.primary   { background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; box-shadow: 0 8px 24px rgba(249,115,22,0.35); }
        .action-btn.primary:hover { box-shadow: 0 12px 32px rgba(249,115,22,0.5); }
        .action-btn.secondary { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
        .action-btn.tertiary  { background: transparent; color: #94a3b8; border: 1px solid rgba(148,163,184,0.3); }

        @media (max-width: 968px) { .booking-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .hero { padding: 6rem 1rem 3rem; }
          .container { padding: 0 1rem 4rem; }
          .form-section, .summary-section { padding: 1.5rem; }
          .combo-header { flex-direction: column; align-items: flex-start; }
          .combo-price-col { text-align: left; }
          .allocation-img-wrap { width: 70px; height: 52px; }
          .allocation-row { padding: 0.65rem 0; }
          .trust-bar { gap: 1rem; padding: 0.75rem 1rem; font-size: 0.78rem; }
        }
        @media (max-width: 480px) {
          .allocation-img-wrap { width: 60px; height: 45px; }
          .allocation-name { font-size: 0.85rem; }
          .allocation-guests { font-size: 0.75rem; }
          .allocation-price { font-size: 0.85rem; }
          .combo-breakdown { padding: 0.65rem; }
          .trust-bar { flex-direction: column; align-items: flex-start; gap: 0.65rem; }
        }
        .price-preview-section {
            padding: 1rem; background: rgba(249,115,22,0.06);
            border: 1px solid rgba(249,115,22,0.2); border-radius: 12px;
            margin-bottom: 1.25rem;
          }
          .price-preview-label { font-size: 0.78rem; color: #64748b; margin: 0 0 0.3rem; }
          .price-from { font-size: 1rem; color: #f8fafc; }
          .price-from strong { color: #f97316; font-size: 1.25rem; }
          .price-nights { font-size: 0.85rem; color: #94a3b8; }
      `}</style>
    </div>
  );
}
