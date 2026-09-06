"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const icons = {
  scroll: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  creditCard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  key: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  ),
  alertTriangle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  refreshCw: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  scale: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
      <line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  ),
};

export default function TermsOfService() {
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
            <h1>Terms of Service</h1>
            <p>Last updated: February 2026</p>
          </div>
        </div>

        <div className="container">
          <div className="policy-links">
            <Link href="/privacy-policy" className="policy-link">Privacy Policy</Link>
            <Link href="/terms-of-service" className="policy-link active">Terms of Service</Link>
            <Link href="/cancellation-policy" className="policy-link">Cancellation Policy</Link>
          </div>

          <div className="content-card">

            <section className="section">
              <h2><span className="icon">{icons.scroll}</span> Acceptance of Terms</h2>
              <p>By accessing or using the Sukhakarta Holiday Home website and booking services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.home}</span> Use of the Website</h2>
              <p>You agree to use this website only for lawful purposes and in a manner that does not infringe upon the rights of others. You must not:</p>
              <ul>
                <li>Provide false or misleading information during registration or booking.</li>
                <li>Attempt to gain unauthorized access to any part of the website.</li>
                <li>Use automated tools to scrape or collect data from the website.</li>
                <li>Engage in any conduct that disrupts or interferes with the website's functionality.</li>
              </ul>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.calendar}</span> Booking & Reservations</h2>
              <p>All bookings made through our website are subject to availability and confirmation. A booking is only confirmed once you receive a written confirmation email from us.</p>
              <ul>
                <li>You must be at least 18 years of age to make a booking.</li>
                <li>The number of guests must not exceed the stated room capacity.</li>
                <li>Bookings are non-transferable unless approved by management.</li>
                <li>We reserve the right to refuse a booking at our discretion.</li>
              </ul>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.creditCard}</span> Payments</h2>
              <p>All prices displayed on the website are in Indian Rupees (₹) and include applicable taxes unless stated otherwise.</p>
              <ul>
                <li>Payment is required at the time of booking or as specified during checkout.</li>
                <li>We accept payments via the methods listed on our booking page.</li>
                <li>We are not responsible for any additional charges applied by your bank or payment provider.</li>
              </ul>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.key}</span> Guest Responsibilities</h2>
              <p>As a guest, you agree to:</p>
              <ul>
                <li>Treat the property and its contents with care and respect.</li>
                <li>Comply with all house rules provided at check-in.</li>
                <li>Not engage in any illegal activities on the premises.</li>
                <li>Report any damage to the property immediately to management.</li>
                <li>Vacate the property by the agreed check-out time.</li>
              </ul>
              <p>You will be held liable for any damage caused to the property during your stay beyond normal wear and tear.</p>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.alertTriangle}</span> Limitation of Liability</h2>
              <p>Sukhakarta Holiday Home shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid by you for the booking in question.</p>
              <p>We are not responsible for loss or theft of personal belongings during your stay. Guests are advised to secure their valuables.</p>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.refreshCw}</span> Changes to Terms</h2>
              <p>We reserve the right to modify these Terms of Service at any time. Updated terms will be posted on this page with a revised date. Continued use of our services after changes constitutes acceptance of the updated terms.</p>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.scale}</span> Governing Law</h2>
              <p>These terms are governed by the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts in Maharashtra, India.</p>
            </section>

            <div className="contact-box">
              <h3>Have questions about our terms?</h3>
              <p>Our team is here to help you understand your rights and obligations.</p>
              <a href="mailto:sukhakartaholidayhome@gmail.com" className="contact-btn">Contact Us</a>
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
        .section { margin-bottom: 0; }
        .section h2 { display: flex; align-items: center; gap: 0.6rem; font-size: 1.15rem; font-weight: 700; color: #f97316; margin: 0 0 1rem; }
        .icon { display: flex; align-items: center; }
        .section p { color: #94a3b8; line-height: 1.8; margin: 0 0 0.75rem; font-size: 0.95rem; }
        .section p:last-child { margin-bottom: 0; }
        .section ul { list-style: none; padding: 0; margin: 0.5rem 0 0; display: flex; flex-direction: column; gap: 0.6rem; }
        .section ul li { color: #94a3b8; font-size: 0.95rem; line-height: 1.7; padding-left: 1.25rem; position: relative; }
        .section ul li::before { content: "›"; position: absolute; left: 0; color: #f97316; font-weight: 700; }
        .section strong { color: #cbd5e1; }
        .divider { height: 1px; background: rgba(249,115,22,0.1); margin: 2rem 0; }
        .contact-box { margin-top: 2.5rem; padding: 2rem; background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.2); border-radius: 14px; text-align: center; }
        .contact-box h3 { color: #fff; font-size: 1.1rem; margin: 0 0 0.4rem; }
        .contact-box p { color: #64748b; font-size: 0.9rem; margin: 0 0 1.25rem; }
        .contact-btn { display: inline-block; padding: 0.75rem 2rem; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 0.9rem; transition: opacity 0.2s; }
        .contact-btn:hover { opacity: 0.85; }
        @media (max-width: 640px) { .content-card { padding: 1.75rem 1.25rem; } .hero { padding: 60px 1.5rem 40px; } }
      `}</style>
    </div>
  );
}
