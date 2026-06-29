import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Validation helpers
function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}
function isRazorpayId(v: unknown, prefix: string): boolean {
  return isNonEmptyString(v) && v.startsWith(prefix) && v.length < 64;
}
function isHexString(v: unknown): v is string {
  return isNonEmptyString(v) && /^[0-9a-f]+$/i.test(v) && v.length === 64;
}
function isUuidArray(v: unknown): v is string[] {
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.length <= 10 && // sane upper bound — no real booking spans 10 rooms
    v.every((id) => typeof id === "string" && uuidRe.test(id))
  );
}

/* ── Server-side Supabase client using the service role key.            ──
   This is the ONLY place a booking should be flipped to                ──
   status: "confirmed" / payment_status: "completed". The browser must  ──
   never be trusted to make that call directly with the anon key —      ──
   doing so lets anyone fabricate a "paid" booking without ever paying. */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_ids } =
    body as Record<string, unknown>;

  // Validate all inputs before any crypto work
  if (!isRazorpayId(razorpay_order_id, "order_")) {
    return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 });
  }
  if (!isRazorpayId(razorpay_payment_id, "pay_")) {
    return NextResponse.json({ success: false, error: "Invalid payment ID" }, { status: 400 });
  }
  if (!isHexString(razorpay_signature)) {
    return NextResponse.json({ success: false, error: "Invalid signature format" }, { status: 400 });
  }
  if (!isUuidArray(booking_ids)) {
    return NextResponse.json({ success: false, error: "Invalid booking_ids" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error("[verify-payment] RAZORPAY_KEY_SECRET not configured");
    return NextResponse.json({ success: false, error: "Payment service unavailable" }, { status: 503 });
  }

  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedHex = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // timingSafeEqual requires same-length buffers — guaranteed here since both are 64-char hex
  const expectedBuf = Buffer.from(expectedHex, "hex");
  const receivedBuf = Buffer.from(razorpay_signature as string, "hex");

  const isValid = crypto.timingSafeEqual(expectedBuf, receivedBuf);

  if (!isValid) {
    // Log payment_id for fraud investigation — never log the signature itself
    console.warn("[verify-payment] Signature mismatch for payment:", razorpay_payment_id);
    return NextResponse.json({ success: false }, { status: 400 });
  }

  // ── Signature is valid → this payment_id genuinely belongs to this   ──
  // ── order_id per Razorpay's HMAC. Now (and only now) mark the        ──
  // ── matching pending bookings as confirmed, server-side.             ──
  if (!supabaseAdmin) {
    console.error("[verify-payment] Supabase service role not configured — cannot finalize booking");
    return NextResponse.json(
      { success: false, error: "Booking finalization unavailable" },
      { status: 503 }
    );
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "confirmed",
      payment_status: "completed",
      payment_id: razorpay_payment_id,
    })
    // Defense in depth: only ever transition bookings that are still
    // pending, and only the exact IDs the client believes it paid for.
    // The payment_status="pending" guard also makes this race-safe against
    // the async webhook: whichever of the two gets here first "claims" the
    // transition, and the other's update affects 0 rows — so notifications
    // never get sent twice for the same booking.
    // NOTE: for tighter binding, add a `razorpay_order_id` column to
    // `bookings` (set at create-order time) and also filter on it here —
    // see AUDIT_README "Recommended follow-ups".
    .eq("payment_status", "pending")
    .in("id", booking_ids as string[])
    .select(
      "id, customer_name, email, phone, check_in, check_out, guests, total_amount, booking_group_id, rooms(name)"
    );

  if (updateError) {
    console.error("[verify-payment] Failed to finalize booking:", updateError.message);
    return NextResponse.json({ success: false, error: "Failed to finalize booking" }, { status: 500 });
  }

  if (!updated || updated.length === 0) {
    // Signature was valid but nothing matched — likely already confirmed
    // by the webhook, or a booking_id/order_id mismatch. Don't treat as
    // fraud, but don't silently report success either.
    console.warn(
      "[verify-payment] No matching pending bookings for order:",
      razorpay_order_id
    );
    return NextResponse.json({ success: true, confirmed: [] });
  }

  // ── Trigger guest/admin notification emails server-to-server, using   ──
  // ── authoritative DB data (not whatever the browser claims) and the   ──
  // ── shared internal secret — never expose this secret to the browser. ──
  try {
    const first = updated[0] as any;
    const totalAmount = updated.reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);
    const roomNames = updated.map((b: any) => b.rooms?.name).filter(Boolean).join(", ");
    const nights = Math.max(
      1,
      Math.round((new Date(first.check_out).getTime() - new Date(first.check_in).getTime()) / 86_400_000)
    );

    const host = req.headers.get("host") || "";
    const proto = host.startsWith("localhost") ? "http" : "https";
    const origin = `${proto}://${host}`;
    await fetch(`${origin}/api/send-notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
      },
      body: JSON.stringify({
        booking_id:     first.booking_group_id || first.id,
        customer_name:  first.customer_name,
        customer_email: first.email,
        customer_phone: first.phone,
        room_name:      roomNames || "Room",
        check_in:       first.check_in,
        check_out:      first.check_out,
        guests:         first.guests,
        nights,
        total_amount:   totalAmount,
      }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch (err) {
    // Never fail the payment confirmation because an email had trouble —
    // the booking is already correctly confirmed at this point.
    console.error("[verify-payment] Notification dispatch failed (non-fatal):", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ success: true, confirmed: updated.map((b: any) => b.id) });
}
