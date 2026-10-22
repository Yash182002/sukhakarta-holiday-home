import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user || (user.app_metadata as any)?.role !== "admin")
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { roomId, syncId } = await request.json();
  const host = request.headers.get("host") || "";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const res = await fetch(`${proto}://${host}/api/sync-calendar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-cron-secret": process.env.CRON_SECRET || "" },
    body: JSON.stringify({ roomId, syncId }),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
