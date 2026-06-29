"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────── Types ─────────────────────────── */

type Room = {
  id: string;
  name: string;
  base_price: number;
  guest_prices?: Record<string, number>;
};

type RateOverride = {
  id: string;
  room_id: string;
  date: string;       // "YYYY-MM-DD"
  price: number;
  label?: string;
};

type SelectionMode = "single" | "range" | "bulk";

/* ─────────────────────────── Helpers ─────────────────────────── */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  return day === 0 || day === 5 || day === 6; // Sun, Fri, Sat
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

/* ─────────────────────────── Icons ─────────────────────────── */

function ChevronLeft() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function ChevronRight() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function ChevronDown() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function IconTag() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function IconTrash() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IconClose() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconCalendar() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconSpinner() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rm-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}

/* ─────────────────────────── Main Component ─────────────────────────── */

export default function RateManager() {
  const [rooms, setRooms]               = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [overrides, setOverrides]       = useState<RateOverride[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState({ type: "", text: "" });

  // Selection state
  const [selMode, setSelMode]       = useState<SelectionMode>("single");
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd]     = useState<string | null>(null);
  const [hoverDate, setHoverDate]   = useState<string | null>(null);

  // Bulk panel state
  const [bulkType, setBulkType]     = useState<"weekend" | "weekday" | "range">("weekend");
  const [bulkPrice, setBulkPrice]   = useState("");
  const [bulkLabel, setBulkLabel]   = useState("");
  const [bulkRangeStart, setBulkRangeStart] = useState("");
  const [bulkRangeEnd, setBulkRangeEnd]     = useState("");

  // Single/range edit modal
  const [editModal, setEditModal]   = useState<{ dates: string[]; price: string; label: string } | null>(null);

  useEffect(() => { loadRooms(); }, []);

  useEffect(() => {
    if (selectedRoom) loadOverrides();
  }, [selectedRoom, currentMonth]);

  useEffect(() => {
    if (toast.text) {
      const t = setTimeout(() => setToast({ type: "", text: "" }), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (type: string, text: string) => setToast({ type, text });

  const loadRooms = async () => {
    // Try with guest_prices first; fall back without it if column doesn't exist yet
    const r1 = await supabase.from("rooms").select("id, name, base_price, guest_prices").order("name");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any[] | null = r1.data;
    if (r1.error || !data) {
      const r2 = await supabase.from("rooms").select("id, name, base_price").order("name");
      data = r2.data;
    }
    if (data && data.length > 0) { setRooms(data); setSelectedRoom(data[0]); }
  };


  const loadOverrides = useCallback(async () => {
    if (!selectedRoom) return;
    // Load 3 months around current for smoother navigation
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const end   = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);
    const { data, error } = await supabase
      .from("room_rate_overrides")
      .select("*")
      .eq("room_id", selectedRoom.id)
      .gte("date", toDateStr(start))
      .lte("date", toDateStr(end));
    if (!error && data) setOverrides(data);
  }, [selectedRoom, currentMonth]);

  /* ─── Calendar grid ─── */
  const calDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const days: (string | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let i = 1; i <= last.getDate(); i++) {
      days.push(toDateStr(new Date(year, month, i)));
    }
    return days;
  }, [currentMonth]);

  const overrideMap = useMemo(() => {
    const map: Record<string, RateOverride> = {};
    overrides.forEach(o => { map[o.date] = o; });
    return map;
  }, [overrides]);

  const getRate = (dateStr: string) => {
    if (overrideMap[dateStr]) return overrideMap[dateStr].price;
    return selectedRoom?.base_price ?? 0;
  };

  const isOverridden = (dateStr: string) => !!overrideMap[dateStr];

  /* ─── Range selection logic ─── */
  const inRange = (dateStr: string): boolean => {
    if (selMode !== "range") return false;
    if (!rangeStart) return false;
    const end = rangeEnd || hoverDate;
    if (!end) return false;
    const [a, b] = rangeStart <= end ? [rangeStart, end] : [end, rangeStart];
    return dateStr >= a && dateStr <= b;
  };

  const handleDayClick = (dateStr: string) => {
    if (selMode === "single") {
      setEditModal({ dates: [dateStr], price: String(getRate(dateStr)), label: overrideMap[dateStr]?.label || "" });
    } else if (selMode === "range") {
      if (!rangeStart || rangeEnd) {
        // Start new range
        setRangeStart(dateStr);
        setRangeEnd(null);
      } else {
        // Complete range
        const [a, b] = rangeStart <= dateStr ? [rangeStart, dateStr] : [dateStr, rangeStart];
        setRangeEnd(dateStr);
        // Collect all dates in range
        const dates: string[] = [];
        let cur = a;
        while (cur <= b) { dates.push(cur); cur = addDays(cur, 1); }
        setEditModal({ dates, price: String(getRate(a)), label: overrideMap[a]?.label || "" });
        setRangeStart(null);
        setRangeEnd(null);
      }
    }
  };

  /* ─── Save single / range override ─── */
  const saveEditModal = async () => {
    if (!editModal || !selectedRoom) return;
    const price = parseFloat(editModal.price);
    if (isNaN(price) || price < 0) { showToast("error", "Enter a valid price"); return; }
    setSaving(true);
    try {
      const rows = editModal.dates.map(date => ({
        room_id: selectedRoom.id,
        date,
        price,
        label: editModal.label || null,
      }));
      const { error } = await supabase
        .from("room_rate_overrides")
        .upsert(rows, { onConflict: "room_id,date" });
      if (error) throw error;
      showToast("success", `Rate saved for ${editModal.dates.length} day${editModal.dates.length > 1 ? "s" : ""}`);
      setEditModal(null);
      await loadOverrides();
    } catch (e: any) {
      showToast("error", e.message || "Failed to save");
    } finally { setSaving(false); }
  };

  /* ─── Delete override(s) ─── */
  const deleteOverride = async (dates: string[]) => {
    if (!selectedRoom) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("room_rate_overrides")
        .delete()
        .eq("room_id", selectedRoom.id)
        .in("date", dates);
      if (error) throw error;
      showToast("success", `Reset to base price for ${dates.length} day${dates.length > 1 ? "s" : ""}`);
      setEditModal(null);
      await loadOverrides();
    } catch (e: any) {
      showToast("error", e.message || "Failed to delete");
    } finally { setSaving(false); }
  };

  /* ─── Bulk set rates ─── */
  const applyBulk = async () => {
    if (!selectedRoom) return;
    const price = parseFloat(bulkPrice);
    if (isNaN(price) || price < 0) { showToast("error", "Enter a valid price"); return; }

    let dates: string[] = [];

    if (bulkType === "weekend" || bulkType === "weekday") {
      // All days in current month matching the type
      calDays.forEach(d => {
        if (!d) return;
        if (bulkType === "weekend" && isWeekend(d)) dates.push(d);
        if (bulkType === "weekday" && !isWeekend(d)) dates.push(d);
      });
    } else if (bulkType === "range") {
      if (!bulkRangeStart || !bulkRangeEnd) { showToast("error", "Select a date range"); return; }
      const [a, b] = bulkRangeStart <= bulkRangeEnd ? [bulkRangeStart, bulkRangeEnd] : [bulkRangeEnd, bulkRangeStart];
      let cur = a;
      while (cur <= b) { dates.push(cur); cur = addDays(cur, 1); }
    }

    if (dates.length === 0) { showToast("error", "No dates match the selection"); return; }
    setSaving(true);
    try {
      const rows = dates.map(date => ({
        room_id: selectedRoom.id,
        date,
        price,
        label: bulkLabel || (bulkType === "weekend" ? "Weekend" : bulkType === "weekday" ? "Weekday" : bulkLabel) || null,
      }));
      const { error } = await supabase
        .from("room_rate_overrides")
        .upsert(rows, { onConflict: "room_id,date" });
      if (error) throw error;
      showToast("success", `Rates set for ${dates.length} days`);
      setBulkPrice("");
      await loadOverrides();
    } catch (e: any) {
      showToast("error", e.message || "Failed to apply");
    } finally { setSaving(false); }
  };

  /* ─── Clear all overrides for the month ─── */
  const clearMonth = async () => {
    if (!selectedRoom) return;
    if (!confirm(`Reset ALL custom rates for ${MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()} to base price?`)) return;
    const monthDates = calDays.filter(Boolean) as string[];
    setSaving(true);
    try {
      const { error } = await supabase
        .from("room_rate_overrides")
        .delete()
        .eq("room_id", selectedRoom.id)
        .in("date", monthDates);
      if (error) throw error;
      showToast("success", "Month rates cleared");
      await loadOverrides();
    } catch (e: any) {
      showToast("error", e.message || "Failed");
    } finally { setSaving(false); }
  };

  /* ─── Month overrides list ─── */
  const monthOverrides = useMemo(() =>
    calDays
      .filter((d): d is string => !!d && !!overrideMap[d])
      .map(d => overrideMap[d])
      .sort((a, b) => a.date.localeCompare(b.date)),
    [calDays, overrideMap]
  );

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const allDays = calDays.filter(Boolean) as string[];
    const overriddenDays = allDays.filter(d => isOverridden(d));
    const weekendDays    = allDays.filter(d => isWeekend(d) && isOverridden(d));
    const weekdayDays    = allDays.filter(d => !isWeekend(d) && isOverridden(d));
    return {
      total:    allDays.length,
      custom:   overriddenDays.length,
      base:     allDays.length - overriddenDays.length,
      weekends: weekendDays.length,
      weekdays: weekdayDays.length,
    };
  }, [calDays, overrideMap]);

  /* ─────────────── RENDER ─────────────── */
  return (
    <>
      <RmStyles />
      <div className="rm-root">

        {/* ── Toast ── */}
        {toast.text && (
          <div className={`rm-toast rm-toast--${toast.type}`}>
            {toast.type === "success" ? <IconCheck /> : <IconClose />}
            {toast.text}
          </div>
        )}

        {/* ── Header ── */}
        <div className="rm-header">
          <div className="rm-header-left">
            <div className="rm-brand-icon"><IconCalendar /></div>
            <div>
              <h1 className="rm-title">Rate Manager</h1>
              <p className="rm-subtitle">Set custom prices per date, weekend, or season</p>
            </div>
          </div>
          {/* Room selector */}
          <div className="rm-room-select-wrap">
            <label className="rm-field-label">Room</label>
            <div className="rm-select-wrap">
              <select
                className="rm-select"
                value={selectedRoom?.id || ""}
                onChange={e => {
                  const r = rooms.find(r => r.id === e.target.value);
                  if (r) setSelectedRoom(r);
                }}
              >
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <ChevronDown />
            </div>
            {selectedRoom && (
              <span className="rm-base-badge">
                Base ₹{selectedRoom.base_price.toLocaleString()}/night
              </span>
            )}
          </div>
        </div>

        <div className="rm-body">

          {/* ══ LEFT: Calendar ══ */}
          <div className="rm-calendar-col">

            {/* Month nav + mode toggle */}
            <div className="rm-cal-topbar">
              <div className="rm-month-nav">
                <button className="rm-nav-btn" onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                }><ChevronLeft /></button>
                <span className="rm-month-label">
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button className="rm-nav-btn" onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                }><ChevronRight /></button>
              </div>

              <div className="rm-mode-tabs">
                {(["single","range"] as SelectionMode[]).map(m => (
                  <button
                    key={m}
                    className={`rm-mode-tab ${selMode === m ? "active" : ""}`}
                    onClick={() => { setSelMode(m); setRangeStart(null); setRangeEnd(null); }}
                  >
                    {m === "single" ? "Click to set" : "Select range"}
                  </button>
                ))}
              </div>
            </div>

            {selMode === "range" && (
              <div className="rm-range-hint">
                {!rangeStart
                  ? "Click a start date"
                  : "Now click an end date"}
              </div>
            )}

            {/* Weekday headers */}
            <div className="rm-weekdays">
              {DAYS.map(d => <div key={d} className="rm-weekday">{d}</div>)}
            </div>

            {/* Day grid */}
            <div className="rm-grid">
              {calDays.map((dateStr, idx) => {
                if (!dateStr) return <div key={idx} className="rm-day rm-day--empty" />;

                const overridden = isOverridden(dateStr);
                const rate = getRate(dateStr);
                const weekend = isWeekend(dateStr);
                const inSel = inRange(dateStr);
                const isRangeStart = rangeStart === dateStr;
                const today = toDateStr(new Date()) === dateStr;
                const label = overrideMap[dateStr]?.label;

                return (
                  <div
                    key={idx}
                    className={[
                      "rm-day",
                      weekend   ? "rm-day--weekend"   : "rm-day--weekday",
                      overridden ? "rm-day--override"  : "",
                      inSel     ? "rm-day--in-range"   : "",
                      isRangeStart ? "rm-day--range-start" : "",
                      today     ? "rm-day--today"      : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => handleDayClick(dateStr)}
                    onMouseEnter={() => selMode === "range" && setHoverDate(dateStr)}
                    onMouseLeave={() => setHoverDate(null)}
                    title={`${dateStr}${label ? ` · ${label}` : ""}${weekend ? " · Weekend" : " · Weekday"}`}
                  >
                    <span className="rm-day-num">{new Date(dateStr + "T00:00:00").getDate()}</span>
                    <span className="rm-day-rate">₹{rate.toLocaleString()}</span>
                    {overridden && label && (
                      <span className="rm-day-label">{label}</span>
                    )}
                    {overridden && (
                      <span className="rm-day-dot" title="Custom rate" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="rm-legend">
              <div className="rm-legend-item"><span className="rm-legend-swatch rm-legend-swatch--weekday"/>Weekday</div>
              <div className="rm-legend-item"><span className="rm-legend-swatch rm-legend-swatch--weekend"/>Weekend (Fri/Sat/Sun)</div>
              <div className="rm-legend-item"><span className="rm-legend-swatch rm-legend-swatch--override"/>Custom rate</div>
              <div className="rm-legend-item"><span className="rm-legend-swatch rm-legend-swatch--today"/>Today</div>
            </div>

            {/* Month stats */}
            <div className="rm-stats">
              <div className="rm-stat">
                <span className="rm-stat-num">{stats.total}</span>
                <span className="rm-stat-lbl">Total days</span>
              </div>
              <div className="rm-stat-div" />
              <div className="rm-stat">
                <span className="rm-stat-num rm-stat-num--orange">{stats.custom}</span>
                <span className="rm-stat-lbl">Custom rates</span>
              </div>
              <div className="rm-stat-div" />
              <div className="rm-stat">
                <span className="rm-stat-num">{stats.base}</span>
                <span className="rm-stat-lbl">Base price days</span>
              </div>
            </div>

            {/* Month overrides list */}
            {monthOverrides.length > 0 && (
              <div className="rm-overrides-list">
                <div className="rm-overrides-head">
                  <span>Custom rates this month ({monthOverrides.length})</span>
                  <button className="rm-clear-btn" onClick={clearMonth}>Clear all</button>
                </div>
                <div className="rm-overrides-rows">
                  {monthOverrides.map(o => {
                    const d = new Date(o.date + "T00:00:00");
                    return (
                      <div key={o.id} className="rm-override-row">
                        <span className="rm-override-date">
                          {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                          {isWeekend(o.date) && <span className="rm-wknd-chip">WE</span>}
                        </span>
                        {o.label && <span className="rm-override-lbl">{o.label}</span>}
                        <span className="rm-override-price">₹{o.price.toLocaleString()}</span>
                        <button
                          className="rm-override-del"
                          onClick={() => deleteOverride([o.date])}
                          title="Reset to base price"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ══ RIGHT: Bulk Tools ══ */}
          <div className="rm-sidebar">

            {/* Bulk rate setter */}
            <div className="rm-card">
              <div className="rm-card-head">
                <div className="rm-card-icon"><IconTag /></div>
                <h3 className="rm-card-title">Bulk Rate Setter</h3>
              </div>
              <p className="rm-hint">Set one price for many dates at once.</p>

              {/* Type tabs */}
              <div className="rm-bulk-tabs">
                {[
                  { val: "weekend", label: "Weekends" },
                  { val: "weekday", label: "Weekdays" },
                  { val: "range",   label: "Date Range" },
                ].map(tab => (
                  <button
                    key={tab.val}
                    className={`rm-bulk-tab ${bulkType === tab.val ? "active" : ""}`}
                    onClick={() => setBulkType(tab.val as any)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {bulkType === "range" && (
                <div className="rm-form-row">
                  <div className="rm-field">
                    <label className="rm-field-label">From</label>
                    <input type="date" className="rm-input" value={bulkRangeStart}
                      onChange={e => setBulkRangeStart(e.target.value)} />
                  </div>
                  <div className="rm-field">
                    <label className="rm-field-label">To</label>
                    <input type="date" className="rm-input" value={bulkRangeEnd}
                      onChange={e => setBulkRangeEnd(e.target.value)}
                      min={bulkRangeStart} />
                  </div>
                </div>
              )}

              {bulkType !== "range" && (
                <p className="rm-bulk-scope">
                  Applies to all <strong>{bulkType === "weekend" ? "Fri / Sat / Sun" : "Mon – Thu"}</strong> in{" "}
                  <strong>{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</strong>
                </p>
              )}

              <div className="rm-form-row">
                <div className="rm-field">
                  <label className="rm-field-label">Price per night (₹) *</label>
                  <input
                    type="number" min={0} className="rm-input rm-input--price"
                    placeholder={`e.g. ${selectedRoom ? Math.round(selectedRoom.base_price * 1.3) : 3500}`}
                    value={bulkPrice} onChange={e => setBulkPrice(e.target.value)}
                  />
                </div>
                <div className="rm-field">
                  <label className="rm-field-label">Label <span className="rm-optional">optional</span></label>
                  <input
                    type="text" className="rm-input"
                    placeholder="e.g. Peak, Holiday…"
                    value={bulkLabel} onChange={e => setBulkLabel(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="rm-btn rm-btn--primary"
                onClick={applyBulk}
                disabled={saving || !bulkPrice}
              >
                {saving ? <><IconSpinner /> Saving…</> : <>Apply Rates</>}
              </button>
            </div>

            {/* Quick presets */}
            <div className="rm-card">
              <h3 className="rm-card-title" style={{ marginBottom: "1rem" }}>Quick Presets</h3>
              <p className="rm-hint">Common patterns for this room's base price of ₹{selectedRoom?.base_price.toLocaleString()}.</p>
              <div className="rm-presets">
                {[
                  { label: "Weekend +20%", pct: 1.20, type: "weekend", lbl: "Weekend" },
                  { label: "Weekend +30%", pct: 1.30, type: "weekend", lbl: "Weekend" },
                  { label: "Weekend +50%", pct: 1.50, type: "weekend", lbl: "Weekend Peak" },
                  { label: "Weekday -10%", pct: 0.90, type: "weekday", lbl: "Weekday" },
                  { label: "Holiday +40%", pct: 1.40, type: "range",   lbl: "Holiday" },
                ].map((p, i) => (
                  <button
                    key={i}
                    className="rm-preset-btn"
                    onClick={() => {
                      if (!selectedRoom) return;
                      setBulkType(p.type as any);
                      setBulkPrice(String(Math.round(selectedRoom.base_price * p.pct)));
                      setBulkLabel(p.lbl);
                    }}
                  >
                    <span className="rm-preset-label">{p.label}</span>
                    {selectedRoom && (
                      <span className="rm-preset-price">
                        ₹{Math.round(selectedRoom.base_price * p.pct).toLocaleString()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Per-guest pricing note */}
            {selectedRoom?.guest_prices && Object.keys(selectedRoom.guest_prices).length > 0 && (
              <div className="rm-card rm-card--info">
                <h4 className="rm-card-title" style={{ marginBottom: ".5rem", fontSize: ".9rem" }}>
                  Guest-count pricing active
                </h4>
                <p className="rm-hint" style={{ marginBottom: ".6rem" }}>
                  This room has per-guest tiers. Date overrides set here will replace
                  the base price, but guest-count multipliers still apply on top.
                </p>
                <div className="rm-tier-preview">
                  {Object.entries(selectedRoom.guest_prices)
                    .sort(([a],[b]) => parseInt(a) - parseInt(b))
                    .map(([g, p]) => (
                      <span key={g} className="rm-tier-chip">{g} guests → ₹{Number(p).toLocaleString()}</span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ Edit Modal ══ */}
        {editModal && (
          <div className="rm-overlay" onClick={() => setEditModal(null)}>
            <div className="rm-modal" onClick={e => e.stopPropagation()}>
              <div className="rm-modal-head">
                <h3>
                  {editModal.dates.length === 1
                    ? (() => {
                        const d = new Date(editModal.dates[0] + "T00:00:00");
                        return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
                      })()
                    : `${editModal.dates.length} dates selected`}
                </h3>
                <button className="rm-modal-close" onClick={() => setEditModal(null)}><IconClose /></button>
              </div>

              {editModal.dates.length === 1 && selectedRoom && (
                <p className="rm-modal-hint">
                  Base price: ₹{selectedRoom.base_price.toLocaleString()} ·{" "}
                  {isWeekend(editModal.dates[0]) ? "Weekend (Fri/Sat/Sun)" : "Weekday (Mon–Thu)"}
                </p>
              )}

              <div className="rm-form-row">
                <div className="rm-field">
                  <label className="rm-field-label">Price per night (₹) *</label>
                  <input
                    type="number" min={0}
                    className="rm-input rm-input--price"
                    value={editModal.price}
                    onChange={e => setEditModal(prev => prev ? { ...prev, price: e.target.value } : null)}
                    autoFocus
                  />
                </div>
                <div className="rm-field">
                  <label className="rm-field-label">Label <span className="rm-optional">optional</span></label>
                  <input
                    type="text" className="rm-input"
                    placeholder="Weekend, Holiday…"
                    value={editModal.label}
                    onChange={e => setEditModal(prev => prev ? { ...prev, label: e.target.value } : null)}
                  />
                </div>
              </div>

              <div className="rm-modal-actions">
                <button
                  className="rm-btn rm-btn--ghost"
                  onClick={() => deleteOverride(editModal.dates)}
                  disabled={saving || editModal.dates.every(d => !isOverridden(d))}
                >
                  Reset to base
                </button>
                <button className="rm-btn rm-btn--primary" onClick={saveEditModal} disabled={saving}>
                  {saving ? <><IconSpinner /> Saving…</> : "Save Rate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */

function RmStyles() {
  return (
    <style>{`
      .rm-root {
        --orange:    #f97316;
        --orange-dk: #ea580c;
        --orange-lt: #fff7ed;
        --ink:       #1c1917;
        --muted:     #78716c;
        --border:    #e8e3db;
        --bg:        #f5f3ef;
        --surface:   #ffffff;
        --weekend:   #fef9c3;
        --weekend-b: #fbbf24;
        --override:  #dcfce7;
        --override-b:#16a34a;
        --today-b:   #f97316;
        --radius:    14px;
        --radius-sm: 8px;
        --shadow:    0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04);

        min-height: 100vh;
        background: var(--bg);
        font-family: system-ui, sans-serif;
        color: var(--ink);
      }

      /* Header */
      .rm-header {
        background: var(--ink); color: #fff;
        padding: 1.25rem 2rem;
        display: flex; align-items: center; justify-content: space-between;
        gap: 1.5rem; flex-wrap: wrap;
        position: sticky; top: 0; z-index: 50;
      }
      .rm-header-left { display: flex; align-items: center; gap: 1rem; }
      .rm-brand-icon {
        width: 40px; height: 40px; background: var(--orange); border-radius: 10px;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .rm-title { font-size: 1.2rem; font-weight: 700; margin: 0; letter-spacing: -.02em; }
      .rm-subtitle { font-size: .75rem; color: #a8a29e; margin: 2px 0 0; }

      .rm-room-select-wrap { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
      .rm-select-wrap { position: relative; display: inline-flex; align-items: center; }
      .rm-select-wrap svg { position: absolute; right: .6rem; pointer-events: none; color: #a8a29e; }
      .rm-select {
        appearance: none; background: rgba(255,255,255,.1);
        border: 1px solid rgba(255,255,255,.2); color: #fff;
        padding: .5rem 2.25rem .5rem .85rem; border-radius: var(--radius-sm);
        font-size: .9rem; cursor: pointer; min-width: 220px;
      }
      .rm-select:focus { outline: none; border-color: var(--orange); }
      .rm-select option { background: #1c1917; }
      .rm-base-badge {
        font-size: .72rem; color: #a8a29e; font-family: system-ui;
        background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
        border-radius: 100px; padding: 2px 10px; margin-top: 2px; width: fit-content;
      }

      /* Toast */
      .rm-toast {
        position: fixed; top: 90px; right: 1.5rem; z-index: 200;
        display: flex; align-items: center; gap: .5rem;
        padding: .75rem 1.1rem; border-radius: var(--radius-sm);
        font-size: .88rem; font-weight: 500;
        box-shadow: 0 4px 20px rgba(0,0,0,.15);
        animation: rm-slideIn .2s ease;
      }
      .rm-toast--success { background: #052e16; color: #bbf7d0; border: 1px solid #166534; }
      .rm-toast--error   { background: #450a0a; color: #fecaca; border: 1px solid #991b1b; }
      @keyframes rm-slideIn { from { opacity:0; transform:translateX(14px); } to { opacity:1; transform:translateX(0); } }

      /* Body layout */
      .rm-body {
        max-width: 1440px; margin: 0 auto;
        padding: 2rem; display: grid;
        grid-template-columns: 1fr 360px; gap: 2rem; align-items: start;
      }

      /* Calendar column */
      .rm-calendar-col {
        background: var(--surface); border-radius: var(--radius);
        box-shadow: var(--shadow); padding: 1.75rem;
        border: 1px solid var(--border);
      }
      .rm-cal-topbar {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 1.25rem; flex-wrap: wrap; gap: .75rem;
      }
      .rm-month-nav { display: flex; align-items: center; gap: .75rem; }
      .rm-month-label { font-size: 1rem; font-weight: 700; min-width: 160px; text-align: center; }
      .rm-nav-btn {
        width: 32px; height: 32px; border: 1px solid var(--border); border-radius: var(--radius-sm);
        background: var(--surface); display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .15s; color: var(--muted);
      }
      .rm-nav-btn:hover { background: var(--bg); color: var(--ink); }

      .rm-mode-tabs { display: flex; gap: .35rem; }
      .rm-mode-tab {
        padding: .4rem .85rem; border-radius: 6px;
        border: 1px solid var(--border); background: var(--bg);
        font-size: .78rem; font-weight: 600; cursor: pointer;
        color: var(--muted); transition: all .15s;
      }
      .rm-mode-tab.active { background: var(--ink); color: #fff; border-color: var(--ink); }

      .rm-range-hint {
        text-align: center; font-size: .8rem; color: var(--orange);
        background: var(--orange-lt); border: 1px solid #fed7aa;
        border-radius: 6px; padding: .4rem; margin-bottom: .75rem;
        font-weight: 600;
      }

      .rm-weekdays {
        display: grid; grid-template-columns: repeat(7, 1fr); gap: .3rem;
        margin-bottom: .3rem;
      }
      .rm-weekday {
        text-align: center; font-size: .7rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: .05em; color: var(--muted); padding: .3rem 0;
      }

      /* Day grid */
      .rm-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: .3rem; }
      .rm-day {
        border-radius: var(--radius-sm); padding: .45rem .35rem;
        cursor: pointer; border: 1.5px solid transparent;
        display: flex; flex-direction: column; gap: 1px;
        position: relative; min-height: 64px;
        transition: transform .1s, box-shadow .1s, border-color .1s;
        user-select: none;
      }
      .rm-day--empty { cursor: default; min-height: 64px; background: transparent !important; }
      .rm-day--weekday {
        background: #f8fafc;
        border-color: #e2e8f0;
      }
      .rm-day--weekday:hover { border-color: #94a3b8; transform: scale(1.03); box-shadow: 0 2px 8px rgba(0,0,0,.08); }
      .rm-day--weekend {
        background: var(--weekend);
        border-color: #fde68a;
      }
      .rm-day--weekend:hover { border-color: var(--weekend-b); transform: scale(1.03); }
      .rm-day--override {
        background: var(--override) !important;
        border-color: var(--override-b) !important;
      }
      .rm-day--in-range {
        background: #e0f2fe !important;
        border-color: #38bdf8 !important;
      }
      .rm-day--range-start {
        background: #bfdbfe !important;
        border-color: #3b82f6 !important;
      }
      .rm-day--today {
        box-shadow: 0 0 0 2px var(--today-b) !important;
      }

      .rm-day-num { font-size: .8rem; font-weight: 800; color: var(--ink); line-height: 1; }
      .rm-day-rate {
        font-size: .72rem; font-weight: 700; color: #1e293b;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .rm-day--override .rm-day-rate { color: #15803d; }
      .rm-day-label {
        font-size: .58rem; color: #166534;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        font-weight: 600; letter-spacing: .02em;
      }
      .rm-day-dot {
        position: absolute; top: 5px; right: 5px;
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--override-b);
      }

      /* Legend */
      .rm-legend {
        display: flex; gap: 1.1rem; flex-wrap: wrap;
        margin-top: 1.1rem; padding-top: 1.1rem; border-top: 1px solid var(--border);
      }
      .rm-legend-item { display: flex; align-items: center; gap: .35rem; font-size: .75rem; color: var(--muted); }
      .rm-legend-swatch { width: 14px; height: 14px; border-radius: 3px; border: 1.5px solid; flex-shrink: 0; }
      .rm-legend-swatch--weekday  { background: #f8fafc;         border-color: #e2e8f0; }
      .rm-legend-swatch--weekend  { background: var(--weekend);  border-color: #fde68a; }
      .rm-legend-swatch--override { background: var(--override); border-color: var(--override-b); }
      .rm-legend-swatch--today    { background: var(--orange-lt);border-color: var(--orange); }

      /* Stats */
      .rm-stats {
        display: flex; align-items: center; margin-top: 1.1rem;
        background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;
      }
      .rm-stat { flex: 1; text-align: center; padding: .85rem .5rem; }
      .rm-stat-num { display: block; font-size: 1.5rem; font-weight: 800; letter-spacing: -.03em; }
      .rm-stat-num--orange { color: var(--orange); }
      .rm-stat-lbl { display: block; font-size: .68rem; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-top: .15rem; }
      .rm-stat-div { width: 1px; background: var(--border); align-self: stretch; }

      /* Overrides list */
      .rm-overrides-list { margin-top: 1.25rem; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
      .rm-overrides-head {
        display: flex; justify-content: space-between; align-items: center;
        padding: .65rem 1rem; background: var(--bg);
        font-size: .75rem; font-weight: 700; color: var(--muted);
        text-transform: uppercase; letter-spacing: .07em;
        border-bottom: 1px solid var(--border);
      }
      .rm-clear-btn {
        font-size: .72rem; color: #dc2626; background: none; border: none;
        cursor: pointer; font-weight: 600; padding: 0;
      }
      .rm-clear-btn:hover { text-decoration: underline; }
      .rm-overrides-rows { max-height: 240px; overflow-y: auto; }
      .rm-override-row {
        display: flex; align-items: center; gap: .6rem;
        padding: .6rem 1rem; border-bottom: 1px solid var(--border);
        font-size: .82rem;
      }
      .rm-override-row:last-child { border-bottom: none; }
      .rm-override-date { flex: 1; font-weight: 600; color: var(--ink); }
      .rm-wknd-chip { font-size: .6rem; background: var(--weekend); border: 1px solid #fde68a; border-radius: 4px; padding: 1px 5px; color: #92400e; margin-left: .3rem; font-weight: 700; }
      .rm-override-lbl { font-size: .7rem; color: #16a34a; background: var(--override); border: 1px solid #bbf7d0; border-radius: 4px; padding: 1px 6px; }
      .rm-override-price { font-weight: 700; color: var(--orange); white-space: nowrap; }
      .rm-override-del { background: none; border: none; cursor: pointer; color: #ef4444; opacity: .6; display: flex; align-items: center; padding: 2px; }
      .rm-override-del:hover { opacity: 1; }

      /* Sidebar */
      .rm-sidebar { display: flex; flex-direction: column; gap: 1.25rem; }

      .rm-card {
        background: var(--surface); border-radius: var(--radius);
        box-shadow: var(--shadow); padding: 1.5rem; border: 1px solid var(--border);
      }
      .rm-card--info { background: #eff6ff; border-color: #bfdbfe; }
      .rm-card-head { display: flex; align-items: center; gap: .65rem; margin-bottom: .6rem; }
      .rm-card-icon { width: 32px; height: 32px; background: var(--orange-lt); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--orange); flex-shrink: 0; }
      .rm-card-title { font-size: 1rem; font-weight: 700; margin: 0; }
      .rm-hint { font-size: .82rem; color: var(--muted); margin-bottom: 1rem; line-height: 1.5; }

      /* Bulk tabs */
      .rm-bulk-tabs { display: flex; gap: .35rem; margin-bottom: 1rem; }
      .rm-bulk-tab {
        flex: 1; padding: .45rem .4rem; border-radius: 6px;
        border: 1px solid var(--border); background: var(--bg);
        font-size: .75rem; font-weight: 600; cursor: pointer; color: var(--muted);
        transition: all .15s; text-align: center;
      }
      .rm-bulk-tab.active { background: var(--ink); color: #fff; border-color: var(--ink); }

      .rm-bulk-scope { font-size: .8rem; color: var(--muted); margin-bottom: .85rem; line-height: 1.5; }
      .rm-bulk-scope strong { color: var(--ink); }

      /* Form */
      .rm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
      .rm-field { display: flex; flex-direction: column; gap: .35rem; margin-bottom: .85rem; }
      .rm-field-label { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); }
      .rm-optional { font-weight: 400; text-transform: none; letter-spacing: 0; }
      .rm-input {
        padding: .65rem .8rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
        font-size: .9rem; color: var(--ink); background: var(--bg); font-family: inherit;
        transition: border-color .15s, box-shadow .15s; box-sizing: border-box; width: 100%;
      }
      .rm-input:focus { outline: none; border-color: var(--orange); box-shadow: 0 0 0 3px rgba(249,115,22,.1); }
      .rm-input--price { font-weight: 700; font-size: 1rem; }

      /* Buttons */
      .rm-btn {
        width: 100%; padding: .8rem; border: none; border-radius: var(--radius-sm);
        font-size: .9rem; font-weight: 700; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: .45rem;
        transition: all .2s; font-family: inherit;
      }
      .rm-btn:disabled { opacity: .5; cursor: not-allowed; }
      .rm-btn--primary { background: var(--orange); color: #fff; }
      .rm-btn--primary:hover:not(:disabled) { background: var(--orange-dk); }
      .rm-btn--ghost { background: var(--bg); color: #dc2626; border: 1.5px solid #fca5a5; }
      .rm-btn--ghost:hover:not(:disabled) { background: #fff1f2; }
      @keyframes rm-spin { to { transform: rotate(360deg); } }
      .rm-spin { animation: rm-spin .8s linear infinite; }

      /* Presets */
      .rm-presets { display: flex; flex-direction: column; gap: .45rem; }
      .rm-preset-btn {
        display: flex; justify-content: space-between; align-items: center;
        padding: .65rem .9rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
        background: var(--bg); cursor: pointer; transition: all .15s; text-align: left;
      }
      .rm-preset-btn:hover { border-color: var(--orange); background: var(--orange-lt); }
      .rm-preset-label { font-size: .82rem; font-weight: 600; color: var(--ink); }
      .rm-preset-price { font-size: .88rem; font-weight: 700; color: var(--orange); }

      /* Tier preview */
      .rm-tier-preview { display: flex; flex-wrap: wrap; gap: .35rem; }
      .rm-tier-chip { font-size: .72rem; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 5px; padding: 2px 8px; }

      /* Modal */
      .rm-overlay { position: fixed; inset: 0; background: rgba(28,25,23,.7); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
      .rm-modal { background: var(--surface); border-radius: var(--radius); width: 100%; max-width: 480px; padding: 1.75rem; border: 1px solid var(--border); box-shadow: 0 20px 60px rgba(0,0,0,.2); animation: rm-popIn .25s cubic-bezier(0.22,1,0.36,1); }
      @keyframes rm-popIn { from { opacity:0; transform:scale(.95) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
      .rm-modal-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .25rem; gap: .5rem; }
      .rm-modal-head h3 { font-size: 1.05rem; font-weight: 700; margin: 0; line-height: 1.3; }
      .rm-modal-close { background: none; border: none; cursor: pointer; color: var(--muted); display: flex; padding: 2px; }
      .rm-modal-hint { font-size: .8rem; color: var(--muted); margin-bottom: 1.25rem; }
      .rm-modal-actions { display: flex; gap: .65rem; margin-top: .5rem; }
      .rm-modal-actions .rm-btn { flex: 1; }

      /* Responsive */
      @media (max-width: 1100px) { .rm-body { grid-template-columns: 1fr; } .rm-sidebar { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); } }
      @media (max-width: 768px) {
        .rm-header { padding: 1rem; }
        .rm-body { padding: 1rem; gap: 1rem; }
        .rm-calendar-col { padding: 1rem; }
        .rm-card { padding: 1.1rem; }
        .rm-form-row { grid-template-columns: 1fr; }
        .rm-day { min-height: 52px; padding: .3rem .25rem; }
        .rm-day-num { font-size: .72rem; }
        .rm-day-rate { font-size: .65rem; }
        .rm-day-label { display: none; }
        .rm-mode-tabs { display: none; }
        .rm-sidebar { grid-template-columns: 1fr; }
      }
      @media (max-width: 480px) {
        .rm-day { min-height: 44px; }
        .rm-day-rate { display: none; }
      }
    `}</style>
  );
}
