import { NextResponse } from "next/server";

/**
 * Static iCal test – no database calls.
 * Add THIS URL to Booking.com first.
 * If it shows "Okay", your domain is reachable and the format is valid.
 * If it still shows "Activating", Booking.com cannot reach your server.
 *
 * URL: https://sukhakartaholidayhome.in/api/ical-test
 */
export async function GET() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dtstamp =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  // A future blocked date so Booking.com sees at least one event
  const futureStart = "20260601";
  const futureEnd   = "20260603";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sukhakarta Holiday Home//Test//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:test-event-static@sukhakartaholidayhome.in`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${futureStart}`,
    `DTEND;VALUE=DATE:${futureEnd}`,
    "SUMMARY:Not available",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const body = lines.join("\r\n") + "\r\n";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":                 "text/calendar; charset=utf-8",
      "Cache-Control":                "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Content-Type":                 "text/calendar; charset=utf-8",
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
