import Razorpay from "razorpay";
import { NextResponse } from "next/server";

/* ── Shared rate limiter with cleanup to prevent memory leak ── */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cleanup expired entries every 10 minutes to prevent unbounded memory growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }, 10 * 60 * 1000);
}

function rateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

/* ── Validate amount is a safe integer (no floats, no overflow) ── */
function validateAmount(raw: unknown): number | null {
  if (typeof raw !== "number") return null;
  if (!Number.isInteger(raw)) return null;   // reject floats like 999.99
  if (raw < 100) return null;                // min ₹100
  if (raw > 500_000) return null;            // max ₹5,00,000
  return raw;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      // Don't reveal which key is missing
      console.error("[create-order] Payment credentials not configured");
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const amount = validateAmount((body as any)?.amount);
    if (amount === null) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await Promise.race([
      razorpay.orders.create({
        amount: amount * 100,   // paise
        currency: "INR",
        receipt: `skh_${Date.now()}`,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gateway timeout")), 10_000)
      ),
    ]);

    return NextResponse.json(order);
  } catch (error) {
    console.error("[create-order] Error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
