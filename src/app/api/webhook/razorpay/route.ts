import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Module-level client is safe here — service role only, no user sessions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("[webhook] Missing Supabase configuration");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Body size guard — Razorpay webhooks are small; reject anything huge
const MAX_BODY_BYTES = 64 * 1024; // 64 KB

export async function POST(req: Request) {
  try {
    // Guard against payload flooding
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = await req.text();
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error("[webhook] RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // Constant-time comparison to prevent timing attacks
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSig, "hex");
    const receivedBuf = Buffer.from(signature, "hex");

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      console.warn("[webhook] Signature mismatch — possible spoofing attempt");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Idempotency: always respond 200 quickly, process async
    // (Razorpay retries on non-2xx; don't let DB slowness cause duplicates)
    const eventType: string = event?.event ?? "unknown";

    switch (eventType) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload?.payment?.entity, req);
        break;
      case "payment.failed":
        await handlePaymentFailed(event.payload?.payment?.entity);
        break;
      case "payment.authorized":
        // No action needed — we wait for "captured"
        break;
      default:
        // Unknown events are fine — don't error
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Never expose error details to the caller (Razorpay)
    console.error("[webhook] Unhandled error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handlePaymentCaptured(payment: any, req: Request) {
  if (!payment?.id) {
    console.error("[webhook] payment.captured missing payment entity");
    return;
  }

  // The checkout flow sends `booking_ids` (plural, comma-joined string) in
  // notes — NOT `booking_id`. This previously meant the webhook never
  // matched a real booking and silently did nothing every time.
  const rawIds: unknown = payment?.notes?.booking_ids ?? payment?.notes?.booking_id;
  const bookingIds =
    typeof rawIds === "string"
      ? rawIds.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  if (bookingIds.length === 0) {
    console.error("[webhook] payment.captured missing booking_ids in notes:", payment.id);
    return;
  }

  const { data: bookings, error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "confirmed",
      payment_id: payment.id,
      payment_status: "completed",
    })
    .in("id", bookingIds)
    .eq("payment_status", "pending")
    .select("id, customer_name, email, phone, check_in, check_out, guests, total_amount, rooms(name)");

  if (updateError) {
    console.error("[webhook] Failed to update booking:", bookingIds, updateError.message);
    throw updateError; // let outer catch log it
  }

  const booking = bookings?.[0];
  if (!booking) {
    // Already confirmed (e.g. by the synchronous /api/verify-payment call)
    // — not an error, just nothing left to do.
    return;
  }

  // Fire notifications best-effort — never throw
  try {
    const host = req.headers.get("host") || "";
    const proto = host.startsWith("localhost") ? "http" : "https";
    const origin = `${proto}://${host}`;

    await fetch(`${origin}/api/send-notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Internal secret so middleware allows this server→server call
        "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
      },
      body: JSON.stringify({
        booking_id:     booking.id,
        customer_name:  booking.customer_name,
        customer_email: booking.email,
        customer_phone: booking.phone,
        room_name:      (booking as any).rooms?.name ?? "Room",
        check_in:       booking.check_in,
        check_out:      booking.check_out,
        guests:         booking.guests,
        total_amount:   booking.total_amount,
      }),
      // Abort after 8s so the webhook doesn't hang
      signal: AbortSignal.timeout(8_000),
    });
  } catch (err) {
    console.error("[webhook] Notification dispatch failed (non-fatal):", err instanceof Error ? err.message : err);
  }
}

async function handlePaymentFailed(payment: any) {
  if (!payment?.id) return;

  const rawIds: unknown = payment?.notes?.booking_ids ?? payment?.notes?.booking_id;
  const bookingIds =
    typeof rawIds === "string"
      ? rawIds.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  if (bookingIds.length === 0) return;

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status: "cancelled", payment_status: "failed" })
    .in("id", bookingIds);

  if (error) {
    console.error("[webhook] Failed to cancel booking:", bookingIds, error.message);
  }
}
