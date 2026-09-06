"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const icons = {
  lock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  clipboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/>
    </svg>
  ),
  link: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  cookie: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
      <path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/>
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  fileText: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
};

export default function PrivacyPolicyContent() {
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
            <h1>Privacy Policy</h1>
            <p>Last updated: February 2026</p>
          </div>
        </div>

        <div className="container">
          <div className="policy-links">
            <Link href="/privacy-policy" className="policy-link active">Privacy Policy</Link>
            <Link href="/terms-of-service" className="policy-link">Terms of Service</Link>
            <Link href="/cancellation-policy" className="policy-link">Cancellation Policy</Link>
          </div>

          <div className="content-card">

            <section className="section">
              <h2><span className="icon">{icons.lock}</span> Information We Collect</h2>
              <p>When you register or make a booking on Sukhakarta Holiday Home, we collect the following information:</p>
              <ul>
                <li><strong>Personal Information:</strong> Full name, email address, and phone number provided during registration.</li>
                <li><strong>Booking Information:</strong> Check-in/check-out dates, number of guests, and room preferences.</li>
                <li><strong>Payment Information:</strong> We do not store your payment details. All transactions are processed securely.</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on the site, and browser/device information for analytics purposes.</li>
              </ul>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.clipboard}</span> How We Use Your Information</h2>
              <p>Your information is used solely to provide and improve our services:</p>
              <ul>
                <li>To process and confirm your bookings.</li>
                <li>To send booking confirmations and important updates via email.</li>
                <li>To respond to your inquiries and provide customer support.</li>
                <li>To improve our website experience based on usage patterns.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.link}</span> Sharing Your Information</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul>
                <li><strong>Service Providers:</strong> Trusted third-party services (e.g., email platforms) that assist us in operating our website.</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect the rights and safety of our guests and property.</li>
              </ul>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.cookie}</span> Cookies</h2>
              <p>We use cookies to enhance your browsing experience. These include session cookies (deleted when you close the browser) and preference cookies (to remember your settings). You may disable cookies through your browser settings, though some features of the site may not function correctly.</p>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.shield}</span> Data Security</h2>
              <p>We implement industry-standard security measures including SSL encryption, secure authentication, and regular security audits to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.user}</span> Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your account and associated data.</li>
                <li>Withdraw consent for marketing communications at any time.</li>
              </ul>
              <p>To exercise any of these rights, please contact us at <a href="mailto:sukhakartaholidayhome@gmail.com" className="email-link">sukhakartaholidayhome@gmail.com</a>.</p>
            </section>

            <div className="divider" />

            <section className="section">
              <h2><span className="icon">{icons.fileText}</span> Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. We encourage you to review this policy periodically.</p>
            </section>

            <div className="contact-box">
              <h3>Questions about your privacy?</h3>
              <p>We're happy to help clarify anything in this policy.</p>
              <a href="mailto:sukhakartaholidayhome@gmail.com" className="contact-btn">Contact Us</a>
            </div>

          </div>
        </div>
      </div>
      <Footer />

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
        .email-link { color: #f97316; text-decoration: none; }
        .email-link:hover { text-decoration: underline; }
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
