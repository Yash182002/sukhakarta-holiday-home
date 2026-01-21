console.log("Razorpay Key:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const { amount } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: "Invalid amount" },
      { status: 400 }
    );
  }

  const order = await razorpay.orders.create({
    amount: amount * 100, // FULL amount in paise
    currency: "INR",
    receipt: "sukhakarta_booking",
  });

  return NextResponse.json(order);
}
