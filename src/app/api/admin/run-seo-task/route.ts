// FILE: src/app/api/admin/run-seo-task/route.ts
//
// Verifies the admin's session by checking the access token they send in
// the Authorization header (grabbed client-side from supabase.auth.getSession()).
// This matches the project's actual auth pattern: plain supabase-js with
// browser localStorage sessions — no cookies involved.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VALID_TASKS: Record<string, string> = {
  "vitals-batch1": "/api/cron/vitals-batch1",
  "vitals-batch2": "/api/cron/vitals-batch2",
  "vitals-batch3": "/api/cron/vitals-batch3",
  "broken-links": "/api/cron/broken-links",
  "blog-draft": "/api/cron/blog-draft",
};

export async function POST(request: Request) {
  // 1. Pull the access token the browser sent us
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Verify that token is real and get the user it belongs to
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 3. Confirm admin role, same check as admin/layout.tsx
  const role = (user.app_metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // 4. Figure out which task was requested
  const { searchParams } = new URL(request.url);
  const task = searchParams.get("task");

  if (!task || !VALID_TASKS[task]) {
    return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  }

  // 5. Call the actual cron route server-side, attaching the cron secret ourselves
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sukhakartaholidayhome.in";
  const targetUrl = `${baseUrl}${VALID_TASKS[task]}`;

  try {
    const res = await fetch(targetUrl, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Task failed" }, { status: 500 });
  }
}