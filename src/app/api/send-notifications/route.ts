import { NextResponse } from "next/server";

/* ── Rate limiter with cleanup ── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitMap) if (now > v.resetAt) rateLimitMap.delete(k);
}, 5 * 60_000);

function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const rec = rateLimitMap.get(key);
  if (!rec || now > rec.resetAt) { rateLimitMap.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (rec.count >= limit) return false;
  rec.count++;
  return true;
}

/* ── Sanitize user-supplied strings before embedding in HTML ── */
function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/* ── Validate ── */
function isValidEmail(e: string): boolean {
  return /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{1,63}$/.test(e);
}
function isValidDate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(d) && !isNaN(Date.parse(d));
}

/* ── Email templates (with XSS-safe interpolation) ── */
function customerEmailHtml(d: {
  customer_name: string; room_name: string; check_in: string; check_out: string;
  guests: number; nights: number; total_amount: number; booking_id: string;
}): string {
  const fmt = (s: string) => new Date(s).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const n = esc(d.customer_name), r = esc(d.room_name);
  const ci = fmt(d.check_in), co = fmt(d.check_out);
  const bid = esc(d.booking_id.slice(-8).toUpperCase());
  const amt = Number(d.total_amount).toLocaleString("en-IN");
  const nights = Math.max(1, Math.floor(d.nights));
  const guests = Math.max(1, Math.floor(d.guests));

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Booking Confirmed</title></head>
<body style="margin:0;padding:0;background:#04070f;font-family:'Segoe UI',system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#04070f;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="background:linear-gradient(135deg,#1a0a00,#2d1200);border:1px solid rgba(249,115,22,0.3);border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
  <div style="font-size:13px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#f97316;margin-bottom:12px;">✦ Booking Confirmed ✦</div>
  <h1 style="margin:0;font-size:32px;font-weight:700;color:#fff;">Sukhakarta Holiday Home</h1>
  <p style="margin:12px 0 0;color:rgba(240,244,248,0.7);font-size:15px;">Alibag, Maharashtra</p>
</td></tr>
<tr><td style="background:#052e16;border-left:1px solid rgba(249,115,22,0.2);border-right:1px solid rgba(249,115,22,0.2);padding:20px 40px;text-align:center;">
  <p style="margin:0;font-size:20px;font-weight:700;color:#4ade80;">✓ Your booking is confirmed!</p>
  <p style="margin:6px 0 0;color:#86efac;font-size:14px;">Payment received. We can't wait to host you.</p>
</td></tr>
<tr><td style="background:#080d18;border-left:1px solid rgba(249,115,22,0.2);border-right:1px solid rgba(249,115,22,0.2);padding:32px 40px;">
  <p style="margin:0;font-size:18px;color:#f8fafc;font-weight:600;">Dear ${n},</p>
  <p style="margin:10px 0 0;font-size:15px;color:#94a3b8;line-height:1.6;">Thank you for choosing Sukhakarta Holiday Home. Your booking is confirmed and we're thrilled to welcome you.</p>
  <br/>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.2);border-radius:16px;overflow:hidden;">
    <tr><td style="background:rgba(249,115,22,0.12);padding:14px 20px;"><p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#f97316;">Booking Summary</p></td></tr>
    <tr><td style="padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[["Booking ID","#"+bid],["Room",r],["Check-in",ci],["Check-out",co],["Duration",nights+" night"+(nights!==1?"s":"")+" · "+guests+" guest"+(guests!==1?"s":"")],["Total Paid","₹"+amt]].map(([l,v])=>`
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:13px;color:#64748b;">${l}</td>
            <td align="right" style="font-size:13px;color:${l==="Total Paid"?"#f97316":"#cbd5e1"};font-weight:600;">${v}</td></tr>
          </table>
        </td></tr>`).join("")}
      </table>
    </td></tr>
  </table>
  <br/>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(14,165,233,0.06);border:1px solid rgba(14,165,233,0.2);border-radius:14px;padding:18px 20px;">
    <tr><td>
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#38bdf8;">Important Information</p>
      <p style="margin:4px 0;font-size:13px;color:#94a3b8;">🕛 Check-in: <strong style="color:#cbd5e1;">12:00 PM</strong></p>
      <p style="margin:4px 0;font-size:13px;color:#94a3b8;">🕚 Check-out: <strong style="color:#cbd5e1;">11:00 AM</strong></p>
      <p style="margin:4px 0;font-size:13px;color:#94a3b8;">📍 <strong style="color:#cbd5e1;">House no 826, Aadarsh Nagar, Kurul, Alibag 402209</strong></p>
      <p style="margin:4px 0;font-size:13px;color:#94a3b8;">📞 <strong style="color:#cbd5e1;">+91 80875 41496</strong></p>
    </td></tr>
  </table>
  <br/>
  <div style="text-align:center;">
    <a href="https://sukhakartaholidayhome.in/user/dashboard" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;">View My Bookings →</a>
  </div>
</td></tr>
<tr><td style="background:#040709;border:1px solid rgba(249,115,22,0.15);border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;">
  <p style="margin:0 0 4px;font-size:13px;color:#f97316;">sukhakartaholidayhome@gmail.com · +91 80875 41496</p>
  <p style="margin:0;font-size:12px;color:#334155;">© ${new Date().getFullYear()} Sukhakarta Holiday Home, Alibag</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function adminEmailHtml(d: {
  customer_name: string; customer_email: string; customer_phone: string;
  room_name: string; check_in: string; check_out: string;
  guests: number; nights: number; total_amount: number; booking_id: string;
}): string {
  const fmt = (s: string) => new Date(s).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  // Escape all user data before HTML
  const n  = esc(d.customer_name);
  const em = esc(d.customer_email);
  const ph = esc(d.customer_phone);
  const r  = esc(d.room_name);
  const bid= esc(d.booking_id.slice(-8).toUpperCase());
  const amt= Number(d.total_amount).toLocaleString("en-IN");
  const nights = Math.max(1, Math.floor(d.nights));
  const guests = Math.max(1, Math.floor(d.guests));
  // WhatsApp message — sanitised separately, not injected into HTML
  const waMsg = encodeURIComponent(
    `Hi ${d.customer_name}! Your booking at Sukhakarta is confirmed.\nCheck-in: ${fmt(d.check_in)}, Check-out: ${fmt(d.check_out)}. We look forward to hosting you! 🏡`
  );

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>New Booking</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid rgba(34,197,94,0.3);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
  <p style="margin:0 0 8px;font-size:28px;">💰</p>
  <h2 style="margin:0;color:#4ade80;font-size:22px;font-weight:700;">New Booking Confirmed!</h2>
  <p style="margin:6px 0 0;color:#64748b;font-size:14px;">Payment received</p>
</td></tr>
<tr><td style="background:#1e293b;border-left:1px solid rgba(34,197,94,0.2);border-right:1px solid rgba(34,197,94,0.2);padding:28px 32px;">
  <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#22c55e;">Customer</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:20px;">
    ${[["Name",n],["Email","<a href='mailto:"+em+"' style='color:#60a5fa;text-decoration:none;'>"+em+"</a>"],["Phone","<a href='tel:+91"+ph+"' style='color:#60a5fa;text-decoration:none;'>+91 "+ph+"</a>"]].map(([l,v],i,a)=>`
    <tr><td style="padding:12px 16px;${i<a.length-1?"border-bottom:1px solid rgba(255,255,255,0.06);":""}">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:13px;color:#64748b;">${l}</td>
        <td align="right" style="font-size:13px;color:#f8fafc;font-weight:600;">${v}</td>
      </tr></table>
    </td></tr>`).join("")}
  </table>
  <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#22c55e;">Booking</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:24px;">
    ${[["Booking ID","#"+bid],["Room",r],["Check-in",fmt(d.check_in)],["Check-out",fmt(d.check_out)],["Duration",nights+" night"+(nights!==1?"s":"")+" · "+guests+" guest"+(guests!==1?"s":"")],["Total Paid","₹"+amt]].map(([l,v],i,a)=>`
    <tr><td style="padding:12px 16px;${i<a.length-1?"border-bottom:1px solid rgba(255,255,255,0.06);":""}">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:13px;color:#64748b;">${l}</td>
        <td align="right" style="font-size:13px;color:${l==="Total Paid"?"#f97316":"#f8fafc"};font-weight:${l==="Total Paid"?"700":"600"};">${v}</td>
      </tr></table>
    </td></tr>`).join("")}
  </table>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding-right:8px;" width="50%"><a href="https://sukhakartaholidayhome.in/admin/bookings" style="display:block;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;text-decoration:none;padding:12px;border-radius:10px;font-size:13px;font-weight:700;text-align:center;">View in Admin →</a></td>
      <td style="padding-left:8px;" width="50%"><a href="https://wa.me/91${ph}?text=${waMsg}" style="display:block;background:rgba(37,211,102,0.15);border:1px solid rgba(37,211,102,0.35);color:#25d366;text-decoration:none;padding:12px;border-radius:10px;font-size:13px;font-weight:700;text-align:center;">WhatsApp Guest</a></td>
    </tr>
  </table>
</td></tr>
<tr><td style="background:#0f172a;border:1px solid rgba(34,197,94,0.15);border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;">
  <p style="margin:0;font-size:12px;color:#334155;">Sukhakarta Admin · Alibag, Maharashtra</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

/* ── Resend API call ── */
async function sendEmail(opts: { to: string; subject: string; html: string; replyTo?: string }): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Sukhakarta Holiday Home <bookings@sukhakartaholidayhome.in>",
        to: opts.to, subject: opts.subject, html: opts.html, reply_to: opts.replyTo,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { ok: false, error: `Resend ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

/* ── Handler ── */
export async function POST(req: Request) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { booking_id, customer_name, customer_email, customer_phone,
          room_name, check_in, check_out, guests, total_amount } = body;

  // Validate required fields
  if (!booking_id || typeof booking_id !== "string") return NextResponse.json({ error: "Invalid booking_id" }, { status: 400 });
  if (!customer_name || typeof customer_name !== "string" || customer_name.length > 200) return NextResponse.json({ error: "Invalid customer_name" }, { status: 400 });
  if (!isValidEmail(String(customer_email ?? ""))) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (!isValidDate(String(check_in ?? "")) || !isValidDate(String(check_out ?? ""))) return NextResponse.json({ error: "Invalid dates" }, { status: 400 });

  const nights = Math.ceil((new Date(check_out).getTime() - new Date(check_in).getTime()) / 86_400_000);
  if (nights < 1 || nights > 365) return NextResponse.json({ error: "Invalid date range" }, { status: 400 });

  const amount = typeof total_amount === "number" && total_amount >= 0 ? total_amount : 0;
  const guestCount = typeof guests === "number" && guests > 0 ? Math.floor(guests) : 1;
  const phone = String(customer_phone ?? "").replace(/\D/g, "").slice(0, 15);

  const payload = {
    booking_id, customer_name, customer_email: String(customer_email),
    customer_phone: phone, room_name: String(room_name || "Room"),
    check_in: String(check_in), check_out: String(check_out),
    guests: guestCount, nights, total_amount: amount,
  };

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "sukhakartaholidayhome@gmail.com";

  const [custResult, adminResult] = await Promise.all([
    sendEmail({ to: payload.customer_email, subject: "Booking Confirmed ✓ — Sukhakarta Holiday Home", html: customerEmailHtml(payload), replyTo: ADMIN_EMAIL }),
    sendEmail({ to: ADMIN_EMAIL, subject: `New Booking: ${customer_name} · ${room_name} · ₹${amount.toLocaleString("en-IN")}`, html: adminEmailHtml(payload) }),
  ]);

  // Build WhatsApp URL (returned for optional admin use — not auto-sent)
  const waMsg = encodeURIComponent(
    `✅ Booking Confirmed – Sukhakarta Holiday Home\n\nHi ${customer_name}!\n🏠 Room: ${room_name}\n📅 Check-in: ${check_in}\n📅 Check-out: ${check_out}\n👥 Guests: ${guestCount}\n💰 Total: ₹${amount.toLocaleString("en-IN")}\n\n📍 House no 826, Aadarsh Nagar, Kurul, Alibag 402209\n📞 +91 80875 41496`
  );
  const whatsappUrl = phone ? `https://wa.me/91${phone}?text=${waMsg}` : null;

  return NextResponse.json({
    success: true,
    customer_email: { sent: custResult.ok },
    admin_email:    { sent: adminResult.ok },
    whatsappUrl,
  });
}
