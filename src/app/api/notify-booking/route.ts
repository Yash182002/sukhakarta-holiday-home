import { NextResponse } from "next/server";

// Simple rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    // ✅ RATE LIMITING
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await req.json();

    const {
      customer_name,
      phone,
      email,
      check_in,
      check_out,
      status,
      total_amount,
    } = body;

    // ✅ INPUT VALIDATION
    if (!customer_name || !phone || !email || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ SANITIZE PHONE NUMBER
    const sanitizedPhone = phone.replace(/[^0-9]/g, '').slice(0, 15);
    
    if (!sanitizedPhone || sanitizedPhone.length < 10) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    /* ---------------- WHATSAPP ---------------- */
    const whatsappMessage =
      status === "confirmed"
        ? `✅ Booking Confirmed – Sukhakarta Holiday Home

Name: ${customer_name}
Dates: ${check_in} to ${check_out}
Total: ₹${total_amount}

We look forward to hosting you in Alibag.`
        : `❌ Booking Cancelled – Sukhakarta Holiday Home

Name: ${customer_name}
Dates: ${check_in} to ${check_out}

For queries, please contact us.`;

    // ✅ PROPERLY ENCODE URL
    const whatsappUrl = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    /* ---------------- EMAIL ---------------- */
    // ✅ DON'T LOG PII - Use generic logging
    console.log("Booking notification sent:", {
      status,
      timestamp: new Date().toISOString(),
      // Don't log email/phone
    });

    return NextResponse.json({
      success: true,
      whatsappUrl,
    });
  } catch (error) {
    console.error("Notification error:", error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
