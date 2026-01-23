import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  /* ---------------- EMAIL (BASIC SMTP VIA RESEND / SMTP LATER) ---------------- */
  // Placeholder — safe to expand later
  console.log("EMAIL TO:", email);
  console.log("STATUS:", status);

  return NextResponse.json({
    success: true,
    whatsappUrl,
  });
}
