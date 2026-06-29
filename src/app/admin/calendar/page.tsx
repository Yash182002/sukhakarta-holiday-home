"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────── Types ─────────────────────────── */

type Room = {
  id: string;
  name: string;
  ical_export_url?: string;
  ical_export_enabled: boolean;
};

type BlockedDate = {
  id: string;
  room_id: string;
  blocked_date: string;
  reason: string;
  source: string;
  external_booking_id?: string;
};

type CalendarSync = {
  id: string;
  room_id: string;
  platform: string;
  calendar_url: string;
  sync_enabled: boolean;
  last_sync_at?: string;
  last_sync_status?: string;
  sync_frequency_minutes: number;
};

/* ─────────────────────────── SVG Icons ─────────────────────────── */

function IconToastSuccess() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconToastError() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconUnblock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg className="cm-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconBan() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="8 17 12 21 16 17" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

function IconSync() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

/* ─────────────────────────── Component ─────────────────────────── */

export default function RoomCalendarManager() {
  const [rooms, setRooms]               = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [calendarSyncs, setCalendarSyncs] = useState<CalendarSync[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [blockDate, setBlockDate]     = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [syncPlatform, setSyncPlatform] = useState("booking_com");
  const [syncUrl, setSyncUrl]         = useState("");

  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState({ type: "", text: "" });

  useEffect(() => { loadRooms(); }, []);

  useEffect(() => {
    if (selectedRoom) { loadBlockedDates(); loadCalendarSyncs(); }
  }, [selectedRoom, currentMonth]);

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const loadRooms = async () => {
    const { data } = await supabase.from("rooms")
      .select("id, name, ical_export_url, ical_export_enabled").order("name");
    if (data) { setRooms(data); if (data.length > 0 && !selectedRoom) setSelectedRoom(data[0].id); }
  };

  const loadBlockedDates = async () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate   = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const { data } = await supabase.from("room_blocked_dates").select("*")
      .eq("room_id", selectedRoom)
      .gte("blocked_date", startDate.toISOString().split("T")[0])
      .lte("blocked_date", endDate.toISOString().split("T")[0])
      .order("blocked_date");
    if (data) setBlockedDates(data);
  };

  const loadCalendarSyncs = async () => {
    const { data } = await supabase.from("external_calendar_sync").select("*").eq("room_id", selectedRoom);
    if (data) setCalendarSyncs(data);
  };

  const blockSingleDate = async () => {
    if (!blockDate) { setMessage({ type: "error", text: "Please select a date" }); return; }
    setLoading(true);
    const { error } = await supabase.from("room_blocked_dates").insert({
      room_id: selectedRoom, blocked_date: blockDate,
      reason: blockReason || "Manually blocked", source: "manual",
    });
    if (error) { setMessage({ type: "error", text: "Failed to block date: " + error.message }); }
    else { setMessage({ type: "success", text: "Date blocked successfully" }); setBlockDate(""); setBlockReason(""); loadBlockedDates(); }
    setLoading(false);
  };

  const unblockDate = async (dateId: string) => {
    if (!confirm("Unblock this date?")) return;
    const { error } = await supabase.from("room_blocked_dates").delete().eq("id", dateId);
    if (error) { setMessage({ type: "error", text: "Failed to unblock date" }); }
    else { setMessage({ type: "success", text: "Date unblocked" }); loadBlockedDates(); }
  };

  const addCalendarSync = async () => {
    if (!syncUrl) { setMessage({ type: "error", text: "Please enter calendar URL" }); return; }
    setLoading(true);

    // ── FIX: upsert instead of insert so re-submitting the same
    //    room+platform updates the URL rather than hitting the
    //    unique constraint "external_calendar_sync_room_id_platform_key"
    const { error } = await supabase.from("external_calendar_sync").upsert(
      { room_id: selectedRoom, platform: syncPlatform, calendar_url: syncUrl, sync_enabled: true },
      { onConflict: "room_id,platform" }
    );

    if (error) { setMessage({ type: "error", text: "Failed to add sync: " + error.message }); }
    else {
      setMessage({ type: "success", text: "Calendar sync saved" });
      setSyncUrl("");
      loadCalendarSyncs();
    }
    setLoading(false);
  };

  const toggleSync = async (syncId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("external_calendar_sync")
      .update({ sync_enabled: !currentStatus }).eq("id", syncId);
    if (!error) { setMessage({ type: "success", text: `Sync ${!currentStatus ? "enabled" : "disabled"}` }); loadCalendarSyncs(); }
  };

  const deleteSync = async (syncId: string) => {
    if (!confirm("Delete this calendar sync?")) return;
    const { error } = await supabase.from("external_calendar_sync").delete().eq("id", syncId);
    if (!error) { setMessage({ type: "success", text: "Sync deleted" }); loadCalendarSyncs(); }
  };

  const generateICalUrl = () => `${window.location.origin}/api/ical/${selectedRoom}`;
  const copyICalUrl = () => {
    navigator.clipboard.writeText(generateICalUrl());
    setMessage({ type: "success", text: "iCal URL copied to clipboard!" });
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear(), month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const isDateBlocked = (date: Date | null) => {
    if (!date) return false;
    const dateStr = date.toISOString().split("T")[0];
    return blockedDates.some(bd => bd.blocked_date === dateStr);
  };

  const getBlockInfo = (date: Date | null) => {
    if (!date) return null;
    const dateStr = date.toISOString().split("T")[0];
    return blockedDates.find(bd => bd.blocked_date === dateStr);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  };

  const platformLabel: Record<string, string> = {
    booking_com: "Booking.com", airbnb: "Airbnb", expedia: "Expedia", vrbo: "VRBO", other: "Other",
  };

  const platformColor: Record<string, string> = {
    booking_com: "#003580", airbnb: "#FF385C", expedia: "#FFC72C",
    vrbo: "#195092", website: "#f97316", manual: "#64748b", other: "#8b5cf6",
  };

  /* ─── Render ─── */
  return (
    <>
      <PageStyles />
      <div className="cm-root">

        {/* ── Top Bar ── */}
        <header className="cm-topbar">
          <div className="cm-topbar-inner">
            <div className="cm-brand">
              <div className="cm-brand-icon"><IconCalendar /></div>
              <div>
                <h1 className="cm-title">Calendar Manager</h1>
                <p className="cm-subtitle">Room availability &amp; channel sync</p>
              </div>
            </div>
            <div className="cm-room-picker">
              <label className="cm-picker-label">Property</label>
              <div className="cm-select-wrap">
                <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="cm-select">
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <IconChevronDown />
              </div>
            </div>
          </div>
        </header>

        {/* ── Toast ── */}
        {message.text && (
          <div className={`cm-toast cm-toast--${message.type}`} role="status">
            <span className="cm-toast-icon">
              {message.type === "success" ? <IconToastSuccess /> : <IconToastError />}
            </span>
            {message.text}
          </div>
        )}

        <main className="cm-body">
          {/* ══ LEFT – Calendar ══ */}
          <section className="cm-panel cm-panel--calendar">
            <div className="cm-panel-head">
              <h2 className="cm-panel-title">Availability</h2>
              <div className="cm-month-nav">
                <button
                  className="cm-nav-btn"
                  aria-label="Previous month"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <IconChevronLeft />
                </button>
                <span className="cm-month-label">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <button
                  className="cm-nav-btn"
                  aria-label="Next month"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>

            <div className="cm-cal-weekdays">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="cm-weekday">{d}</div>
              ))}
            </div>

            <div className="cm-cal-grid">
              {getDaysInMonth().map((date, idx) => {
                const blockInfo = getBlockInfo(date);
                const blocked   = isDateBlocked(date);
                const today     = isToday(date);
                return (
                  <div
                    key={idx}
                    className={[
                      "cm-day",
                      !date   ? "cm-day--empty"   : "",
                      blocked ? "cm-day--blocked"  : date ? "cm-day--avail" : "",
                      today   ? "cm-day--today"    : "",
                    ].filter(Boolean).join(" ")}
                  >
                    {date && (
                      <>
                        <span className="cm-day-num">{date.getDate()}</span>
                        {blocked && blockInfo && (
                          <div className="cm-day-info">
                            <span
                              className="cm-day-badge"
                              style={{ background: platformColor[blockInfo.source] || "#64748b" }}
                            >
                              {blockInfo.source.replace("_", ".")}
                            </span>
                            {blockInfo.source === "manual" && (
                              <button
                                className="cm-day-unblock"
                                onClick={() => unblockDate(blockInfo.id)}
                                title="Unblock"
                                aria-label="Unblock date"
                              >
                                <IconUnblock />
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="cm-legend">
              <div className="cm-legend-item"><span className="cm-legend-dot cm-legend-dot--avail" />Available</div>
              <div className="cm-legend-item"><span className="cm-legend-dot cm-legend-dot--blocked" />Blocked</div>
              <div className="cm-legend-item"><span className="cm-legend-dot cm-legend-dot--today" />Today</div>
            </div>

            <div className="cm-stats">
              <div className="cm-stat">
                <span className="cm-stat-num">{getDaysInMonth().filter(d => d && !isDateBlocked(d)).length}</span>
                <span className="cm-stat-label">Available</span>
              </div>
              <div className="cm-stat-divider" />
              <div className="cm-stat">
                <span className="cm-stat-num">{blockedDates.length}</span>
                <span className="cm-stat-label">Blocked</span>
              </div>
              <div className="cm-stat-divider" />
              <div className="cm-stat">
                <span className="cm-stat-num">{calendarSyncs.filter(s => s.sync_enabled).length}</span>
                <span className="cm-stat-label">Active Syncs</span>
              </div>
            </div>
          </section>

          {/* ══ RIGHT – Controls ══ */}
          <aside className="cm-sidebar">

            {/* ── Block a date ── */}
            <div className="cm-card">
              <div className="cm-card-head">
                <div className="cm-card-icon cm-card-icon--red"><IconBan /></div>
                <h3 className="cm-card-title">Block a Date</h3>
              </div>
              <div className="cm-field">
                <label className="cm-label">Date</label>
                <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)}
                  className="cm-input" min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="cm-field">
                <label className="cm-label">Reason <span className="cm-optional">optional</span></label>
                <input type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)}
                  placeholder="e.g. Maintenance, Private event…" className="cm-input" />
              </div>
              <button onClick={blockSingleDate} disabled={loading} className="cm-btn cm-btn--danger">
                {loading ? <span className="cm-spinner" /> : <><IconPlus /> Block Date</>}
              </button>
            </div>

            {/* ── iCal Export ── */}
            <div className="cm-card">
              <div className="cm-card-head">
                <div className="cm-card-icon cm-card-icon--blue"><IconUpload /></div>
                <h3 className="cm-card-title">Export iCal</h3>
              </div>
              <p className="cm-hint">Share this URL with Booking.com, Airbnb, or any platform that supports iCal import.</p>
              <div className="cm-url-box">
                <code className="cm-url-code">{typeof window !== "undefined" ? generateICalUrl() : "Loading…"}</code>
                <button onClick={copyICalUrl} className="cm-copy-btn">
                  <IconCopy /> Copy
                </button>
              </div>
              <div className="cm-guides">
                <details className="cm-guide">
                  <summary className="cm-guide-summary">
                    <span className="cm-guide-dot" style={{ background: "#003580" }} />
                    Booking.com setup
                  </summary>
                  <ol className="cm-guide-steps">
                    <li>Log in to Booking.com Extranet</li>
                    <li>Go to Property → Calendar → Import/Export</li>
                    <li>Click "Import calendar" and paste the URL above</li>
                    <li>Set sync frequency (recommended: every hour)</li>
                  </ol>
                </details>
                <details className="cm-guide">
                  <summary className="cm-guide-summary">
                    <span className="cm-guide-dot" style={{ background: "#FF385C" }} />
                    Airbnb setup
                  </summary>
                  <ol className="cm-guide-steps">
                    <li>Log in to Airbnb hosting dashboard</li>
                    <li>Go to Availability → Calendar sync</li>
                    <li>Click "Import calendar" and paste the URL above</li>
                    <li>Name your calendar and save</li>
                  </ol>
                </details>
              </div>
            </div>

            {/* ── Import Calendar ── */}
            <div className="cm-card">
              <div className="cm-card-head">
                <div className="cm-card-icon cm-card-icon--green"><IconDownload /></div>
                <h3 className="cm-card-title">Import Calendar</h3>
              </div>
              <p className="cm-hint">Pull bookings from external platforms to automatically block dates here.</p>

              <div className="cm-field">
                <label className="cm-label">Platform</label>
                <div className="cm-select-wrap">
                  <select value={syncPlatform} onChange={e => setSyncPlatform(e.target.value)} className="cm-select cm-select--light">
                    <option value="booking_com">Booking.com</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="expedia">Expedia</option>
                    <option value="vrbo">VRBO</option>
                    <option value="other">Other</option>
                  </select>
                  <IconChevronDown />
                </div>
              </div>
              <div className="cm-field">
                <label className="cm-label">iCal URL</label>
                <input type="url" value={syncUrl} onChange={e => setSyncUrl(e.target.value)}
                  placeholder="https://www.airbnb.com/calendar/ical/…" className="cm-input" />
              </div>
              <button onClick={addCalendarSync} disabled={loading} className="cm-btn cm-btn--primary">
                {loading ? <span className="cm-spinner" /> : <><IconSync /> Add Sync</>}
              </button>

              {calendarSyncs.length > 0 && (
                <div className="cm-syncs">
                  <p className="cm-syncs-label">Active connections</p>
                  {calendarSyncs.map(sync => (
                    <div key={sync.id} className="cm-sync">
                      <div className="cm-sync-top">
                        <div className="cm-sync-platform">
                          <span className="cm-platform-dot" style={{ background: platformColor[sync.platform] || "#64748b" }} />
                          <strong>{platformLabel[sync.platform] || sync.platform}</strong>
                        </div>
                        <div className="cm-sync-actions">
                          <label className="cm-toggle" aria-label={`Toggle ${platformLabel[sync.platform]} sync`}>
                            <input type="checkbox" checked={sync.sync_enabled} onChange={() => toggleSync(sync.id, sync.sync_enabled)} />
                            <span className="cm-toggle-track"><span className="cm-toggle-thumb" /></span>
                          </label>
                          <button className="cm-del-btn" onClick={() => deleteSync(sync.id)} title="Delete sync" aria-label="Delete sync">
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                      <div className="cm-sync-url">{sync.calendar_url}</div>
                      {sync.last_sync_at && (
                        <div className="cm-sync-meta">
                          <span>Last sync {new Date(sync.last_sync_at).toLocaleString()}</span>
                          <span className={`cm-status-pill cm-status-pill--${sync.last_sync_status}`}>
                            {sync.last_sync_status}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */

function PageStyles() {
  return (
    <style>{`
      .cm-root {
        --c-bg:        #f5f3ef;
        --c-surface:   #ffffff;
        --c-border:    #e8e3db;
        --c-ink:       #1c1917;
        --c-muted:     #78716c;
        --c-accent:    #c2410c;
        --c-accent-lt: #fff7ed;
        --c-avail:     #d1fae5;
        --c-avail-b:   #6ee7b7;
        --c-blocked:   #fee2e2;
        --c-blocked-b: #fca5a5;
        --c-today:     #fef3c7;
        --c-today-b:   #f59e0b;
        --c-blue:      #1d4ed8;
        --c-blue-lt:   #eff6ff;
        --c-green:     #15803d;
        --c-green-lt:  #f0fdf4;
        --c-shadow:    0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04);
        --c-shadow-md: 0 4px 24px rgba(0,0,0,.08);
        --radius:      14px;
        --radius-sm:   8px;

        min-height: 100vh;
        background: var(--c-bg);
        font-family: 'Georgia', 'Times New Roman', serif;
        color: var(--c-ink);
      }

      .cm-topbar { background: var(--c-ink); color: #fff; position: sticky; top: 0; z-index: 50; }
      .cm-topbar-inner {
        max-width: 1440px; margin: 0 auto; padding: 0 2rem; height: 72px;
        display: flex; align-items: center; justify-content: space-between; gap: 2rem;
      }
      .cm-brand { display: flex; align-items: center; gap: 1rem; }
      .cm-brand-icon {
        width: 40px; height: 40px; background: var(--c-accent); border-radius: 10px;
        display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;
      }
      .cm-title { font-size: clamp(1rem, 2.5vw, 1.25rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; margin: 0; }
      .cm-subtitle { font-size: 0.75rem; color: #a8a29e; font-family: system-ui, sans-serif; margin: 1px 0 0; }

      .cm-room-picker { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
      .cm-picker-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .08em; color: #a8a29e; font-family: system-ui, sans-serif; }

      .cm-select-wrap { position: relative; display: inline-flex; align-items: center; width: 100%; }
      .cm-select {
        appearance: none; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
        color: #fff; padding: .5rem 2.25rem .5rem .85rem; border-radius: var(--radius-sm);
        font-size: .9rem; font-family: system-ui, sans-serif; cursor: pointer;
        transition: border-color .2s; min-width: 200px; width: 100%;
      }
      .cm-select:focus { outline: none; border-color: var(--c-accent); }
      .cm-select option { background: #1c1917; color: #fff; }
      .cm-select--light { background: var(--c-bg); border-color: var(--c-border); color: var(--c-ink); }
      .cm-select--light option { background: #fff; color: var(--c-ink); }
      .cm-select-arrow { position: absolute; right: .6rem; pointer-events: none; color: #a8a29e; }

      .cm-toast {
        position: fixed; top: 88px; right: 1.5rem; z-index: 100;
        display: flex; align-items: center; gap: .6rem;
        padding: .85rem 1.25rem; border-radius: var(--radius-sm);
        font-family: system-ui, sans-serif; font-size: .9rem; font-weight: 500;
        box-shadow: var(--c-shadow-md); animation: cm-slideIn .25s ease;
        max-width: calc(100vw - 3rem);
      }
      .cm-toast--success { background: #052e16; color: #bbf7d0; border: 1px solid #166534; }
      .cm-toast--error   { background: #450a0a; color: #fecaca; border: 1px solid #991b1b; }
      .cm-toast-icon { display: flex; align-items: center; flex-shrink: 0; }
      @keyframes cm-slideIn { from { opacity:0; transform: translateX(16px); } to { opacity:1; transform: translateX(0); } }

      .cm-body {
        max-width: 1440px; margin: 0 auto; padding: 2rem;
        display: grid; grid-template-columns: 1fr 400px; gap: 2rem; align-items: start;
      }

      .cm-panel { background: var(--c-surface); border-radius: var(--radius); box-shadow: var(--c-shadow); padding: 2rem; border: 1px solid var(--c-border); }
      .cm-panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 0.75rem; }
      .cm-panel-title { font-size: 1.4rem; font-weight: 700; color: var(--c-ink); letter-spacing: -.02em; margin: 0; }

      .cm-month-nav { display: flex; align-items: center; gap: .75rem; }
      .cm-month-label { font-family: system-ui, sans-serif; font-size: .95rem; font-weight: 600; color: var(--c-ink); min-width: 140px; text-align: center; }
      .cm-nav-btn {
        width: 34px; height: 34px; border: 1px solid var(--c-border); border-radius: var(--radius-sm);
        background: var(--c-surface); display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .15s; color: var(--c-muted); flex-shrink: 0;
      }
      .cm-nav-btn:hover { background: var(--c-bg); color: var(--c-ink); border-color: #c5bdb3; }

      .cm-cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: .35rem; margin-bottom: .35rem; }
      .cm-weekday { text-align: center; font-family: system-ui, sans-serif; font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--c-muted); padding: .4rem 0; }
      .cm-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: .35rem; }
      .cm-day { aspect-ratio: 1; border-radius: var(--radius-sm); padding: .35rem; position: relative; display: flex; flex-direction: column; border: 1.5px solid transparent; transition: transform .1s, box-shadow .1s; }
      .cm-day--empty   { background: transparent !important; }
      .cm-day--avail   { background: var(--c-avail); border-color: var(--c-avail-b); }
      .cm-day--avail:hover { transform: scale(1.04); box-shadow: 0 2px 8px rgba(0,0,0,.1); }
      .cm-day--blocked { background: var(--c-blocked); border-color: var(--c-blocked-b); }
      .cm-day--today   { background: var(--c-today) !important; border-color: var(--c-today-b) !important; box-shadow: 0 0 0 2px var(--c-today-b); }
      .cm-day-num { font-family: system-ui, sans-serif; font-size: .8rem; font-weight: 700; color: var(--c-ink); line-height: 1; }
      .cm-day-info { margin-top: .2rem; display: flex; align-items: center; gap: .2rem; flex-wrap: wrap; }
      .cm-day-badge { font-size: .55rem; font-family: system-ui, sans-serif; font-weight: 700; color: #fff; padding: .1rem .3rem; border-radius: 3px; text-transform: uppercase; letter-spacing: .03em; white-space: nowrap; }
      .cm-day-unblock { display: inline-flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: #dc2626; padding: 0 .1rem; line-height: 1; opacity: .7; transition: opacity .15s; }
      .cm-day-unblock:hover { opacity: 1; }

      .cm-legend { display: flex; gap: 1.25rem; justify-content: center; margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--c-border); flex-wrap: wrap; }
      .cm-legend-item { display: flex; align-items: center; gap: .4rem; font-family: system-ui, sans-serif; font-size: .8rem; color: var(--c-muted); }
      .cm-legend-dot { width: 14px; height: 14px; border-radius: 4px; border: 1.5px solid; flex-shrink: 0; }
      .cm-legend-dot--avail   { background: var(--c-avail);   border-color: var(--c-avail-b); }
      .cm-legend-dot--blocked { background: var(--c-blocked); border-color: var(--c-blocked-b); }
      .cm-legend-dot--today   { background: var(--c-today);   border-color: var(--c-today-b); }

      .cm-stats { display: flex; align-items: center; justify-content: center; margin-top: 1.25rem; background: var(--c-bg); border-radius: var(--radius-sm); border: 1px solid var(--c-border); overflow: hidden; }
      .cm-stat { flex: 1; text-align: center; padding: 1rem; min-width: 0; }
      .cm-stat-num { display: block; font-size: 1.75rem; font-weight: 800; color: var(--c-ink); letter-spacing: -.03em; font-family: Georgia, serif; }
      .cm-stat-label { display: block; font-size: .7rem; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: .07em; color: var(--c-muted); margin-top: .2rem; }
      .cm-stat-divider { width: 1px; background: var(--c-border); align-self: stretch; }

      .cm-sidebar { display: flex; flex-direction: column; gap: 1.25rem; }

      .cm-card { background: var(--c-surface); border-radius: var(--radius); box-shadow: var(--c-shadow); padding: 1.5rem; border: 1px solid var(--c-border); }
      .cm-card-head { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.25rem; }
      .cm-card-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .cm-card-icon--red   { background: #fff1f2; color: #dc2626; }
      .cm-card-icon--blue  { background: #eff6ff; color: #2563eb; }
      .cm-card-icon--green { background: #f0fdf4; color: #16a34a; }
      .cm-card-title { font-size: 1.05rem; font-weight: 700; letter-spacing: -.01em; margin: 0; }

      .cm-field { margin-bottom: 1rem; }
      .cm-label { display: block; font-size: .78rem; font-family: system-ui, sans-serif; font-weight: 600; color: var(--c-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .4rem; }
      .cm-optional { font-weight: 400; text-transform: none; letter-spacing: 0; }
      .cm-input { width: 100%; box-sizing: border-box; padding: .65rem .85rem; border: 1.5px solid var(--c-border); border-radius: var(--radius-sm); font-size: .9rem; font-family: system-ui, sans-serif; color: var(--c-ink); background: var(--c-bg); transition: border-color .2s, box-shadow .2s; }
      .cm-input::placeholder { color: #c4b8ae; }
      .cm-input:focus { outline: none; border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(194,65,12,.1); }
      .cm-hint { font-size: .82rem; font-family: system-ui, sans-serif; color: var(--c-muted); line-height: 1.5; margin-bottom: 1rem; }

      .cm-btn { width: 100%; padding: .75rem; border: none; border-radius: var(--radius-sm); font-size: .9rem; font-family: system-ui, sans-serif; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .5rem; transition: all .2s; letter-spacing: .01em; }
      .cm-btn:disabled { opacity: .5; cursor: not-allowed; }
      .cm-btn--primary { background: var(--c-ink); color: #fff; }
      .cm-btn--primary:hover:not(:disabled) { background: #292524; }
      .cm-btn--danger  { background: var(--c-accent); color: #fff; }
      .cm-btn--danger:hover:not(:disabled)  { background: #9a3412; }

      .cm-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: cm-spin .7s linear infinite; }
      @keyframes cm-spin { to { transform: rotate(360deg); } }

      .cm-url-box { display: flex; gap: .5rem; align-items: center; background: var(--c-bg); border: 1.5px solid var(--c-border); border-radius: var(--radius-sm); padding: .65rem .85rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
      .cm-url-code { flex: 1; font-size: .75rem; color: var(--c-muted); word-break: break-all; font-family: 'Courier New', monospace; min-width: 0; }
      .cm-copy-btn { display: flex; align-items: center; gap: .35rem; background: var(--c-ink); color: #fff; border: none; border-radius: 6px; padding: .4rem .75rem; font-size: .78rem; font-family: system-ui, sans-serif; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .2s; flex-shrink: 0; }
      .cm-copy-btn:hover { background: #292524; }

      .cm-guides { display: flex; flex-direction: column; gap: .5rem; }
      .cm-guide { border: 1px solid var(--c-border); border-radius: var(--radius-sm); overflow: hidden; }
      .cm-guide-summary { cursor: pointer; padding: .65rem .85rem; font-size: .85rem; font-family: system-ui, sans-serif; font-weight: 600; color: var(--c-ink); display: flex; align-items: center; gap: .5rem; list-style: none; user-select: none; background: var(--c-bg); }
      .cm-guide-summary::-webkit-details-marker { display: none; }
      .cm-guide[open] .cm-guide-summary { border-bottom: 1px solid var(--c-border); }
      .cm-guide-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      .cm-guide-steps { padding: .85rem .85rem .85rem 1.75rem; color: var(--c-muted); font-size: .82rem; font-family: system-ui, sans-serif; line-height: 1.7; }
      .cm-guide-steps li { margin-bottom: .2rem; }

      .cm-syncs { margin-top: 1.25rem; }
      .cm-syncs-label { font-size: .7rem; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: .08em; color: var(--c-muted); font-weight: 700; margin-bottom: .75rem; }
      .cm-sync { background: var(--c-bg); border: 1.5px solid var(--c-border); border-radius: var(--radius-sm); padding: .9rem; margin-bottom: .6rem; }
      .cm-sync-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; }
      .cm-sync-platform { display: flex; align-items: center; gap: .45rem; }
      .cm-platform-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
      .cm-sync-platform strong { font-size: .88rem; font-family: system-ui, sans-serif; }
      .cm-sync-actions { display: flex; align-items: center; gap: .6rem; }
      .cm-sync-url { font-size: .72rem; color: var(--c-muted); font-family: 'Courier New', monospace; word-break: break-all; margin-bottom: .4rem; }
      .cm-sync-meta { display: flex; align-items: center; gap: .5rem; font-size: .75rem; color: var(--c-muted); font-family: system-ui, sans-serif; flex-wrap: wrap; }
      .cm-status-pill { font-size: .68rem; font-weight: 700; padding: .1rem .45rem; border-radius: 4px; text-transform: uppercase; letter-spacing: .04em; font-family: system-ui, sans-serif; }
      .cm-status-pill--success { background: #dcfce7; color: #166534; }
      .cm-status-pill--failed  { background: #fee2e2; color: #991b1b; }
      .cm-status-pill--partial { background: #fef9c3; color: #854d0e; }

      .cm-toggle { position: relative; display: inline-block; cursor: pointer; }
      .cm-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
      .cm-toggle-track { display: block; width: 40px; height: 22px; background: #d1c5bb; border-radius: 11px; transition: background .25s; position: relative; }
      .cm-toggle input:checked ~ .cm-toggle-track { background: #16a34a; }
      .cm-toggle-thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .25s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
      .cm-toggle input:checked ~ .cm-toggle-track .cm-toggle-thumb { transform: translateX(18px); }

      .cm-del-btn { width: 28px; height: 28px; border: 1.5px solid #fca5a5; border-radius: 6px; background: #fff1f2; color: #dc2626; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
      .cm-del-btn:hover { background: #dc2626; color: #fff; border-color: #dc2626; }

      @media (max-width: 1100px) {
        .cm-body { grid-template-columns: 1fr; }
        .cm-sidebar { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
      }
      @media (max-width: 640px) {
        .cm-topbar-inner { flex-direction: column; height: auto; padding: 1rem; gap: .75rem; align-items: flex-start; }
        .cm-room-picker { width: 100%; }
        .cm-select { min-width: unset; width: 100%; }
        .cm-body { padding: 1rem; gap: 1rem; }
        .cm-panel { padding: 1.25rem; }
        .cm-card  { padding: 1.25rem; }
        .cm-sidebar { grid-template-columns: 1fr; }
        .cm-toast { top: auto; bottom: 1rem; right: 1rem; left: 1rem; }
        .cm-stat-num { font-size: 1.4rem; }
        .cm-month-label { min-width: 110px; font-size: .85rem; }
      }
      @media (max-width: 420px) {
        .cm-cal-grid { gap: .2rem; }
        .cm-cal-weekdays { gap: .2rem; }
        .cm-day { padding: .2rem; }
        .cm-day-num { font-size: .7rem; }
        .cm-day-badge { display: none; }
      }
    `}</style>
  );
}
