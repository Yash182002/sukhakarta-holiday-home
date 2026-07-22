// FILE: src/app/admin/seo/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Vital = {
  page_url: string;
  strategy: string;
  performance: number;
  seo: number;
  accessibility: number;
  lcp_ms: number | null;
  cls: number | null;
  checked_at?: string;
};

type BrokenLink = {
  id: string;
  source_page: string;
  broken_url: string;
  status_code: number;
  first_seen_at: string;
};

type BlogDraft = {
  id: string;
  title: string;
  target_keyword: string;
  status: string;
  created_at: string;
};

const ACTIONS = [
  { key: "vitals-batch1", label: "Check Vitals — Batch 1 (Home, Rooms, Book)" },
  { key: "vitals-batch2", label: "Check Vitals — Batch 2 (FAQ, Blog, Gallery)" },
  { key: "vitals-batch3", label: "Check Vitals — Batch 3 (Places, About, Contact)" },
  { key: "vitals-batch4", label: "Check Vitals — Batch 4 (Nagaon, Alibaug, Varsoli)" },
  { key: "vitals-batch5", label: "Check Vitals — Batch 5 (Weekend, Family, Couple)" },
  { key: "broken-links", label: "Scan for Broken Links" },
  { key: "blog-draft", label: "Generate New Blog Draft" },
];
export default function SEODashboard() {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  async function loadData() {
    const [v, bl, bd] = await Promise.all([
      supabase.from("seo_vitals").select("*").order("checked_at", { ascending: false }).limit(30),
      supabase.from("seo_broken_links").select("*").eq("resolved", false).order("first_seen_at", { ascending: false }),
      supabase.from("blog_drafts").select("id, title, target_keyword, status, created_at").order("created_at", { ascending: false }).limit(10),
    ]);
    setVitals(v.data || []);
    setBrokenLinks(bl.data || []);
    setDrafts(bd.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function runAction(key: string) {
    setRunning(key);
    setLastResult(null);
    try {
      // Grab the current session's access token — this is how the browser
      // proves to our API route that we're really logged in as admin.
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLastResult("❌ Your session expired — please log in again");
        setRunning(null);
        return;
      }

      const res = await fetch(`/api/admin/run-seo-task?task=${key}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setLastResult(`✅ ${key} completed successfully`);
      } else {
        setLastResult(`⚠️ ${key} finished with issues: ${data.error || "check logs"}`);
      }
      await loadData();
    } catch (err: any) {
      setLastResult(`❌ ${key} failed: ${err.message}`);
    } finally {
      setRunning(null);
    }
  }

  const latestByPage = vitals.reduce((acc: Record<string, Vital>, v) => {
    if (!acc[v.page_url]) acc[v.page_url] = v;
    return acc;
  }, {});

  const scoreColor = (s: number) => (s >= 90 ? "#22c55e" : s >= 70 ? "#f59e0b" : "#ef4444");

  if (loading) {
    return <div style={{ color: "#94a3b8", padding: "2rem" }}>Loading SEO dashboard…</div>;
  }

  return (
    <div className="seo-dash">
      <h1>SEO Dashboard</h1>
      <p className="subtitle">Sukhakarta Holiday Home — sukhakartaholidayhome.in</p>

      <div className="actions-panel">
        <h2 style={{ margin: "0 0 1rem" }}>Run Checks</h2>
        <div className="actions-grid">
          {ACTIONS.map((a) => (
            <button
              key={a.key}
              className="run-btn"
              disabled={running !== null}
              onClick={() => runAction(a.key)}
            >
              {running === a.key ? "Running…" : a.label}
            </button>
          ))}
        </div>
        {lastResult && <div className="last-result">{lastResult}</div>}
      </div>

      <div className="cards-row">
        <div className="card">
          <div className="card-value">{Object.keys(latestByPage).length}</div>
          <div className="card-label">Pages Monitored</div>
        </div>
        <div className={`card ${brokenLinks.length > 0 ? "card-alert" : ""}`}>
          <div className="card-value">{brokenLinks.length}</div>
          <div className="card-label">Broken Links</div>
        </div>
        <div className="card">
          <div className="card-value">{drafts.filter((d) => d.status === "pending_review").length}</div>
          <div className="card-label">Blog Drafts Pending</div>
        </div>
      </div>

      <h2>Page Performance</h2>
      {Object.keys(latestByPage).length === 0 ? (
        <p className="empty-state">No data yet. Click a "Check Vitals" button above to run your first check.</p>
      ) : (
        <div className="vitals-grid">
          {Object.entries(latestByPage).map(([page, v]) => (
            <div key={page} className="vitals-card">
              <div className="vitals-page">{page || "/"}</div>
              <div className="vitals-scores">
                <div className="score-pill" style={{ color: scoreColor(v.performance) }}>{v.performance}<span>Perf</span></div>
                <div className="score-pill" style={{ color: scoreColor(v.seo) }}>{v.seo}<span>SEO</span></div>
                <div className="score-pill" style={{ color: scoreColor(v.accessibility) }}>{v.accessibility}<span>A11y</span></div>
              </div>
              <div className="vitals-meta">
                LCP {v.lcp_ms ? `${(v.lcp_ms / 1000).toFixed(1)}s` : "—"} · CLS {v.cls ?? "—"}
                {v.checked_at && <> · {new Date(v.checked_at).toLocaleString("en-IN")}</>}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>Broken Links</h2>
      {brokenLinks.length === 0 ? (
        <p className="empty-state good">✅ No broken links detected</p>
      ) : (
        <table className="data-table">
          <thead><tr><th>Page</th><th>Broken URL</th><th>Status</th><th>Detected</th></tr></thead>
          <tbody>
            {brokenLinks.map((l) => (
              <tr key={l.id}>
                <td>{l.source_page}</td>
                <td className="broken-url">{l.broken_url}</td>
                <td><span className="status-badge">{l.status_code}</span></td>
                <td>{new Date(l.first_seen_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Blog Drafts</h2>
      {drafts.length === 0 ? (
        <p className="empty-state">No drafts yet. Click "Generate New Blog Draft" above.</p>
      ) : (
        <div className="drafts-list">
          {drafts.map((d) => (
            <div key={d.id} className="draft-row">
              <div>
                <div className="draft-topic">{d.title}</div>
                <div className="draft-meta">Keyword: {d.target_keyword} · {new Date(d.created_at).toLocaleDateString("en-IN")}</div>
              </div>
              <span className={`status-tag status-${d.status}`}>{d.status}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .seo-dash { max-width: 1100px; }
        h1 { font-size: 1.75rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem; }
        .subtitle { color: #94a3b8; margin-bottom: 2rem; }
        h2 { font-size: 1.15rem; font-weight: 700; color: #fff; margin: 2.25rem 0 1rem; }

        .actions-panel { background: #1e293b; border: 1px solid rgba(249,115,22,0.2); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; }
        .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; }
        .run-btn {
          background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none;
          border-radius: 10px; padding: 0.7rem 1rem; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: transform 0.15s, opacity 0.15s;
        }
        .run-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .last-result { margin-top: 1rem; font-size: 0.85rem; color: #cbd5e1; }

        .cards-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
        .card { background: #1e293b; border: 1px solid rgba(249,115,22,0.15); border-radius: 14px; padding: 1.25rem 1.5rem; }
        .card-alert { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.08); }
        .card-value { font-size: 2rem; font-weight: 800; color: #fff; }
        .card-label { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }

        .empty-state { color: #94a3b8; font-size: 0.9rem; }
        .empty-state.good { color: #22c55e; }

        .vitals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
        .vitals-card { background: #1e293b; border: 1px solid rgba(249,115,22,0.15); border-radius: 14px; padding: 1.25rem; }
        .vitals-page { font-weight: 700; color: #f97316; margin-bottom: 0.75rem; word-break: break-all; }
        .vitals-scores { display: flex; gap: 1rem; margin-bottom: 0.75rem; }
        .score-pill { font-size: 1.4rem; font-weight: 800; text-align: center; }
        .score-pill span { display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 500; }
        .vitals-meta { font-size: 0.75rem; color: #64748b; }

        .data-table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 14px; overflow: hidden; }
        .data-table th { text-align: left; padding: 0.75rem 1rem; background: #0f172a; color: #94a3b8; font-size: 0.8rem; font-weight: 600; }
        .data-table td { padding: 0.75rem 1rem; border-top: 1px solid rgba(148,163,184,0.1); color: #cbd5e1; font-size: 0.85rem; }
        .broken-url { color: #ef4444; word-break: break-all; }
        .status-badge { background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }

        .drafts-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .draft-row { background: #1e293b; border: 1px solid rgba(249,115,22,0.15); border-radius: 12px; padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
        .draft-topic { color: #fff; font-weight: 600; font-size: 0.92rem; }
        .draft-meta { color: #94a3b8; font-size: 0.78rem; margin-top: 0.2rem; }
        .status-tag { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
        .status-pending_review { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .status-approved { background: rgba(34,197,94,0.15); color: #22c55e; }
      `}</style>
    </div>
  );
}