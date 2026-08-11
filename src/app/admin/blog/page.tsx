"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────── Types ─────────────────────────── */

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  tags: string[];
  cover_image_url: string | null;
  author: string;
  cover_color: string;
  accent_color: string;
  featured: boolean;
  published: boolean;
  read_time: string;
  word_count: number;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_description: string | null;
  meta_keywords: string[];
};

type ModalMode = "create" | "edit" | "preview" | null;

const CATEGORIES = [
  "Travel Guide",
  "Getting There",
  "Family Travel",
  "Couples",
  "Beaches",
  "Planning",
  "Sightseeing",
  "Food & Drink",
];

const COLOR_PRESETS = [
  { cover: "#f97316", accent: "#fbbf24", label: "Orange" },
  { cover: "#0ea5e9", accent: "#14b8a6", label: "Sky" },
  { cover: "#22c55e", accent: "#4ade80", label: "Green" },
  { cover: "#f43f5e", accent: "#fb7185", label: "Rose" },
  { cover: "#06b6d4", accent: "#3b82f6", label: "Cyan" },
  { cover: "#8b5cf6", accent: "#a78bfa", label: "Violet" },
  { cover: "#f59e0b", accent: "#f97316", label: "Amber" },
  { cover: "#ef4444", accent: "#fb923c", label: "Red" },
];

const EMPTY_POST: Omit<BlogPost, "id" | "created_at" | "updated_at" | "views"> = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  category: "Travel Guide",
  tags: [],
  cover_image_url: null,
  author: "Sukhakarta Team",
  cover_color: "#f97316",
  accent_color: "#fbbf24",
  featured: false,
  published: false,
  read_time: "5 min read",
  word_count: 0,
  published_at: null,
  meta_description: "",
  meta_keywords: [],
};

/* ─────────────────────────── Helpers ─────────────────────────── */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function estimateReadTime(text: string): { readTime: string; wordCount: number } {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return { readTime: `${minutes} min read`, wordCount };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Splits a raw string on commas into clean, deduped, lowercase tokens. */
function splitTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/* ─────────────────────────── SVG Icons ─────────────────────────── */

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
function IconSpinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="bl-spin" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function IconBlog() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

/* ─────────────────────────── Cover Preview ─────────────────────────── */

function CoverPreview({ post }: { post: Partial<BlogPost> }) {
  return (
    <div
      className="bl-cover-preview"
      style={{
        background: `radial-gradient(ellipse at 30% 30%, ${post.accent_color ?? "#fbbf24"}40 0%, ${post.cover_color ?? "#f97316"}28 40%, rgba(4,7,15,0.88) 100%)`,
      }}
    >
      <div className="bl-cover-grid" />
      <div
        className="bl-cover-circle"
        style={{ borderColor: `${post.cover_color ?? "#f97316"}25` }}
      />
      <span
        className="bl-cover-cat"
        style={{ color: post.cover_color ?? "#f97316", borderColor: `${post.cover_color ?? "#f97316"}30`, background: `${post.cover_color ?? "#f97316"}12` }}
      >
        {post.category ?? "Category"}
      </span>
    </div>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────── */

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [metaKeywordInput, setMetaKeywordInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [toast, setToast] = useState({ type: "", text: "" });
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── load ── */
  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
    const channel = supabase
      .channel("admin-blog-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, loadPosts)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadPosts]);

  /* ── toast ── */
  useEffect(() => {
    if (!toast.text) return;
    const t = setTimeout(() => setToast({ type: "", text: "" }), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type: string, text: string) => setToast({ type, text });

  /* ── open modals ── */
  function openCreate() {
    setEditing({ ...EMPTY_POST });
    setTagInput("");
    setMetaKeywordInput("");
    setModalMode("create");
  }

  function openEdit(post: BlogPost) {
    setEditing({ ...post });
    setTagInput("");
    setMetaKeywordInput("");
    setModalMode("edit");
  }

  function openPreview(post: BlogPost) {
    setEditing({ ...post });
    setModalMode("preview");
  }

  function closeModal() {
    setModalMode(null);
    setEditing(null);
    setTagInput("");
    setMetaKeywordInput("");
  }

  /* ── field helpers ── */
  function setField<K extends keyof BlogPost>(key: K, val: BlogPost[K]) {
    setEditing((prev) => {
      if (!prev) return null;
      const next: Partial<BlogPost> = { ...prev, [key]: val };
      if (key === "title" && modalMode === "create") {
        next.slug = slugify(val as string);
      }
      if (key === "content" && typeof val === "string") {
        const { readTime, wordCount } = estimateReadTime(val);
        next.read_time = readTime;
        next.word_count = wordCount;
      }
      return next;
    });
  }

  /* ── tags ──
     Accepts either a single tag or a comma-separated batch (typed or pasted)
     and adds every non-empty, deduped piece in one go. */
  function addTag(raw?: string) {
    const pieces = splitTags(raw ?? tagInput);
    if (pieces.length === 0) { setTagInput(""); return; }
    setEditing((prev) => {
      if (!prev) return prev;
      const existing = prev.tags ?? [];
      const merged = Array.from(new Set([...existing, ...pieces]));
      return { ...prev, tags: merged };
    });
    setTagInput("");
  }
  function removeTag(tag: string) {
    setField("tags", (editing?.tags ?? []).filter((t) => t !== tag));
  }

  /* ── meta keywords (same batch-paste behavior as tags) ── */
  function addMetaKeyword(raw?: string) {
    const pieces = splitTags(raw ?? metaKeywordInput);
    if (pieces.length === 0) { setMetaKeywordInput(""); return; }
    setEditing((prev) => {
      if (!prev) return prev;
      const existing = prev.meta_keywords ?? [];
      const merged = Array.from(new Set([...existing, ...pieces]));
      return { ...prev, meta_keywords: merged };
    });
    setMetaKeywordInput("");
  }
  function removeMetaKeyword(kw: string) {
    setField("meta_keywords", (editing?.meta_keywords ?? []).filter((k) => k !== kw));
  }

  /* ── image upload ── */
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("blog-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) { showToast("error", `Upload failed: ${upErr.message}`); return; }
      const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(path);
      setEditing((prev) => prev ? { ...prev, cover_image_url: publicUrl } : null);
      showToast("success", "Cover image uploaded");
    } catch {
      showToast("error", "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  /* ── save ── */
  async function handleSave() {
    if (!editing) return;
    if (!editing.title?.trim()) { showToast("error", "Title is required"); return; }
    if (!editing.slug?.trim()) { showToast("error", "Slug is required"); return; }
    setSaving(true);
    const payload = {
      slug:             editing.slug?.trim(),
      title:            editing.title?.trim(),
      excerpt:          editing.excerpt?.trim() || null,
      content:          editing.content?.trim() || null,
      category:         editing.category ?? "Travel Guide",
      tags:             editing.tags ?? [],
      cover_image_url:  editing.cover_image_url || null,
      author:           editing.author?.trim() || "Sukhakarta Team",
      cover_color:      editing.cover_color ?? "#f97316",
      accent_color:     editing.accent_color ?? "#fbbf24",
      featured:         editing.featured ?? false,
      published:        editing.published ?? false,
      read_time:        editing.read_time ?? "5 min read",
      word_count:       editing.word_count ?? 0,
      meta_description: editing.meta_description?.trim() || null,
      meta_keywords:    editing.meta_keywords ?? [],
    };
    try {
      if (modalMode === "create") {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        showToast("success", "Post created successfully");
      } else {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id!);
        if (error) throw error;
        showToast("success", "Post updated successfully");
      }
      closeModal();
      await loadPosts();
    } catch (e: unknown) {
      showToast("error", (e as Error).message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  /* ── toggle published ── */
  async function togglePublished(post: BlogPost) {
    const { error } = await supabase
      .from("blog_posts")
      .update({ published: !post.published })
      .eq("id", post.id);
    if (error) { showToast("error", "Failed to update status"); return; }
    showToast("success", post.published ? "Post unpublished" : "Post published");
    await loadPosts();
  }

  /* ── delete ── */
  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", deleteTarget.id);
    if (error) { showToast("error", "Failed to delete post"); return; }
    showToast("success", "Post deleted");
    setDeleteTarget(null);
    await loadPosts();
  }

  /* ── filtered list ── */
  const filtered = posts.filter((p) => {
    if (filterStatus === "published" && !p.published) return false;
    if (filterStatus === "draft" && p.published) return false;
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !(p.excerpt ?? "").toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q) &&
        !p.tags.some((t) => t.includes(q))
      )
        return false;
    }
    return true;
  });

  const stats = {
    total:     posts.length,
    published: posts.filter((p) => p.published).length,
    draft:     posts.filter((p) => !p.published).length,
    featured:  posts.filter((p) => p.featured).length,
  };

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <>
      <BLStyles />

      <div className="bl-page">

        {/* Toast */}
        {toast.text && (
          <div className={`bl-toast bl-toast--${toast.type}`} role="status">
            {toast.type === "success" ? "✓" : "✕"} {toast.text}
          </div>
        )}

        {/* Header */}
        <div className="bl-header">
          <div>
            <h1 className="bl-title">Blog Management</h1>
            <p className="bl-subtitle">Create, edit and publish travel articles</p>
          </div>
          <button className="bl-create-btn" onClick={openCreate}>
            <IconPlus /> <span>New Post</span>
          </button>
        </div>

        {/* Stats */}
        <div className="bl-stats-row">
          {[
            { label: "Total Posts",  val: stats.total,     color: "#f97316" },
            { label: "Published",    val: stats.published, color: "#22c55e" },
            { label: "Drafts",       val: stats.draft,     color: "#fbbf24" },
            { label: "Featured",     val: stats.featured,  color: "#a78bfa" },
          ].map((s) => (
            <div className="bl-stat" key={s.label} style={{ "--ac": s.color } as React.CSSProperties}>
              <span className="bl-stat-num">{s.val}</span>
              <span className="bl-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bl-toolbar">
          <div className="bl-search-wrap">
            <IconSearch />
            <input
              type="search"
              className="bl-search"
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="bl-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="bl-filter-group">
            {(["all", "published", "draft"] as const).map((s) => (
              <button
                key={s}
                className={`bl-filter-btn${filterStatus === s ? " active" : ""}`}
                onClick={() => setFilterStatus(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <select
            className="bl-cat-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bl-loading">
            <IconSpinner />
            <p>Loading posts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bl-empty">
            <span className="bl-empty-icon"><IconBlog /></span>
            <h3>{posts.length === 0 ? "No posts yet" : "No posts match your filters"}</h3>
            <p>{posts.length === 0 ? "Click 'New Post' to create your first article" : "Try adjusting search or filters"}</p>
            {posts.length === 0 && (
              <button className="bl-create-btn" onClick={openCreate} style={{ marginTop: "1rem" }}>
                <IconPlus /> Create First Post
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="bl-table-wrap">
              <table className="bl-table">
                <thead>
                  <tr>
                    <th>Post</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Read Time</th>
                    <th>Views</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <div className="bl-post-cell">
                          <CoverPreview post={post} />
                          <div className="bl-post-info">
                            <span className="bl-post-title">{post.title}</span>
                            <span className="bl-post-slug">/{post.slug}</span>
                            {post.featured && (
                              <span className="bl-featured-chip"><IconStar /> Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="bl-cat-badge"
                          style={{ color: post.cover_color, background: `${post.cover_color}12`, borderColor: `${post.cover_color}28` }}
                        >
                          {post.category}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`bl-status-badge${post.published ? " bl-status-badge--pub" : ""}`}
                          onClick={() => togglePublished(post)}
                          title="Click to toggle"
                        >
                          {post.published ? <><IconGlobe /> Published</> : <><IconLock /> Draft</>}
                        </button>
                      </td>
                      <td><span className="bl-muted">{post.read_time}</span></td>
                      <td><span className="bl-muted">{post.views.toLocaleString()}</span></td>
                      <td>
                        <span className="bl-muted">
                          {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                        </span>
                      </td>
                      <td>
                        <div className="bl-row-actions">
                          <button className="bl-action-btn bl-action-btn--view" onClick={() => openPreview(post)} title="Preview">
                            <IconEye />
                          </button>
                          <button className="bl-action-btn bl-action-btn--edit" onClick={() => openEdit(post)} title="Edit">
                            <IconEdit />
                          </button>
                          <button className="bl-action-btn bl-action-btn--del" onClick={() => setDeleteTarget(post)} title="Delete">
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="bl-cards">
              {filtered.map((post) => (
                <div key={post.id} className="bl-card">
                  <div className="bl-card-top">
                    <CoverPreview post={post} />
                    <div className="bl-card-info">
                      <div className="bl-card-meta-row">
                        <span
                          className="bl-cat-badge"
                          style={{ color: post.cover_color, background: `${post.cover_color}12`, borderColor: `${post.cover_color}28` }}
                        >
                          {post.category}
                        </span>
                        <button
                          className={`bl-status-badge${post.published ? " bl-status-badge--pub" : ""}`}
                          onClick={() => togglePublished(post)}
                        >
                          {post.published ? <><IconGlobe /> Published</> : <><IconLock /> Draft</>}
                        </button>
                      </div>
                      <span className="bl-post-title">{post.title}</span>
                      <div className="bl-card-sub">
                        <span className="bl-muted">{post.read_time}</span>
                        <span className="bl-muted">·</span>
                        <span className="bl-muted">{post.views} views</span>
                        {post.featured && <span className="bl-featured-chip"><IconStar /> Featured</span>}
                      </div>
                    </div>
                  </div>
                  <div className="bl-card-actions">
                    <button className="bl-card-act-btn" onClick={() => openPreview(post)}>
                      <IconEye /> Preview
                    </button>
                    <button className="bl-card-act-btn bl-card-act-btn--edit" onClick={() => openEdit(post)}>
                      <IconEdit /> Edit
                    </button>
                    <button className="bl-card-act-btn bl-card-act-btn--del" onClick={() => setDeleteTarget(post)}>
                      <IconTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ════════ CREATE / EDIT MODAL ════════ */}
      {(modalMode === "create" || modalMode === "edit") && editing && (
        <div className="bl-overlay" onClick={closeModal}>
          <div className="bl-modal bl-modal--form" onClick={(e) => e.stopPropagation()}>

            <div className="bl-modal-header">
              <h2>{modalMode === "create" ? "New Blog Post" : "Edit Post"}</h2>
              <button className="bl-close-btn" onClick={closeModal} aria-label="Close"><IconClose /></button>
            </div>

            <div className="bl-modal-body">

              {/* Cover Preview */}
              <div className="bl-form-section">
                <label className="bl-label">Cover Appearance</label>
                <div className="bl-cover-wrap">
                  <div className="bl-cover-large">
                    <CoverPreview post={editing} />
                    {editing.cover_image_url && (
                      <img src={editing.cover_image_url} alt="Cover" className="bl-cover-img" />
                    )}
                  </div>
                  <div className="bl-cover-controls">
                    <div className="bl-form-group">
                      <label className="bl-label">Color Presets</label>
                      <div className="bl-color-presets">
                        {COLOR_PRESETS.map((p) => (
                          <button
                            key={p.label}
                            className={`bl-color-dot${editing.cover_color === p.cover ? " active" : ""}`}
                            style={{ background: `linear-gradient(135deg, ${p.cover}, ${p.accent})` }}
                            title={p.label}
                            onClick={() => {
                              setField("cover_color", p.cover as BlogPost["cover_color"]);
                              setField("accent_color", p.accent as BlogPost["accent_color"]);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="bl-form-row-2">
                      <div className="bl-form-group">
                        <label className="bl-label">Cover Color</label>
                        <div className="bl-color-input-wrap">
                          <input type="color" className="bl-color-picker" value={editing.cover_color ?? "#f97316"} onChange={(e) => setField("cover_color", e.target.value as BlogPost["cover_color"])} />
                          <input type="text" className="bl-input bl-input--sm" value={editing.cover_color ?? "#f97316"} onChange={(e) => setField("cover_color", e.target.value as BlogPost["cover_color"])} />
                        </div>
                      </div>
                      <div className="bl-form-group">
                        <label className="bl-label">Accent Color</label>
                        <div className="bl-color-input-wrap">
                          <input type="color" className="bl-color-picker" value={editing.accent_color ?? "#fbbf24"} onChange={(e) => setField("accent_color", e.target.value as BlogPost["accent_color"])} />
                          <input type="text" className="bl-input bl-input--sm" value={editing.accent_color ?? "#fbbf24"} onChange={(e) => setField("accent_color", e.target.value as BlogPost["accent_color"])} />
                        </div>
                      </div>
                    </div>
                    <div className="bl-form-group">
                      <label className="bl-label">Cover Image <span className="bl-optional">(optional)</span></label>
                      <label className="bl-upload-btn">
                        {uploading ? <><IconSpinner /> Uploading…</> : <><IconUpload /> Upload Image</>}
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: "none" }} />
                      </label>
                      {editing.cover_image_url && (
                        <button className="bl-remove-img-btn" onClick={() => setField("cover_image_url", null as unknown as BlogPost["cover_image_url"])}>
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="bl-form-group">
                <label className="bl-label">Title *</label>
                <input
                  type="text"
                  className="bl-input"
                  placeholder="e.g. Best Places to Visit in Alibag"
                  value={editing.title ?? ""}
                  onChange={(e) => setField("title", e.target.value)}
                />
              </div>

              {/* Slug */}
              <div className="bl-form-group">
                <label className="bl-label">Slug * <span className="bl-optional">(URL-friendly)</span></label>
                <div className="bl-slug-wrap">
                  <span className="bl-slug-prefix">/blog/</span>
                  <input
                    type="text"
                    className="bl-input bl-input--slug"
                    placeholder="best-places-to-visit-alibag"
                    value={editing.slug ?? ""}
                    onChange={(e) => setField("slug", slugify(e.target.value))}
                  />
                </div>
              </div>

              {/* Category + Author */}
              <div className="bl-form-row-2">
                <div className="bl-form-group">
                  <label className="bl-label">Category *</label>
                  <select className="bl-input bl-select" value={editing.category ?? "Travel Guide"} onChange={(e) => setField("category", e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="bl-form-group">
                  <label className="bl-label">Author</label>
                  <input type="text" className="bl-input" value={editing.author ?? ""} onChange={(e) => setField("author", e.target.value)} placeholder="Sukhakarta Team" />
                </div>
              </div>

              {/* Excerpt */}
              <div className="bl-form-group">
                <label className="bl-label">Excerpt <span className="bl-optional">(shown on blog card)</span></label>
                <textarea
                  className="bl-input bl-textarea"
                  rows={3}
                  placeholder="A short compelling summary of the article…"
                  value={editing.excerpt ?? ""}
                  onChange={(e) => setField("excerpt", e.target.value)}
                />
                <span className="bl-char-count">{(editing.excerpt ?? "").length} / 300</span>
              </div>

              {/* Content */}
              <div className="bl-form-group">
                <label className="bl-label">
                  Content <span className="bl-optional">(Markdown supported)</span>
                  {editing.word_count ? (
                    <span className="bl-wc-badge">{editing.word_count} words · {editing.read_time}</span>
                  ) : null}
                </label>
                <textarea
                  className="bl-input bl-textarea bl-textarea--content"
                  rows={14}
                  placeholder="Write your article here. Markdown is supported.&#10;&#10;## Heading&#10;&#10;Your content goes here…"
                  value={editing.content ?? ""}
                  onChange={(e) => setField("content", e.target.value)}
                />
              </div>

              {/* Tags */}
              <div className="bl-form-group">
                <label className="bl-label">Tags <span className="bl-optional">(comma-separated paste supported)</span></label>
                <div className="bl-tag-input-row">
                  <input
                    type="text"
                    className="bl-input"
                    placeholder="Add tags, comma-separated…"
                    value={tagInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      // A comma (typed or pasted) commits every piece before it.
                      if (val.includes(",")) {
                        addTag(val);
                      } else {
                        setTagInput(val);
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  />
                  <button className="bl-add-tag-btn" onClick={() => addTag()} type="button">Add</button>
                </div>
                {(editing.tags ?? []).length > 0 && (
                  <div className="bl-tags-list">
                    {(editing.tags ?? []).map((tag) => (
                      <span key={tag} className="bl-tag">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="bl-tag-remove">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SEO Meta Description */}
              <div className="bl-form-group">
                <label className="bl-label">Meta Description <span className="bl-optional">(SEO, ~150-160 chars)</span></label>
                <textarea
                  className="bl-input bl-textarea"
                  rows={2}
                  placeholder="Shown in Google search results…"
                  value={editing.meta_description ?? ""}
                  onChange={(e) => setField("meta_description", e.target.value)}
                />
                <span className="bl-char-count">{(editing.meta_description ?? "").length} / 160</span>
              </div>

              {/* SEO Meta Keywords */}
              <div className="bl-form-group">
                <label className="bl-label">Meta Keywords <span className="bl-optional">(SEO, comma-separated paste supported)</span></label>
                <div className="bl-tag-input-row">
                  <input
                    type="text"
                    className="bl-input"
                    placeholder="Add keywords, comma-separated…"
                    value={metaKeywordInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(",")) {
                        addMetaKeyword(val);
                      } else {
                        setMetaKeywordInput(val);
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMetaKeyword(); } }}
                  />
                  <button className="bl-add-tag-btn" onClick={() => addMetaKeyword()} type="button">Add</button>
                </div>
                {(editing.meta_keywords ?? []).length > 0 && (
                  <div className="bl-tags-list">
                    {(editing.meta_keywords ?? []).map((kw) => (
                      <span key={kw} className="bl-tag">
                        {kw}
                        <button onClick={() => removeMetaKeyword(kw)} className="bl-tag-remove">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="bl-toggles-row">
                <label className="bl-toggle-label">
                  <span>Published</span>
                  <input
                    type="checkbox"
                    checked={editing.published ?? false}
                    onChange={(e) => setField("published", e.target.checked)}
                  />
                  <span className="bl-toggle-track"><span className="bl-toggle-thumb" /></span>
                </label>
                <label className="bl-toggle-label">
                  <span>Featured</span>
                  <input
                    type="checkbox"
                    checked={editing.featured ?? false}
                    onChange={(e) => setField("featured", e.target.checked)}
                  />
                  <span className="bl-toggle-track"><span className="bl-toggle-thumb" /></span>
                </label>
              </div>

            </div>

            <div className="bl-modal-footer">
              <button className="bl-cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="bl-save-btn" onClick={handleSave} disabled={saving || !editing.title}>
                {saving ? <><IconSpinner /> Saving…</> : modalMode === "create" ? "Create Post" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ PREVIEW MODAL ════════ */}
      {modalMode === "preview" && editing && (
        <div className="bl-overlay" onClick={closeModal}>
          <div className="bl-modal bl-modal--preview" onClick={(e) => e.stopPropagation()}>
            <div className="bl-modal-header">
              <h2>Post Preview</h2>
              <button className="bl-close-btn" onClick={closeModal} aria-label="Close"><IconClose /></button>
            </div>
            <div className="bl-preview-body">
              <div className="bl-preview-cover">
                <CoverPreview post={editing} />
                {editing.cover_image_url && (
                  <img src={editing.cover_image_url} alt="" className="bl-cover-img" />
                )}
                <div className="bl-preview-cover-overlay">
                  <span
                    className="bl-cat-badge"
                    style={{ color: editing.cover_color, background: `${editing.cover_color}12`, borderColor: `${editing.cover_color}28` }}
                  >
                    {editing.category}
                  </span>
                  {editing.featured && <span className="bl-featured-chip"><IconStar /> Featured</span>}
                </div>
              </div>
              <div className="bl-preview-content">
                <h1 className="bl-preview-title" style={{ color: editing.cover_color }}>{editing.title || "Untitled Post"}</h1>
                <div className="bl-preview-meta">
                  <span>{editing.author}</span>
                  <span>·</span>
                  <span>{editing.read_time}</span>
                  <span>·</span>
                  <span>{editing.word_count} words</span>
                  {(editing.tags ?? []).length > 0 && <>
                    <span>·</span>
                    <span>{(editing.tags ?? []).join(", ")}</span>
                  </>}
                </div>
                {editing.excerpt && <p className="bl-preview-excerpt">{editing.excerpt}</p>}
                {editing.content && (
                  <div className="bl-preview-text">
                    <pre className="bl-preview-pre">{editing.content}</pre>
                  </div>
                )}
                {!editing.content && <p className="bl-preview-empty">No content yet. Edit this post to add body text.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ DELETE CONFIRM ════════ */}
      {deleteTarget && (
        <div className="bl-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="bl-delete-panel" onClick={(e) => e.stopPropagation()}>
            <div className="bl-delete-icon"><IconTrash /></div>
            <h3 className="bl-delete-title">Delete this post?</h3>
            <p className="bl-delete-sub">
              "<strong>{deleteTarget.title}</strong>" will be permanently removed. This cannot be undone.
            </p>
            <div className="bl-delete-actions">
              <button className="bl-cancel-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="bl-delete-confirm-btn" onClick={handleDelete}>Delete Post</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */

function BLStyles() {
  return (
    <style>{`
      /* ── Page ── */
      .bl-page { max-width: 1400px; margin: 0 auto; }

      /* ── Header ── */
      .bl-title {
        font-size: clamp(1.6rem, 4vw, 2.5rem); font-weight: 800; margin: 0 0 0.25rem;
        background: linear-gradient(135deg, #fff, #f97316);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      }
      .bl-subtitle { color: #94a3b8; font-size: 1rem; margin: 0 0 1.75rem; }
      .bl-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
      .bl-create-btn {
        display: inline-flex; align-items: center; gap: 0.4rem;
        padding: 0.75rem 1.4rem; background: linear-gradient(135deg, #f97316, #ea580c);
        color: #fff; border: none; border-radius: 10px;
        font-weight: 600; font-size: 0.875rem; cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s; flex-shrink: 0;
      }
      .bl-create-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(249,115,22,0.4); }

      /* ── Stats ── */
      .bl-stats-row {
        display: grid; grid-template-columns: repeat(4, 1fr);
        gap: 1rem; margin-bottom: 1.75rem;
      }
      .bl-stat {
        padding: 1.1rem 1.25rem;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 14px;
        transition: border-color 0.2s, transform 0.2s;
      }
      .bl-stat:hover { border-color: var(--ac, rgba(249,115,22,0.3)); transform: translateY(-2px); }
      .bl-stat-num { display: block; font-size: 1.9rem; font-weight: 800; color: var(--ac, #f97316); line-height: 1; margin-bottom: 0.3rem; }
      .bl-stat-lbl { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; }

      /* ── Toolbar ── */
      .bl-toolbar { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 1.5rem; }
      .bl-search-wrap { position: relative; flex: 1; min-width: 200px; display: flex; align-items: center; }
      .bl-search-wrap > svg { position: absolute; left: 0.85rem; color: #64748b; pointer-events: none; flex-shrink: 0; }
      .bl-search {
        width: 100%; padding: 0.65rem 2.5rem 0.65rem 2.5rem;
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px; color: #f8fafc; font-size: 0.875rem;
        font-family: inherit; outline: none; transition: border-color 0.2s;
      }
      .bl-search::placeholder { color: #475569; }
      .bl-search:focus { border-color: rgba(249,115,22,0.4); }
      .bl-search-clear { position: absolute; right: 0.75rem; background: none; border: none; color: #64748b; cursor: pointer; font-size: 0.85rem; }
      .bl-search-clear:hover { color: #f87171; }
      .bl-filter-group { display: flex; gap: 0.35rem; }
      .bl-filter-btn {
        padding: 0.55rem 1rem; background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
        color: #94a3b8; font-size: 0.82rem; font-weight: 600;
        cursor: pointer; font-family: inherit; transition: all 0.2s;
      }
      .bl-filter-btn:hover { border-color: rgba(249,115,22,0.3); color: #f97316; }
      .bl-filter-btn.active { background: linear-gradient(135deg, #f97316, #ea580c); border-color: #f97316; color: #fff; }
      .bl-cat-select {
        padding: 0.55rem 0.875rem; background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
        color: #94a3b8; font-size: 0.82rem; font-family: inherit;
        outline: none; cursor: pointer;
      }
      .bl-cat-select option { background: #0f172a; }

      /* ── Loading / Empty ── */
      .bl-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 320px; gap: 1rem; color: #64748b; }
      .bl-empty { text-align: center; padding: 5rem 2rem; border: 1px dashed rgba(249,115,22,0.15); border-radius: 16px; }
      .bl-empty-icon { display: flex; justify-content: center; margin-bottom: 1rem; color: #f97316; opacity: 0.3; }
      .bl-empty h3 { color: #f8fafc; margin: 0 0 0.5rem; font-size: 1.2rem; }
      .bl-empty p  { color: #64748b; margin: 0; }

      /* ── Table ── */
      .bl-table-wrap { border-radius: 16px; border: 1px solid rgba(249,115,22,0.12); overflow-x: auto; }
      .bl-table { width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.03); min-width: 800px; }
      .bl-table th { padding: 0.9rem 1.1rem; text-align: left; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #f97316; background: rgba(249,115,22,0.06); border-bottom: 1px solid rgba(249,115,22,0.1); white-space: nowrap; }
      .bl-table td { padding: 0.9rem 1.1rem; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
      .bl-table tbody tr:last-child td { border-bottom: none; }
      .bl-table tbody tr:hover td { background: rgba(249,115,22,0.04); }

      .bl-post-cell { display: flex; align-items: center; gap: 0.875rem; }
      .bl-post-info { display: flex; flex-direction: column; gap: 0.2rem; }
      .bl-post-title { font-weight: 600; color: #f0f4f8; font-size: 0.9rem; }
      .bl-post-slug { font-size: 0.72rem; color: #475569; font-family: monospace; }

      /* ── Cover Preview ── */
      .bl-cover-preview {
        position: relative; width: 64px; height: 50px; flex-shrink: 0;
        border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;
      }
      .bl-cover-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 8px 8px; }
      .bl-cover-circle { position: absolute; width: 60px; height: 60px; border-radius: 50%; border: 1px solid; top: 50%; left: 50%; transform: translate(-50%, -50%); }
      .bl-cover-cat { position: absolute; bottom: 3px; left: 4px; font-size: 0.5rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 1px 5px; border: 1px solid; border-radius: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 56px; z-index: 1; }

      /* ── Badges ── */
      .bl-cat-badge { display: inline-block; padding: 0.25rem 0.7rem; border-radius: 100px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; border: 1px solid; white-space: nowrap; }
      .bl-status-badge {
        display: inline-flex; align-items: center; gap: 0.35rem;
        padding: 0.3rem 0.75rem; border-radius: 100px; font-size: 0.72rem; font-weight: 700;
        background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.3); color: #fbbf24;
        cursor: pointer; transition: all 0.2s; font-family: inherit;
      }
      .bl-status-badge--pub { background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.3); color: #22c55e; }
      .bl-status-badge:hover { opacity: 0.8; transform: scale(1.04); }
      .bl-featured-chip {
        display: inline-flex; align-items: center; gap: 0.25rem;
        font-size: 0.68rem; font-weight: 700; color: #a78bfa;
        background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.25);
        padding: 0.15rem 0.5rem; border-radius: 100px;
      }
      .bl-muted { color: #64748b; font-size: 0.85rem; }

      /* ── Row actions ── */
      .bl-row-actions { display: flex; gap: 0.4rem; }
      .bl-action-btn { width: 32px; height: 32px; border-radius: 7px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
      .bl-action-btn--view  { background: rgba(99,102,241,0.12); color: #818cf8; }
      .bl-action-btn--view:hover  { background: rgba(99,102,241,0.25); }
      .bl-action-btn--edit  { background: rgba(59,130,246,0.12); color: #60a5fa; }
      .bl-action-btn--edit:hover  { background: rgba(59,130,246,0.25); }
      .bl-action-btn--del   { background: rgba(239,68,68,0.1);  color: #f87171; }
      .bl-action-btn--del:hover   { background: rgba(239,68,68,0.2); }

      /* ── Mobile Cards ── */
      .bl-cards { display: none; flex-direction: column; gap: 0.875rem; }
      .bl-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(249,115,22,0.12); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
      .bl-card-top { display: flex; gap: 0.875rem; align-items: flex-start; }
      .bl-card-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.35rem; }
      .bl-card-meta-row { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }
      .bl-card-sub { display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center; font-size: 0.8rem; }
      .bl-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); }
      .bl-card-act-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.55rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; border: 1px solid; min-width: 70px; }
      .bl-card-act-btn { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.25); color: #818cf8; }
      .bl-card-act-btn--edit { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.25); color: #60a5fa; }
      .bl-card-act-btn--del  { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.25); color: #f87171; }
      .bl-card-act-btn:hover { opacity: 0.8; transform: translateY(-1px); }

      /* ── Overlay / Modal ── */
      .bl-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(4,7,15,0.88); backdrop-filter: blur(14px); display: flex; align-items: center; justify-content: center; padding: 1.25rem; overflow-y: auto; animation: blFadeIn 0.2s ease; }
      @keyframes blFadeIn { from { opacity:0; } to { opacity:1; } }
      .bl-modal {
        background: linear-gradient(145deg, #0c1526, #080f1c); border: 1px solid rgba(249,115,22,0.2);
        border-radius: 20px; width: 100%; animation: blSlideUp 0.3s cubic-bezier(0.22,1,0.36,1);
        display: flex; flex-direction: column; max-height: 92vh;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6);
      }
      @keyframes blSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      .bl-modal--form    { max-width: 780px; }
      .bl-modal--preview { max-width: 860px; }
      .bl-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.4rem 1.75rem; border-bottom: 1px solid rgba(249,115,22,0.12); position: sticky; top: 0; background: linear-gradient(145deg, #0c1526, #080f1c); z-index: 1; border-radius: 20px 20px 0 0; }
      .bl-modal-header h2 { color: #f97316; margin: 0; font-size: 1.25rem; }
      .bl-close-btn { width: 34px; height: 34px; border-radius: 50%; border: none; background: rgba(239,68,68,0.12); color: #f87171; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
      .bl-close-btn:hover { background: rgba(239,68,68,0.25); transform: rotate(90deg); }
      .bl-modal-body { padding: 1.5rem 1.75rem; overflow-y: auto; flex: 1; }
      .bl-modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem 1.75rem; border-top: 1px solid rgba(249,115,22,0.1); position: sticky; bottom: 0; background: linear-gradient(145deg, #0c1526, #080f1c); border-radius: 0 0 20px 20px; }

      /* ── Form ── */
      .bl-form-section { margin-bottom: 1.5rem; }
      .bl-form-group { margin-bottom: 1.25rem; }
      .bl-form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .bl-label { display: block; margin-bottom: 0.4rem; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; }
      .bl-optional { font-weight: 400; text-transform: none; letter-spacing: 0; color: #475569; }
      .bl-input {
        width: 100%; padding: 0.75rem 0.9rem; background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
        color: #f8fafc; font-size: 0.9rem; font-family: inherit;
        transition: border-color 0.2s, background 0.2s; outline: none; box-sizing: border-box;
      }
      .bl-input::placeholder { color: #334155; }
      .bl-input:focus { border-color: rgba(249,115,22,0.5); background: rgba(249,115,22,0.04); }
      .bl-input--sm { padding: 0.5rem 0.75rem; font-size: 0.82rem; }
      .bl-select { appearance: none; cursor: pointer; }
      .bl-select option { background: #0c1526; }
      .bl-textarea { resize: vertical; min-height: 80px; }
      .bl-textarea--content { font-family: "Courier New", monospace; font-size: 0.85rem; min-height: 280px; }
      .bl-char-count { display: block; text-align: right; font-size: 0.72rem; color: #475569; margin-top: 0.3rem; }
      .bl-wc-badge { margin-left: 0.6rem; font-size: 0.7rem; font-weight: 400; color: #22c55e; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); padding: 2px 7px; border-radius: 100px; text-transform: none; letter-spacing: 0; }

      /* Slug */
      .bl-slug-wrap { display: flex; align-items: center; gap: 0; }
      .bl-slug-prefix { padding: 0.75rem 0.75rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-right: none; border-radius: 10px 0 0 10px; color: #475569; font-size: 0.85rem; white-space: nowrap; font-family: monospace; }
      .bl-input--slug { border-radius: 0 10px 10px 0; font-family: monospace; }

      /* Color pickers */
      .bl-color-presets { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
      .bl-color-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.2s, border-color 0.2s; }
      .bl-color-dot:hover { transform: scale(1.15); }
      .bl-color-dot.active { border-color: #fff; box-shadow: 0 0 0 2px rgba(255,255,255,0.3); }
      .bl-color-input-wrap { display: flex; gap: 0.5rem; align-items: center; }
      .bl-color-picker { width: 36px; height: 36px; border: none; border-radius: 8px; cursor: pointer; padding: 2px; background: none; flex-shrink: 0; }

      /* Cover wrap */
      .bl-cover-wrap { display: grid; grid-template-columns: 160px 1fr; gap: 1.25rem; }
      .bl-cover-large { width: 160px; height: 120px; border-radius: 14px; overflow: hidden; position: relative; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.07); }
      .bl-cover-large .bl-cover-preview { width: 100%; height: 100%; }
      .bl-cover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }

      .bl-upload-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.65rem 1.1rem; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25); border-radius: 8px; color: #60a5fa; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: 0.5rem; }
      .bl-upload-btn:hover { background: rgba(59,130,246,0.22); }
      .bl-remove-img-btn { display: block; font-size: 0.75rem; color: #f87171; background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; }

      /* Tags */
      .bl-tag-input-row { display: flex; gap: 0.5rem; }
      .bl-tag-input-row .bl-input { flex: 1; }
      .bl-add-tag-btn { padding: 0.75rem 1rem; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.25); border-radius: 10px; color: #f97316; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: inherit; }
      .bl-add-tag-btn:hover { background: rgba(249,115,22,0.2); }
      .bl-tags-list { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.6rem; }
      .bl-tag { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.22rem 0.65rem; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); color: #f97316; border-radius: 100px; font-size: 0.75rem; font-weight: 500; }
      .bl-tag-remove { background: none; border: none; color: rgba(249,115,22,0.6); cursor: pointer; font-size: 1rem; line-height: 1; padding: 0; }
      .bl-tag-remove:hover { color: #f97316; }

      /* Toggles */
      .bl-toggles-row { display: flex; gap: 2rem; flex-wrap: wrap; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; }
      .bl-toggle-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-size: 0.9rem; color: #cbd5e1; font-weight: 600; position: relative; }
      .bl-toggle-label input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .bl-toggle-track { width: 42px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 100px; position: relative; transition: background 0.25s; flex-shrink: 0; }
      .bl-toggle-label input:checked ~ .bl-toggle-track { background: #f97316; }
      .bl-toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.25s; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
      .bl-toggle-label input:checked ~ .bl-toggle-track .bl-toggle-thumb { transform: translateX(18px); }

      /* ── Buttons ── */
      .bl-cancel-btn { padding: 0.75rem 1.4rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; font-weight: 600; font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: all 0.2s; }
      .bl-cancel-btn:hover { background: rgba(255,255,255,0.09); }
      .bl-save-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.75rem 1.6rem; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: all 0.25s; }
      .bl-save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(249,115,22,0.4); }
      .bl-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      /* ── Preview modal ── */
      .bl-preview-body { overflow-y: auto; flex: 1; }
      .bl-preview-cover { position: relative; height: 220px; overflow: hidden; }
      .bl-preview-cover .bl-cover-preview { width: 100%; height: 100%; border-radius: 0; }
      .bl-preview-cover-overlay { position: absolute; bottom: 1rem; left: 1.75rem; display: flex; gap: 0.5rem; align-items: center; z-index: 2; }
      .bl-preview-content { padding: 1.75rem; }
      .bl-preview-title { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 800; margin: 0 0 0.75rem; }
      .bl-preview-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; font-size: 0.82rem; color: #64748b; margin-bottom: 1.25rem; }
      .bl-preview-excerpt { font-size: 1.05rem; color: #94a3b8; line-height: 1.7; margin: 0 0 1.25rem; padding: 1rem; background: rgba(255,255,255,0.04); border-left: 3px solid #f97316; border-radius: 0 8px 8px 0; }
      .bl-preview-text { margin-top: 1rem; }
      .bl-preview-pre { font-family: inherit; white-space: pre-wrap; word-break: break-word; color: #cbd5e1; font-size: 0.92rem; line-height: 1.8; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 1.25rem; }
      .bl-preview-empty { color: #475569; font-style: italic; }

      /* ── Delete panel ── */
      .bl-delete-panel { background: linear-gradient(145deg, #0c1526, #080f1c); border: 1px solid rgba(239,68,68,0.3); border-radius: 20px; padding: 2.5rem; max-width: 440px; width: 100%; text-align: center; animation: blSlideUp 0.25s cubic-bezier(0.22,1,0.36,1); }
      .bl-delete-icon { width: 52px; height: 52px; border-radius: 50%; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; color: #f87171; }
      .bl-delete-title { color: #f8fafc; margin: 0 0 0.75rem; font-size: 1.3rem; }
      .bl-delete-sub { color: #64748b; font-size: 0.9rem; line-height: 1.6; margin: 0 0 2rem; }
      .bl-delete-sub strong { color: #cbd5e1; }
      .bl-delete-actions { display: flex; gap: 0.75rem; justify-content: center; }
      .bl-delete-confirm-btn { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: all 0.2s; }
      .bl-delete-confirm-btn:hover { opacity: 0.9; transform: translateY(-1px); }

      /* ── Toast ── */
      .bl-toast { position: fixed; top: 88px; right: 1.5rem; z-index: 2000; display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.25rem; border-radius: 10px; font-size: 0.88rem; font-weight: 600; animation: blSlideToast 0.25s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.4); max-width: calc(100vw - 3rem); }
      .bl-toast--success { background: #052e16; color: #86efac; border: 1px solid #166534; }
      .bl-toast--error   { background: #450a0a; color: #fca5a5; border: 1px solid #991b1b; }
      @keyframes blSlideToast { from { opacity:0; transform:translateX(14px); } to { opacity:1; transform:translateX(0); } }

      /* ── Spinner ── */
      @keyframes bl-spin { to { transform: rotate(360deg); } }
      .bl-spin { animation: bl-spin 0.8s linear infinite; }

      /* ── Responsive ── */
      @media (max-width: 1024px) {
        .bl-stats-row { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 768px) {
        .bl-table-wrap { display: none; }
        .bl-cards { display: flex; }
        .bl-form-row-2 { grid-template-columns: 1fr; }
        .bl-cover-wrap { grid-template-columns: 1fr; }
        .bl-cover-large { width: 100%; height: 140px; }
        .bl-modal-body { padding: 1.25rem; }
        .bl-modal-footer { padding: 1rem 1.25rem; flex-wrap: wrap; }
        .bl-cancel-btn, .bl-save-btn { flex: 1; justify-content: center; }
        .bl-toolbar { flex-direction: column; align-items: stretch; }
        .bl-search-wrap { min-width: unset; }
        .bl-filter-group { justify-content: space-between; }
        .bl-filter-btn { flex: 1; text-align: center; }
        .bl-toggles-row { gap: 1.25rem; }
      }
      @media (max-width: 480px) {
        .bl-stats-row { grid-template-columns: 1fr 1fr; }
        .bl-header { flex-direction: column; align-items: flex-start; }
        .bl-create-btn { align-self: flex-start; }
        .bl-toast { top: auto; bottom: 1rem; right: 1rem; left: 1rem; }
        .bl-delete-actions { flex-direction: column; }
        .bl-cancel-btn, .bl-delete-confirm-btn { width: 100%; }
      }
    `}</style>
  );
}
