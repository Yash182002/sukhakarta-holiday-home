// FILE: src/app/api/cron/vitals-batch1/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PAGES = ["/", "/rooms", "/book", "/faq", "/blog"];
const BASE_URL = "https://sukhakartaholidayhome.in";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const results = [];
  const errors = [];

  for (const page of PAGES) {
    const targetUrl = `${BASE_URL}${page}`;
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      targetUrl
    )}&key=${process.env.PAGESPEED_API_KEY}&strategy=mobile&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES`;

    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (data.error) { errors.push({ page, error: data.error.message }); continue; }

      const cats = data.lighthouseResult?.categories;
      const audits = data.lighthouseResult?.audits;
      const lcpMs = audits?.["largest-contentful-paint"]?.numericValue ?? null;
      const clsValue = audits?.["cumulative-layout-shift"]?.numericValue ?? null;
      const fidMs = audits?.["max-potential-fid"]?.numericValue ?? null;

      const row = {
        page_url: page,
        strategy: "mobile",
        performance: Math.round((cats?.performance?.score || 0) * 100),
        accessibility: Math.round((cats?.accessibility?.score || 0) * 100),
        best_practices: Math.round((cats?.["best-practices"]?.score || 0) * 100),
        seo: Math.round((cats?.seo?.score || 0) * 100),
        lcp_ms: lcpMs ? Math.round(lcpMs) : null,
        cls: clsValue,
        fid_ms: fidMs ? Math.round(fidMs) : null,
        checked_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("seo_vitals")
        .upsert(row, { onConflict: "page_url,strategy" });

      if (upsertError) errors.push({ page, error: upsertError.message });
      else results.push(row);
    } catch (err: any) {
      errors.push({ page, error: err.message || "Unknown error" });
    }
  }

  return NextResponse.json({ success: errors.length === 0, checked: results.length, results, errors });
}