"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────── Types ─────────────────────────── */

type PricingTier = {
  guests: number;
  price: number;
};

type Room = {
  id: string;
  name: string;
  max_guests: number;
  base_price: number;
  extra_guest_price?: number;
  pricing_tiers?: PricingTier[];
  description?: string;
  images?: string[];
  amenities?: string[];
  size?: string;
  view?: string;
  is_hall?: boolean;
  room_type?: string;
  created_at?: string;
};

const EMPTY_ROOM: Omit<Room, "id" | "created_at"> = {
  name: "",
  max_guests: 2,
  base_price: 0,
  extra_guest_price: 0,
  pricing_tiers: [],
  description: "",
  images: [],
  amenities: [],
  size: "",
  view: "",
  is_hall: false,
  room_type: "room",
};

/* ─────────────────────────── SVG Icons ─────────────────────────── */

function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconPlus({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconImage({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconEdit({ size = 15 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash({ size = 15 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IconHotel() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
      <rect x="9" y="9" width="2" height="2" />
      <rect x="13" y="9" width="2" height="2" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ra-spinner" aria-label="Loading">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ─────────────────────────── Component ─────────────────────────── */

export default function RoomsAdmin() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Room | null>(null);
  const [amenitiesRaw, setAmenitiesRaw] = useState("");
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRooms();
    const channel = supabase
      .channel("admin-rooms")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, loadRooms)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadRooms() {
    setLoading(true);
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setRooms(data);
    setLoading(false);
  }

  function openCreate() {
    setEditing({ id: "", ...EMPTY_ROOM });
    setAmenitiesRaw("");
    setPricingTiers([]);
    setMode("create");
  }

  function openEdit(room: Room) {
    setEditing({ ...room });
    setAmenitiesRaw((room.amenities || []).join(", "));
    setPricingTiers(room.pricing_tiers || []);
    setMode("edit");
  }

  function closeModal() {
    setMode(null);
    setEditing(null);
    setAmenitiesRaw("");
    setPricingTiers([]);
  }

  function setField<K extends keyof Room>(key: K, val: Room[K]) {
    setEditing(prev => prev ? { ...prev, [key]: val } : null);
  }

  function updatePriceTier(guestCount: number, price: number) {
    setPricingTiers(prev => {
      const filtered = prev.filter(t => t.guests !== guestCount);
      if (price > 0) {
        return [...filtered, { guests: guestCount, price }].sort((a, b) => a.guests - b.guests);
      }
      return filtered;
    });
  }

  function getPriceTier(guestCount: number): PricingTier | undefined {
    return pricingTiers.find(t => t.guests === guestCount);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const idx = editing.images?.length ?? 0;
    setUploadingIdx(idx);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `rooms/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("room-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (upErr) { alert(`Upload failed: ${upErr.message}`); return; }
      const { data: { publicUrl } } = supabase.storage.from("room-images").getPublicUrl(fileName);
      setEditing(prev => prev ? { ...prev, images: [...(prev.images || []), publicUrl] } : null);
    } catch {
      alert("Image upload failed");
    } finally {
      setUploadingIdx(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    setEditing(prev => {
      if (!prev) return null;
      const imgs = [...(prev.images || [])];
      imgs.splice(idx, 1);
      return { ...prev, images: imgs };
    });
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    const amenities = amenitiesRaw.split(",").map(s => s.trim()).filter(Boolean);
    const payload = {
      name: editing.name,
      max_guests: Number(editing.max_guests),
      base_price: Number(editing.base_price),
      extra_guest_price: Number(editing.extra_guest_price) || 0,
      pricing_tiers: pricingTiers,
      description: editing.description || null,
      images: editing.images || [],
      amenities,
      size: editing.size || null,
      view: editing.view || null,
      is_hall: editing.is_hall || false,
      room_type: editing.room_type || "room",
    };
    try {
      if (mode === "create") {
        const { error } = await supabase.from("rooms").insert(payload);
        if (error) { alert(`Failed to create: ${error.message}`); return; }
      } else {
        const { error } = await supabase.from("rooms").update(payload).eq("id", editing.id);
        if (error) { alert(`Failed to update: ${error.message}`); return; }
      }
      closeModal();
      await loadRooms();
    } catch {
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(room: Room) {
    if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("rooms").delete().eq("id", room.id);
    if (error) { alert(`Failed to delete: ${error.message}`); return; }
    await loadRooms();
  }

  /* ─── Render ─── */
  return (
    <>
      <PageStyles />
      <div className="ra-wrap">

        {/* Header */}
        <div className="ra-header">
          <div>
            <h1 className="ra-title">Rooms</h1>
            <p className="ra-subtitle">Manage your property listings with flexible pricing</p>
          </div>
          <button className="ra-create-btn" onClick={openCreate}>
            <IconPlus />
            <span>Add Room</span>
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="ra-loading">
            <IconSpinner />
            <p>Loading rooms…</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="ra-empty">
            <span className="ra-empty-icon"><IconHotel /></span>
            <h3>No rooms yet</h3>
            <p>Click "Add Room" to create your first listing</p>
          </div>
        ) : (
          <>
            {/* ── Desktop / tablet table ── */}
            <div className="ra-table-wrap">
              <table className="ra-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Guests</th>
                    <th>Size</th>
                    <th>View</th>
                    <th>Base Price</th>
                    <th>Extra/Guest</th>
                    <th>Images</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.id}>
                      <td>
                        <div className="ra-room-cell">
                          {room.images?.[0] && (
                            <div className="ra-thumb">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={room.images[0]} alt={room.name} />
                            </div>
                          )}
                          <div>
                            <div className="ra-room-name">{room.name}</div>
                            {room.description && (
                              <div className="ra-room-desc">
                                {room.description.slice(0, 60)}{room.description.length > 60 ? "…" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><span className="ra-pill">Up to {room.max_guests}</span></td>
                      <td><span className="ra-muted">{room.size || "—"}</span></td>
                      <td><span className="ra-muted">{room.view || "—"}</span></td>
                      <td><span className="ra-price">₹{room.base_price.toLocaleString()}</span></td>
                      <td>
                        {room.extra_guest_price && room.extra_guest_price > 0
                          ? <span className="ra-pill-success">+₹{room.extra_guest_price.toLocaleString()}/guest</span>
                          : <span className="ra-muted">—</span>
                        }
                      </td>
                      <td><span className="ra-pill">{room.images?.length ?? 0} photos</span></td>
                      <td>
                        <div className="ra-actions">
                          <button className="ra-edit-btn" onClick={() => openEdit(room)} title="Edit room">
                            <IconEdit /><span>Edit</span>
                          </button>
                          <button className="ra-delete-btn" onClick={() => handleDelete(room)} title="Delete room">
                            <IconTrash /><span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="ra-cards">
              {rooms.map(room => (
                <div key={room.id} className="ra-card">
                  {room.images?.[0] && (
                    <div className="ra-card-img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={room.images[0]} alt={room.name} />
                    </div>
                  )}
                  <div className="ra-card-body">
                    <div className="ra-card-top">
                      <span className="ra-room-name">{room.name}</span>
                      <span className="ra-price">₹{room.base_price.toLocaleString()}</span>
                    </div>
                    {room.description && (
                      <p className="ra-room-desc">
                        {room.description.slice(0, 80)}{room.description.length > 80 ? "…" : ""}
                      </p>
                    )}
                    <div className="ra-card-meta">
                      <span className="ra-pill">Up to {room.max_guests} guests</span>
                      {room.size && <span className="ra-muted">{room.size}</span>}
                      {room.view && <span className="ra-muted">{room.view}</span>}
                      <span className="ra-pill">{room.images?.length ?? 0} photos</span>
                      {room.extra_guest_price && room.extra_guest_price > 0 && (
                        <span className="ra-pill-success">+₹{room.extra_guest_price.toLocaleString()}/extra guest</span>
                      )}
                    </div>
                    <div className="ra-actions">
                      <button className="ra-edit-btn" onClick={() => openEdit(room)}>
                        <IconEdit /><span>Edit</span>
                      </button>
                      <button className="ra-delete-btn" onClick={() => handleDelete(room)}>
                        <IconTrash /><span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Modal ── */}
        {mode && editing && (
          <div className="ra-overlay" onClick={closeModal}>
            <div className="ra-modal" onClick={e => e.stopPropagation()}>

              <div className="ra-modal-header">
                <h2>{mode === "create" ? "Add New Room" : `Edit: ${editing.name}`}</h2>
                <button className="ra-close-btn" onClick={closeModal} aria-label="Close">
                  <IconClose size={16} />
                </button>
              </div>

              <div className="ra-modal-body">

                {/* Images */}
                <div className="ra-form-group">
                  <label>Images</label>
                  <div className="ra-images-grid">
                    {(editing.images || []).map((img, i) => (
                      <div key={i} className="ra-img-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Photo ${i + 1}`} />
                        <button
                          className="ra-img-remove"
                          onClick={() => removeImage(i)}
                          type="button"
                          aria-label={`Remove photo ${i + 1}`}
                        >
                          <IconClose size={10} />
                        </button>
                      </div>
                    ))}
                    <label className="ra-img-add">
                      {uploadingIdx !== null
                        ? <IconSpinner />
                        : <><IconImage /><span>Add Photo</span></>
                      }
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingIdx !== null}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>

                {/* Name + Max Guests */}
                <div className="ra-form-row">
                  <div className="ra-form-group">
                    <label>Room Name *</label>
                    <input
                      type="text"
                      value={editing.name}
                      onChange={e => setField("name", e.target.value)}
                      placeholder="e.g., Deluxe Sea View Suite"
                    />
                  </div>
                  <div className="ra-form-group">
                    <label>Max Guests *</label>
                    <input
                      type="number"
                      value={editing.max_guests}
                      onChange={e => setField("max_guests", Number(e.target.value))}
                      min={1}
                      max={50}
                    />
                  </div>
                </div>

                {/* Room Type */}
                <div className="ra-form-group">
                  <label>Room Type</label>
                  <div className="ra-room-type-toggle">
                    <label className="ra-radio-label">
                      <input
                        type="radio"
                        name="room_type"
                        checked={!editing.is_hall}
                        onChange={() => {
                          setField("is_hall", false);
                          setField("room_type", "room");
                        }}
                      />
                      <span>Regular Room</span>
                      <small>For 1-10 guests</small>
                    </label>
                    <label className="ra-radio-label">
                      <input
                        type="radio"
                        name="room_type"
                        checked={editing.is_hall === true}
                        onChange={() => {
                          setField("is_hall", true);
                          setField("room_type", "hall");
                        }}
                      />
                      <span>Hall (Big Families)</span>
                      <small>Recommended for 11+ guests only</small>
                    </label>
                  </div>
                  <small className="ra-help-text">
                    {editing.is_hall
                      ? "⚠️ This hall will ONLY be shown to guests booking 11 or more people"
                      : "Regular rooms are shown to all guests based on capacity"}
                  </small>
                </div>

                {/* Base Price + Room Size */}
                <div className="ra-form-row">
                  <div className="ra-form-group">
                    <label>Base Price (₹) *</label>
                    <input
                      type="number"
                      value={editing.base_price}
                      onChange={e => setField("base_price", Number(e.target.value))}
                      placeholder="e.g., 2500"
                      min={0}
                    />
                    <small>Price for up to 2 guests</small>
                  </div>
                  <div className="ra-form-group">
                    <label>Room Size</label>
                    <input
                      type="text"
                      value={editing.size || ""}
                      onChange={e => setField("size", e.target.value)}
                      placeholder="e.g., 450 sq ft"
                    />
                  </div>
                </div>

                {/* Extra Guest Price */}
                <div className="ra-form-group">
                  <label>
                    Extra Guest Price (₹ per person beyond 2)
                    <span className="ra-label-info">
                      charged for each guest after the 2nd
                    </span>
                  </label>
                  <div className="ra-extra-guest-wrap">
                    <input
                      type="number"
                      value={editing.extra_guest_price ?? 0}
                      onChange={e => setField("extra_guest_price", Number(e.target.value))}
                      placeholder="e.g. 500"
                      min={0}
                    />
                    {editing.extra_guest_price && editing.extra_guest_price > 0 ? (
                      <div className="ra-price-preview">
                        <span>Preview:</span>
                        {[2, 3, 4, 5].map(g => (
                          <span key={g} className="ra-preview-chip">
                            {g}g → ₹{(Number(editing.base_price) + Math.max(0, g - 2) * Number(editing.extra_guest_price)).toLocaleString()}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <small>Set to 0 to charge the same price regardless of guest count</small>
                </div>

                {/* View */}
                <div className="ra-form-group">
                  <label>View</label>
                  <input
                    type="text"
                    value={editing.view || ""}
                    onChange={e => setField("view", e.target.value)}
                    placeholder="e.g., Sea View, Garden View, Pool View"
                  />
                </div>

                {/* Description */}
                <div className="ra-form-group">
                  <label>Description</label>
                  <textarea
                    value={editing.description || ""}
                    onChange={e => setField("description", e.target.value)}
                    placeholder="Describe the room…"
                    rows={4}
                  />
                </div>

                {/* Amenities */}
                <div className="ra-form-group">
                  <label>Amenities</label>
                  <textarea
                    value={amenitiesRaw}
                    onChange={e => setAmenitiesRaw(e.target.value)}
                    placeholder="Air Conditioning, Free WiFi, Mini Bar, Room Service"
                    rows={3}
                  />
                  <small>Separate each amenity with a comma</small>
                </div>

              </div>

              <div className="ra-modal-footer">
                <button className="ra-cancel-btn" onClick={closeModal}>Cancel</button>
                <button
                  className="ra-save-btn"
                  onClick={handleSave}
                  disabled={saving || !editing.name}
                >
                  {saving ? "Saving…" : mode === "create" ? "Create Room" : "Save Changes"}
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

function PageStyles() {
  return (
    <style>{`
      .ra-wrap { max-width: 1400px; margin: 0 auto; }

      .ra-header {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
      }
      .ra-title {
        font-size: clamp(1.6rem, 4vw, 2.5rem); font-weight: 800;
        background: linear-gradient(135deg, #fff, #f97316);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text; margin: 0 0 0.25rem;
      }
      .ra-subtitle { color: #94a3b8; font-size: 1rem; margin: 0; }

      .ra-create-btn {
        display: inline-flex; align-items: center; gap: 0.375rem;
        padding: 0.8rem 1.3rem;
        background: linear-gradient(135deg, #f97316, #ea580c);
        color: white; border: none; border-radius: 9px;
        font-size: 0.875rem; font-weight: 600; cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s; white-space: nowrap; flex-shrink: 0;
      }
      .ra-create-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(249,115,22,0.4); }

      .ra-loading {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; min-height: 300px; gap: 1rem; color: #94a3b8;
      }
      @keyframes ra-spin { to { transform: rotate(360deg); } }
      .ra-spinner { animation: ra-spin 0.9s linear infinite; transform-origin: center; }

      .ra-empty {
        text-align: center; padding: 5rem 2rem;
        border: 1px dashed rgba(249,115,22,0.2); border-radius: 16px;
      }
      .ra-empty-icon { display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; opacity: 0.35; color: #f97316; }
      .ra-empty h3 { color: white; margin-bottom: 0.5rem; font-size: 1.3rem; }
      .ra-empty p  { color: #64748b; }

      .ra-table-wrap { overflow-x: auto; border-radius: 16px; border: 1px solid rgba(249,115,22,0.15); }
      .ra-table { width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.03); border-radius: 16px; overflow: hidden; }
      .ra-table th {
        padding: 1rem 1.25rem; text-align: left; font-size: 0.78rem; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase; color: #f97316;
        background: rgba(249,115,22,0.06); border-bottom: 1px solid rgba(249,115,22,0.15); white-space: nowrap;
      }
      .ra-table td {
        padding: 1rem 1.25rem; color: #cbd5e1;
        border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle;
      }
      .ra-table tbody tr:last-child td { border-bottom: none; }
      .ra-table tbody tr:hover td { background: rgba(249,115,22,0.04); }

      .ra-room-cell { display: flex; align-items: center; gap: 0.875rem; }
      .ra-thumb { width: 56px; height: 44px; border-radius: 6px; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(249,115,22,0.2); }
      .ra-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .ra-room-name { font-weight: 600; color: #f0f4f8; font-size: 0.95rem; }
      .ra-room-desc { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; }

      .ra-pill { display: inline-block; padding: 0.3rem 0.75rem; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2); border-radius: 100px; font-size: 0.8rem; color: #f97316; white-space: nowrap; }
      .ra-pill-success { display: inline-block; padding: 0.3rem 0.75rem; background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25); border-radius: 100px; font-size: 0.8rem; color: #22c55e; white-space: nowrap; }
      .ra-muted  { color: #64748b; font-size: 0.88rem; }
      .ra-price  { font-size: 1.1rem; font-weight: 700; color: #f97316; }

      .ra-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
      .ra-edit-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.875rem; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); border-radius: 6px; color: #60a5fa; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
      .ra-edit-btn:hover { background: rgba(59,130,246,0.25); }
      .ra-delete-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.875rem; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 6px; color: #f87171; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
      .ra-delete-btn:hover { background: rgba(239,68,68,0.2); }

      .ra-cards { display: none; flex-direction: column; gap: 1rem; }
      .ra-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(249,115,22,0.15); border-radius: 14px; overflow: hidden; }
      .ra-card-img { height: 160px; overflow: hidden; }
      .ra-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .ra-card-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
      .ra-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; flex-wrap: wrap; }
      .ra-card-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }

      .ra-overlay { position: fixed; inset: 0; background: rgba(4,7,15,0.88); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; overflow-y: auto; }
      .ra-modal { background: linear-gradient(145deg, #0f172a, #0a1018); border: 1px solid rgba(249,115,22,0.25); border-radius: 20px; max-width: 720px; width: 100%; max-height: 92vh; overflow-y: auto; animation: ra-slideUp 0.3s cubic-bezier(0.22,1,0.36,1); }
      @keyframes ra-slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      .ra-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid rgba(249,115,22,0.15); position: sticky; top: 0; background: linear-gradient(145deg, #0f172a, #0a1018); z-index: 1; border-radius: 20px 20px 0 0; }
      .ra-modal-header h2 { color: #f97316; margin: 0; font-size: 1.35rem; }
      .ra-close-btn { width: 34px; height: 34px; border-radius: 50%; border: none; background: rgba(239,68,68,0.15); color: #f87171; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s, transform 0.2s; flex-shrink: 0; }
      .ra-close-btn:hover { background: rgba(239,68,68,0.3); transform: rotate(90deg); }
      .ra-modal-body { padding: 1.5rem; }
      .ra-modal-footer { display: flex; justify-content: flex-end; gap: 0.875rem; padding: 1.25rem 1.5rem; border-top: 1px solid rgba(249,115,22,0.15); position: sticky; bottom: 0; background: linear-gradient(145deg, #0f172a, #0a1018); border-radius: 0 0 20px 20px; }

      .ra-form-group { margin-bottom: 1.25rem; }
      .ra-form-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .ra-form-group label { display: block; margin-bottom: 0.45rem; color: #94a3b8; font-size: 0.88rem; font-weight: 600; }
      .ra-label-info { font-weight: 400; font-size: 0.78rem; color: #64748b; margin-left: 0.5rem; }
      .ra-form-group input,
      .ra-form-group textarea { width: 100%; padding: 0.8rem 1rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(249,115,22,0.2); border-radius: 8px; color: white; font-size: 0.95rem; font-family: inherit; transition: border-color 0.2s; box-sizing: border-box; }
      .ra-form-group input:focus,
      .ra-form-group textarea:focus { outline: none; border-color: #f97316; background: rgba(255,255,255,0.09); }
      .ra-form-group textarea { resize: vertical; }
      .ra-form-group small { color: #64748b; font-size: 0.8rem; display: block; margin-top: 0.4rem; }

      /* Extra guest price preview */
      .ra-extra-guest-wrap { display: flex; flex-direction: column; gap: 0.65rem; }
      .ra-price-preview { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding: 0.6rem 0.75rem; background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.15); border-radius: 8px; }
      .ra-price-preview span:first-child { font-size: 0.75rem; color: #64748b; font-weight: 600; }
      .ra-preview-chip { font-size: 0.78rem; color: #f97316; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); border-radius: 5px; padding: 2px 8px; font-weight: 600; }

      /* Room type toggle */
      .ra-room-type-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.5rem; }
      .ra-radio-label { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; background: rgba(255,255,255,0.04); border: 2px solid rgba(249,115,22,0.2); border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
      .ra-radio-label:hover { background: rgba(255,255,255,0.06); border-color: rgba(249,115,22,0.4); }
      .ra-radio-label input[type="radio"] { width: 18px; height: 18px; cursor: pointer; accent-color: #f97316; }
      .ra-radio-label:has(input:checked) { background: rgba(249,115,22,0.12); border-color: #f97316; }
      .ra-radio-label span { font-size: 0.95rem; font-weight: 600; color: #cbd5e1; transition: color 0.2s; }
      .ra-radio-label small { color: #64748b !important; font-size: 0.75rem !important; margin-top: 0 !important; }
      .ra-help-text { display: block; padding: 0.75rem; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); border-radius: 8px; color: #60a5fa; font-size: 0.8rem; line-height: 1.4; margin-top: 0.5rem !important; }

      /* Image grid */
      .ra-images-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }
      .ra-img-thumb { position: relative; width: 88px; height: 68px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(249,115,22,0.25); flex-shrink: 0; }
      .ra-img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .ra-img-remove { position: absolute; top: 3px; right: 3px; width: 20px; height: 20px; border-radius: 50%; background: rgba(239,68,68,0.85); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
      .ra-img-add { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem; width: 88px; height: 68px; border: 1.5px dashed rgba(249,115,22,0.3); border-radius: 8px; cursor: pointer; color: #f97316; font-size: 0.72rem; font-weight: 600; text-align: center; transition: border-color 0.2s, background 0.2s; flex-shrink: 0; }
      .ra-img-add:hover { border-color: #f97316; background: rgba(249,115,22,0.06); }

      .ra-cancel-btn { padding: 0.8rem 1.5rem; border-radius: 8px; background: rgba(100,116,139,0.15); border: 1px solid rgba(100,116,139,0.25); color: #94a3b8; font-weight: 600; cursor: pointer; transition: background 0.2s; }
      .ra-cancel-btn:hover { background: rgba(100,116,139,0.25); }
      .ra-save-btn { padding: 0.8rem 1.75rem; border-radius: 8px; background: linear-gradient(135deg, #f97316, #ea580c); border: none; color: white; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
      .ra-save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(249,115,22,0.4); }
      .ra-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      @media (max-width: 968px) {
        .ra-table th:nth-child(3), .ra-table td:nth-child(3),
        .ra-table th:nth-child(4), .ra-table td:nth-child(4) { display: none; }
      }
      @media (max-width: 640px) {
        .ra-table-wrap { display: none; }
        .ra-cards { display: flex; }
        .ra-form-row { grid-template-columns: 1fr; }
        .ra-modal { border-radius: 16px; }
        .ra-modal-header { border-radius: 16px 16px 0 0; }
        .ra-modal-footer { border-radius: 0 0 16px 16px; flex-direction: column-reverse; }
        .ra-cancel-btn, .ra-save-btn { width: 100%; text-align: center; }
        .ra-room-type-toggle { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
