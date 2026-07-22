// FILE: src/app/api/cron/vitals-batch5/route.ts
import { NextResponse } from "next/server";
import { runVitalsCheck } from "@/lib/vitalsChecker";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PAGES = ["/stay/weekend-getaway-from-mumbai", "/stay/family-homestay-alibag", "/stay/couple-homestay-alibag"];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runVitalsCheck(PAGES);
  return NextResponse.json(result);
}