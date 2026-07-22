// FILE: src/app/api/cron/vitals-batch4/route.ts
import { NextResponse } from "next/server";
import { runVitalsCheck } from "@/lib/vitalsChecker";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PAGES = ["/stay/near-nagaon-beach", "/stay/near-alibaug-beach", "/stay/near-varsoli-beach"];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runVitalsCheck(PAGES);
  return NextResponse.json(result);
}