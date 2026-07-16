import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy client creation — never throw at module scope, or `next build`
// fails while collecting page data when env vars aren't available.
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("[sync-calendar] Missing Supabase configuration");
  }
  _supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _supabase;
}

/* ── SSRF guard: only allow known calendar hostnames ── */
const ALLOWED_CALENDAR_HOSTS = new Set([
  "calendar.google.com",
  "www.airbnb.com",
  "www.booking.com",
  "ical.booking.com",
  "ics.agoda.com",
  "www.makemytrip.com",
  "calendar.yahoo.com",
  "outlook.live.com",
  "outlook.office365.com",
  "calendar.proton.me",
]);

function isAllowedCalendarUrl(urlString: string): boolean {
  try {
    const u = new URL(urlString);
    // Must be HTTPS
    if (u.protocol !== "https:") return false;
    // Must be a known host
    return ALLOWED_CALENDAR_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

/* ── Max size guard for calendar fetches ── */
const MAX_ICAL_BYTES = 512 * 1024; // 512 KB

/* ── iCal parser ── */
function parseICalData(raw: string) {
  const events: Array<{ type: string; start: Date; end: Date; summary: string; uid: string }> = [];
  const lines = raw.replace(/\r\n /g, "").split(/\r\n|\n|\r/);
  let cur: any = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") { cur = { type: "VEVENT" }; }
    else if (line === "END:VEVENT" && cur) {
      if (cur.start && cur.end && cur.uid) events.push(cur);
      cur = null;
    } else if (cur) {
      if (line.startsWith("DTSTART")) cur.start = parseICalDate(line.split(":")[1] ?? "");
      else if (line.startsWith("DTEND"))  cur.end   = parseICalDate(line.split(":")[1] ?? "");
      else if (line.startsWith("SUMMARY:")) cur.summary = line.substring(8).slice(0, 200); // cap length
      else if (line.startsWith("UID:"))     cur.uid     = line.substring(4).slice(0, 200);
    }
  }
  return events;
}

function parseICalDate(value: string): Date | null {
  if (!value) return null;
  if (value.length === 8) {
    return new Date(
      parseInt(value.slice(0, 4)),
      parseInt(value.slice(4, 6)) - 1,
      parseInt(value.slice(6, 8))
    );
  }
  if (value.endsWith("Z")) {
    return new Date(Date.UTC(
      parseInt(value.slice(0, 4)),
      parseInt(value.slice(4, 6)) - 1,
      parseInt(value.slice(6, 8)),
      parseInt(value.slice(9, 11)) || 0,
      parseInt(value.slice(11, 13)) || 0,
      parseInt(value.slice(13, 15)) || 0
    ));
  }
  return new Date(
    parseInt(value.slice(0, 4)),
    parseInt(value.slice(4, 6)) - 1,
    parseInt(value.slice(6, 8)),
    parseInt(value.slice(9, 11)) || 0,
    parseInt(value.slice(11, 13)) || 0,
    parseInt(value.slice(13, 15)) || 0
  );
}

/* ── POST: sync one calendar ── */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    let body: any;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { roomId, syncId } = body;
    if (!roomId || typeof roomId !== "string") return NextResponse.json({ error: "roomId required" }, { status: 400 });
    if (!syncId || typeof syncId !== "string") return NextResponse.json({ error: "syncId required" }, { status: 400 });

    const { data: syncConfig, error: syncError } = await supabase
      .from("external_calendar_sync")
      .select("*")
      .eq("id", syncId)
      .eq("room_id", roomId) // ensure syncId belongs to this roomId
      .single();

    if (syncError || !syncConfig) {
      return NextResponse.json({ error: "Calendar sync not found" }, { status: 404 });
    }
    if (!syncConfig.sync_enabled) {
      return NextResponse.json({ error: "Calendar sync is disabled" }, { status: 400 });
    }

    // SSRF guard
    if (!isAllowedCalendarUrl(syncConfig.calendar_url)) {
      console.error("[sync-calendar] Blocked disallowed calendar URL:", syncConfig.calendar_url);
      return NextResponse.json({ error: "Calendar URL not allowed" }, { status: 400 });
    }

    const startTime = Date.now();

    // Fetch with timeout + size limit
    const calResponse = await fetch(syncConfig.calendar_url, {
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": "Sukhakarta-CalSync/1.0" },
    });
    if (!calResponse.ok) {
      throw new Error(`Calendar fetch failed: ${calResponse.status}`);
    }

    // Read with size cap to prevent memory exhaustion
    const reader = calResponse.body?.getReader();
    if (!reader) throw new Error("No response body");
    let received = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value?.byteLength ?? 0;
      if (received > MAX_ICAL_BYTES) {
        reader.cancel();
        throw new Error("Calendar file too large");
      }
      if (value) chunks.push(value);
    }
    const icalData = new TextDecoder().decode(
      chunks.reduce((a, b) => { const c = new Uint8Array(a.length + b.length); c.set(a); c.set(b, a.length); return c; }, new Uint8Array(0))
    );

    const events = parseICalData(icalData);
    const now = new Date();
    let blockedCount = 0;
    const errors: string[] = [];

    // Batch upserts instead of one DB call per date
    const upsertRows: Array<{ room_id: string; blocked_date: string; reason: string; source: string; external_booking_id: string }> = [];

    for (const event of events) {
      if (event.type !== "VEVENT" || !event.start || !event.end) continue;
      const startDate = new Date(event.start);
      const endDate   = new Date(event.end);
      if (endDate <= now) continue; // skip past events

      // Guard against events spanning more than 2 years (DoS)
      const spanDays = (endDate.getTime() - startDate.getTime()) / 86_400_000;
      if (spanDays > 730) { errors.push(`Skipped event spanning ${spanDays} days: ${event.uid}`); continue; }

      let cur = new Date(startDate);
      while (cur < endDate) {
        upsertRows.push({
          room_id: roomId,
          blocked_date: cur.toISOString().split("T")[0],
          reason: event.summary || "External booking",
          source: syncConfig.platform,
          external_booking_id: event.uid,
        });
        blockedCount++;
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Batch in chunks of 500 to stay within Supabase limits
    const CHUNK = 500;
    for (let i = 0; i < upsertRows.length; i += CHUNK) {
      const { error } = await supabase
        .from("room_blocked_dates")
        .upsert(upsertRows.slice(i, i + CHUNK), { onConflict: "room_id,blocked_date" });
      if (error) errors.push(`Batch upsert error: ${error.message}`);
    }

    const syncDuration = Date.now() - startTime;
    const status = errors.length === 0 ? "success" : "partial";

    await Promise.all([
      supabase.from("external_calendar_sync").update({ last_sync_at: new Date().toISOString(), last_sync_status: status }).eq("id", syncId),
      supabase.from("calendar_sync_log").insert({ room_id: roomId, platform: syncConfig.platform, sync_type: "import", status, dates_blocked: blockedCount, error_message: errors.length > 0 ? errors.slice(0, 5).join("; ") : null, sync_duration_ms: syncDuration }),
    ]);

    return NextResponse.json({ success: true, datesBlocked: blockedCount, errors: errors.length > 0 ? errors.slice(0, 10) : undefined, syncDuration });
  } catch (error) {
    console.error("[sync-calendar] Error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to sync calendar" }, { status: 500 });
  }
}

/* ── GET: cron batch sync (protected by middleware x-cron-secret) ── */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: syncs, error } = await supabase
      .from("external_calendar_sync")
      .select("id, room_id, platform, last_sync_at, sync_frequency_minutes")
      .eq("sync_enabled", true);

    if (error) throw new Error("Failed to fetch syncs");

    const now = Date.now();
    const results = [];

    for (const sync of syncs ?? []) {
      const lastSync = sync.last_sync_at ? new Date(sync.last_sync_at).getTime() : 0;
      const minutesSince = (now - lastSync) / 60_000;

      if (minutesSince < (sync.sync_frequency_minutes ?? 60)) {
        results.push({ roomId: sync.room_id, platform: sync.platform, skipped: true });
        continue;
      }

      // Self-call uses the derived origin (not from req.url) + internal secret
      const host  = request.headers.get("host") || "";
      const proto = host.startsWith("localhost") ? "http" : "https";
      try {
        const res = await fetch(`${proto}://${host}/api/sync-calendar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cron-secret": process.env.CRON_SECRET || "",
          },
          body: JSON.stringify({ roomId: sync.room_id, syncId: sync.id }),
          signal: AbortSignal.timeout(30_000),
        });
        const result = await res.json();
        results.push({ roomId: sync.room_id, platform: sync.platform, success: res.ok, ...result });
      } catch (err) {
        results.push({ roomId: sync.room_id, platform: sync.platform, success: false, error: err instanceof Error ? err.message : "unknown" });
      }
    }

    return NextResponse.json({ success: true, syncedCount: results.filter(r => r.success).length, results });
  } catch (error) {
    console.error("[sync-calendar] Batch error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Batch sync failed" }, { status: 500 });
  }
}
