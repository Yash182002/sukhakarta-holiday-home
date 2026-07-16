import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ─── Lazy client creation — never instantiate at module scope, or
   `next build` fails while collecting page data without env vars.
   Uses anon key as fallback so the route works even without service role ─── */
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("[ical] Missing Supabase configuration");
  }
  _supabase = createClient(supabaseUrl, supabaseKey);
  return _supabase;
}

/* ─── Shared CORS headers – Booking.com and Airbnb fetch from their servers ─── */
const ICAL_HEADERS = {
  "Content-Type":                "text/calendar; charset=utf-8",
  "Cache-Control":               "no-cache, no-store, must-revalidate",
  "Pragma":                      "no-cache",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ICAL_HEADERS });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await context.params;

  try {
    const supabase = getSupabase();

    /* ── 1. Room ── */
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("name")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      return new NextResponse("Room not found", { status: 404, headers: ICAL_HEADERS });
    }

    /* ── 2. Confirmed bookings (current + future) ── */
    const today = new Date().toISOString().split("T")[0];

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, check_in, check_out, created_at")
      .eq("room_id", roomId)
      .eq("status", "confirmed")
      .gte("check_out", today);

    if (bookingsError) {
      console.error("iCal booking fetch error:", bookingsError.message);
      return new NextResponse("Error fetching bookings", { status: 500, headers: ICAL_HEADERS });
    }

    /* ── 3. Manually blocked dates ── */
    const { data: blockedDates } = await supabase
      .from("room_blocked_dates")
      .select("id, blocked_date, reason")
      .eq("room_id", roomId)
      .gte("blocked_date", today);

    /* ── 4. Build iCal lines (RFC 5545) ── */
    const prodId = `-//Sukhakarta Holiday Home//EN`;

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      `PRODID:${prodId}`,
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    /* Confirmed bookings */
    for (const booking of bookings ?? []) {
      const uid      = `booking-${booking.id}@sukhakartaholidayhome.in`;
      const dtstart  = iCalDate(booking.check_in);
      const dtend    = iCalDate(booking.check_out);
      const dtstamp  = iCalDateTime(booking.created_at);

      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${dtstart}`,
        `DTEND;VALUE=DATE:${dtend}`,
        "SUMMARY:Not available",
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT",
      );
    }

    /* Manually blocked dates */
    for (const bd of blockedDates ?? []) {
      const uid      = `blocked-${bd.id}@sukhakartaholidayhome.in`;
      const dtstart  = iCalDate(bd.blocked_date);
      // All-day block: DTEND = following day
      const dtend    = iCalDate(addOneDay(bd.blocked_date));
      const dtstamp  = iCalDateTime(new Date().toISOString());
      const summary  = escapeText(bd.reason || "Blocked");

      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${dtstart}`,
        `DTEND;VALUE=DATE:${dtend}`,
        `SUMMARY:${summary}`,
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT",
      );
    }

    const hasEvents = (bookings?.length ?? 0) > 0 || (blockedDates?.length ?? 0) > 0;

if (!hasEvents) {
  const uid = `placeholder-${roomId}@sukhakarta.in`;
  const dtstamp = iCalDateTime(new Date().toISOString());
  lines.push(
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    "DTSTART;VALUE=DATE:20991231",
    "DTEND;VALUE=DATE:20991231",
    "SUMMARY:Available",
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  );
}

lines.push("END:VCALENDAR");

    /* ── 5. Fold lines and join with CRLF (RFC 5545 §3.1) ── */
    const body = lines.map(foldLine).join("\r\n") + "\r\n";

    return new NextResponse(body, { status: 200, headers: ICAL_HEADERS });

  } catch (error) {
    console.error("iCal generation error:", error);
    return new NextResponse("Internal server error", {
      status: 500,
      headers: ICAL_HEADERS,
    });
  }
}

/* ─── Helpers ─────────────────────────────────────────────────── */

/** RFC 5545 line folding: split at 75 octets, continue with CRLF + SP */
function foldLine(line: string): string {
  if (line.length <= 75) return line;

  const chunks: string[] = [];
  chunks.push(line.slice(0, 75));

  let pos = 75;
  while (pos < line.length) {
    chunks.push(" " + line.slice(pos, pos + 74));
    pos += 74;
  }

  return chunks.join("\r\n");
}

/** Escape commas, semicolons, backslashes and newlines per RFC 5545 */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** "YYYY-MM-DD" → "YYYYMMDD" — parsed as local date to avoid UTC shift */
function iCalDate(dateString: string): string {
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
}

/** ISO datetime → iCal DTSTAMP in UTC ("YYYYMMDDTHHmmssZ") */
function iCalDateTime(iso: string): string {
  const d   = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Add one calendar day to a "YYYY-MM-DD" string */
function addOneDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split("T")[0];
}
