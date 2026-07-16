// FILE: src/app/api/cron/broken-links/route.ts
// UPDATED to match your actual existing seo_broken_links table columns:
// id, source_page, broken_url, status_code, link_text, is_internal, resolved, resolved_at, first_seen_at, last_seen_at

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const BASE_URL = "https://sukhakartaholidayhome.in";
const PAGES_TO_CHECK = ["/", "/rooms", "/blog", "/places", "/gallery", "/about", "/contact", "/faq"];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const broken: {
    source_page: string;
    broken_url: string;
    status_code: number;
    is_internal: boolean;
  }[] = [];

  for (const page of PAGES_TO_CHECK) {
    try {
      const res = await fetch(`${BASE_URL}${page}`);
      const html = await res.text();

      const hrefRegex = /href=["']([^"'#?]+)["']/g;
      const links = new Set<string>();
      let match;
      while ((match = hrefRegex.exec(html)) !== null) {
        const href = match[1];
        if (href.startsWith("/")) links.add(`${BASE_URL}${href}`);
      }

      for (const link of Array.from(links).slice(0, 25)) {
        try {
          const linkRes = await fetch(link, { method: "HEAD" });
          if (linkRes.status === 404 || linkRes.status >= 500) {
            broken.push({
              source_page: page,
              broken_url: link,
              status_code: linkRes.status,
              is_internal: true,
            });
          }
        } catch {
          broken.push({
            source_page: page,
            broken_url: link,
            status_code: 0,
            is_internal: true,
          });
        }
      }
    } catch (err) {
      console.error(`Failed to check ${page}:`, err);
    }
  }

  let insertError = null;
  if (broken.length > 0) {
    const { error } = await supabase.from("seo_broken_links").insert(
      broken.map((b) => ({
        ...b,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      }))
    );
    insertError = error?.message || null;
  }

  return NextResponse.json({
    success: !insertError,
    broken_count: broken.length,
    broken,
    error: insertError,
  });
}