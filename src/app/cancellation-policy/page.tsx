"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const icons = {
  checkCircle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  zap: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  xCircle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  dollarSign: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  arrowLeftRight: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  cloud: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    </svg>
  ),
  tag: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
};

export default function CancellationPolicy() {
  return (
    <div className="page-root">
      <Navbar />
      <div className="policy-page">
        <div className="hero">
          <div className="hero-bg">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
          </div>
          <div className="hero-content">
            <span className="badge">Legal</span>
            <h1>Cancellation Policy</h1>
            <p>Last updated: February 2026</p>
          </div>
        </div>

        <div className="container">
          <div className="policy-links">
            <Link href="/privacy-policy" className="policy-link">Privacy Policy</Link>
            <Link href="/terms-of-service" className="policy-link">Terms of Service</Link>
            <Link href="/cancellation-policy" className="policy-link active">Cancellation Policy</Link>
          </div>

          <div className="content-card">

            <div className="summary-grid">
              <div className="summary-card summary-green">
                <div className="summary-icon summary-icon--green">{icons.checkCircle}</div>
                <div className="summary-label">Full Refund</div>
                <div className="summary-desc">Cancelled 7+ days before check-in</div>
              </div>
              <div className="summary-card summary-yellow">
                <div className="summary-icon summary-icon--yellow">{icons.zap}</div>
                <div className="summary-label summary-label--yellow">50% Refund</div>
                <div className="summary-desc">Cancelled 3–6 days before check-in</div>
              </div>
              <div className="summary-card summary-red">
                <div className="summary-icon summary-icon--red">{icons.xCircle}</div>
                <div className="summary-label summary-label--red">No Refund</div>
                <div className="summary-desc">Cancelled less than 3 days before check-in</div>
              </div>
            </div>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.calendar}</span> Cancellation Timeframes</h2>
              <p>All cancellation requests must be submitted in writing to <a href="mailto:sukhakartaholidayhome@gmail.com" className="email-link">sukhakartaholidayhome@gmail.com</a>. The cancellation date is determined by when we receive your written request.</p>
              <ul>
                <li><strong>7 or more days before check-in:</strong> Full refund of the booking amount, processed within 7 business days.</li>
                <li><strong>3 to 6 days before check-in:</strong> 50% refund of the total booking amount.</li>
                <li><strong>Less than 3 days before check-in:</strong> No refund will be issued. The full booking amount will be forfeited.</li>
                <li><strong>No-show:</strong> If you fail to check in on the booked date without prior notice, no refund will be provided.</li>
              </ul>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.mail}</span> How to Cancel</h2>
              <p>To cancel your booking, please follow these steps:</p>
              <ul>
                <li>Log in to your account and navigate to <strong>My Dashboard → My Bookings</strong>.</li>
                <li>Locate the booking you wish to cancel and note your booking reference number.</li>
                <li>Send a cancellation request to <a href="mailto:sukhakartaholidayhome@gmail.com" className="email-link">sukhakartaholidayhome@gmail.com</a> with your booking reference number and reason for cancellation.</li>
                <li>You will receive a confirmation of your cancellation within 24 hours.</li>
              </ul>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.dollarSign}</span> Refund Process</h2>
              <p>Approved refunds will be processed within 7–10 business days from the date of cancellation confirmation. Refunds will be credited to the original payment method used at the time of booking.</p>
              <p>We are not responsible for any delays caused by your bank or payment provider in processing the refund.</p>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.arrowLeftRight}</span> Modifications & Rescheduling</h2>
              <p>If you wish to change your booking dates rather than cancel, please contact us at least <strong>5 days before</strong> your original check-in date. Date changes are subject to availability and may incur a rescheduling fee of ₹500.</p>
              <ul>
                <li>Rescheduling requests within 3 days of check-in will be treated as a cancellation.</li>
                <li>Rescheduled bookings cannot be rescheduled a second time.</li>
                <li>The difference in room rate (if any) will be charged or refunded accordingly.</li>
              </ul>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.cloud}</span> Force Majeure</h2>
              <p>In exceptional circumstances beyond our control — such as natural disasters, government-imposed restrictions, or public health emergencies — we will work with guests on a case-by-case basis to offer full refunds, date changes, or credit vouchers. Please contact us immediately if you believe your situation qualifies.</p>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.tag}</span> Special & Non-Refundable Rates</h2>
              <p>Bookings made under promotional, discounted, or non-refundable rates are not eligible for refunds under any circumstances. These rates are clearly marked during the booking process. Please review your booking type before confirming.</p>
            </section>

            <div className="contact-box">
              <h3>Need to cancel or modify your booking?</h3>
              <p>Reach out to us as soon as possible — we'll do our best to help.</p>
              <a href="mailto:sukhakartaholidayhome@gmail.com" className="contact-btn">Email Us to Cancel</a>
            </div>

          </div>
        </div>
      </div>
      <Footer />

      {/* ── CHANGED: style jsx global so html/body selectors work ── */}
      <style jsx global>{`
        html, body { background: #04070f !important; }

        .page-root { background: #04070f; min-height: 100vh; }

        .policy-page { color: white; font-family: system-ui, -apple-system, sans-serif; }
        .hero { position: relative; padding: 80px 2rem 60px; text-align: center; overflow: hidden; border-bottom: 1px solid rgba(249,115,22,0.15); }
        .hero-bg { position: absolute; inset: 0; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.2; }
        .orb-1 { width: 400px; height: 400px; background: #f97316; top: -150px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: #0ea5e9; bottom: -100px; left: -80px; }
        .hero-content { position: relative; z-index: 1; }
        .badge { display: inline-block; padding: 4px 14px; background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3); border-radius: 20px; font-size: 0.8rem; color: #f97316; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem; }
        .hero-content h1 { font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; margin: 0 0 0.5rem; background: linear-gradient(135deg, #fff, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-content p { color: #64748b; font-size: 0.95rem; margin: 0; }
        .container { max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
        .policy-links { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 2.5rem; }
        .policy-link { padding: 0.5rem 1.25rem; border-radius: 8px; border: 1px solid rgba(249,115,22,0.2); color: #94a3b8; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: all 0.2s; }
        .policy-link:hover { color: #f97316; border-color: rgba(249,115,22,0.5); }
        .policy-link.active { background: rgba(249,115,22,0.15); border-color: #f97316; color: #f97316; }
        .content-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(249,115,22,0.15); border-radius: 20px; padding: 3rem; }

        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .summary-card { padding: 1.5rem 1rem; border-radius: 14px; text-align: center; border: 1px solid; }
        .summary-green { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.25); }
        .summary-yellow { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.25); }
        .summary-red { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.25); }
        .summary-icon { display: flex; justify-content: center; margin-bottom: 0.6rem; }
        .summary-icon--green { color: #22c55e; }
        .summary-icon--yellow { color: #fbbf24; }
        .summary-icon--red { color: #ef4444; }
        .summary-label { font-size: 1rem; font-weight: 700; color: #22c55e; margin-bottom: 0.35rem; }
        .summary-label--yellow { color: #fbbf24; }
        .summary-label--red { color: #ef4444; }
        .summary-desc { font-size: 0.8rem; color: #64748b; line-height: 1.5; }

        .section { margin-bottom: 0; }
        .section h2 { display: flex; align-items: center; gap: 0.6rem; font-size: 1.15rem; font-weight: 700; color: #f97316; margin: 0 0 1rem; }
        .icon { display: flex; align-items: center; }
        .section p { color: #94a3b8; line-height: 1.8; margin: 0 0 0.75rem; font-size: 0.95rem; }
        .section p:last-child { margin-bottom: 0; }
        .section ul { list-style: none; padding: 0; margin: 0.5rem 0 0; display: flex; flex-direction: column; gap: 0.6rem; }
        .section ul li { color: #94a3b8; font-size: 0.95rem; line-height: 1.7; padding-left: 1.25rem; position: relative; }
        .section ul li::before { content: "›"; position: absolute; left: 0; color: #f97316; font-weight: 700; }
        .section strong { color: #cbd5e1; }
        .email-link { color: #f97316; text-decoration: none; }
        .email-link:hover { text-decoration: underline; }
        .divider { height: 1px; background: rgba(249,115,22,0.1); margin: 2rem 0; }
        .contact-box { margin-top: 2.5rem; padding: 2rem; background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.2); border-radius: 14px; text-align: center; }
        .contact-box h3 { color: #fff; font-size: 1.1rem; margin: 0 0 0.4rem; }
        .contact-box p { color: #64748b; font-size: 0.9rem; margin: 0 0 1.25rem; }
        .contact-btn { display: inline-block; padding: 0.75rem 2rem; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 0.9rem; transition: opacity 0.2s; }
        .contact-btn:hover { opacity: 0.85; }
        @media (max-width: 640px) { .content-card { padding: 1.75rem 1.25rem; } .hero { padding: 60px 1.5rem 40px; } .summary-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
