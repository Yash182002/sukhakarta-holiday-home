import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = await req.json();

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  // Check if secret exists
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: "Server configuration error" },
      { status: 500 }
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // ✅ USE CONSTANT-TIME COMPARISON
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(razorpay_signature, 'hex');
  
  // Ensure both buffers are same length before comparison
  if (expectedBuffer.length !== receivedBuffer.length) {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isValid) {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
