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
  created_at?: string;
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

export default function SEODashboard() {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [v, bl, bd] = await Promise.all([
        supabase.from("seo_vitals").select("*").order("id", { ascending: false }).limit(20),
        supabase.from("seo_broken_links").select("*").eq("resolved", false).order("first_seen_at", { ascending: false }),
        supabase.from("blog_drafts").select("id, title, target_keyword, status, created_at").order("created_at", { ascending: false }).limit(10),
      ]);
      setVitals(v.data || []);
      setBrokenLinks(bl.data || []);
      setDrafts(bd.data || []);
      setLoading(false);
    }
    load();
  }, []);

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
        <p className="empty-state">
          No data yet. The daily vitals check runs automatically at 6 AM IST, or trigger it manually.
        </p>
      ) : (
        <div className="vitals-grid">
          {Object.entries(latestByPage).map(([page, v]) => (
            <div key={page} className="vitals-card">
              <div className="vitals-page">{page || "/"}</div>
              <div className="vitals-scores">
                <div className="score-pill" style={{ color: scoreColor(v.performance) }}>
                  {v.performance} <span>Perf</span>
                </div>
                <div className="score-pill" style={{ color: scoreColor(v.seo) }}>
                  {v.seo} <span>SEO</span>
                </div>
                <div className="score-pill" style={{ color: scoreColor(v.accessibility) }}>
                  {v.accessibility} <span>A11y</span>
                </div>
              </div>
              <div className="vitals-meta">
                LCP {v.lcp_ms ? `${(v.lcp_ms / 1000).toFixed(1)}s` : "—"} · CLS {v.cls ?? "—"}
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
          <thead>
            <tr><th>Page</th><th>Broken URL</th><th>Status</th><th>Detected</th></tr>
          </thead>
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
        <p className="empty-state">No drafts yet. Weekly generation runs Thursdays at 8 AM IST.</p>
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

        .cards-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
        .card { background: #1e293b; border: 1px solid rgba(249,115,22,0.15); border-radius: 14px; padding: 1.25rem 1.5rem; }
        .card-alert { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.08); }
        .card-value { font-size: 2rem; font-weight: 800; color: #fff; }
        .card-label { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }

        .empty-state { color: #94a3b8; font-size: 0.9rem; }
        .empty-state.good { color: #22c55e; }

        .vitals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
        .vitals-card { background: #1e293b; border: 1px solid rgba(249,115,22,0.15); border-radius: 14px; padding: 1.25rem; }
        .vitals-page { font-weight: 700; color: #f97316; margin-bottom: 0.75rem; }
        .vitals-scores { display: flex; gap: 1rem; margin-bottom: 0.75rem; }
        .score-pill { font-size: 1.4rem; font-weight: 800; text-align: center; }
        .score-pill span { display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 500; }
        .vitals-meta { font-size: 0.78rem; color: #64748b; }

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