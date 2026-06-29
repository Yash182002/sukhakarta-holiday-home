"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CSSProperties } from "react";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "general", message: ""
  });
  const [errors, setErrors]         = useState<FormErrors>({});
  const [touched, setTouched]       = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── IntersectionObserver reveal (same as BookingPage / PlacesToVisit) ──
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.setProperty("--revealed", "1");
            entry.target.classList.add("in-view");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) =>
      observerRef.current?.observe(el)
    );
  }, []);

  useEffect(() => {
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;
    raf = requestAnimationFrame(() => { timeout = setTimeout(setupObserver, 50); });
    return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
  }, [setupObserver]);

  useEffect(() => {
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, []);

  // ── Validation ──
  const validateName = (v: string) => {
    if (!v.trim()) return "Name is required";
    if (v.trim().length < 2) return "Name must be at least 2 characters";
    if (v.trim().length > 50) return "Name must not exceed 50 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(v)) return "Name can only contain letters, spaces, hyphens, and apostrophes";
    if (/\s{2,}/.test(v)) return "Name cannot contain multiple consecutive spaces";
    return undefined;
  };
  const validateEmail = (v: string) => {
    if (!v.trim()) return "Email is required";
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)) return "Please enter a valid email address";
    if (v.length > 254) return "Email address is too long";
    if (/\.\./.test(v)) return "Email cannot contain consecutive dots";
    return undefined;
  };
  const validatePhone = (v: string) => {
    if (!v.trim()) return undefined;
    const n = v.replace(/[^0-9]/g, "");
    if (n.length !== 10) return "Phone number must be exactly 10 digits";
    if (!/^[6-9]/.test(n)) return "Indian mobile numbers must start with 6, 7, 8, or 9";
    if (/^(\d)\1{9}$/.test(n)) return "Please enter a valid phone number";
    return undefined;
  };
  const validateMessage = (v: string) => {
    if (!v.trim()) return "Message is required";
    if (v.trim().length < 10) return "Message must be at least 10 characters";
    if (v.trim().length > 1000) return "Message must not exceed 1000 characters";
    return undefined;
  };

  // ── Icons ──
  const PhoneIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
  const WhatsAppIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );
  const MailIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const MapPinIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
  const ArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
  const CheckIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
  const AlertIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );

  const contactMethods = [
    { icon: <PhoneIcon />,    title: "Call Us",   details: "+91 80875 41496",                      subtext: "Mon - Sun, 8 AM - 10 PM", action: "tel:+918087541496",                          color: "#0ea5e9" },
    { icon: <WhatsAppIcon />, title: "WhatsApp",  details: "Quick Response",                       subtext: "Available 24/7",          action: "https://wa.me/918087541496",                 color: "#22c55e" },
    { icon: <MailIcon />,     title: "Email",     details: "sukhakartaholidayhome@gmail.com",       subtext: "Response within 24 hours",action: "mailto:sukhakartaholidayhome@gmail.com",      color: "#f97316" },
    { icon: <MapPinIcon />,   title: "Visit Us",  details: "Alibag, Maharashtra",                  subtext: "Get Directions",          action: "#map",                                       color: "#ec4899" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const n = value.replace(/[^0-9]/g, "");
      if (n.length <= 10) {
        setFormData(p => ({ ...p, phone: n }));
        if (touched[name]) setErrors(p => ({ ...p, phone: validatePhone(n) }));
      }
    } else {
      setFormData(p => ({ ...p, [name]: value }));
      if (touched[name]) {
        const err = name === "name" ? validateName(value) : name === "email" ? validateEmail(value) : name === "message" ? validateMessage(value) : undefined;
        setErrors(p => ({ ...p, [name]: err }));
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched(p => ({ ...p, [field]: true }));
    const val = formData[field as keyof typeof formData] as string;
    const err = field === "name" ? validateName(val) : field === "email" ? validateEmail(val) : field === "phone" ? validatePhone(val) : field === "message" ? validateMessage(val) : undefined;
    setErrors(p => ({ ...p, [field]: err }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateName(formData.name), email: validateEmail(formData.email),
      phone: validatePhone(formData.phone), message: validateMessage(formData.message),
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, message: true });
    return !Object.values(newErrors).some(e => e !== undefined);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    const msg = `Contact Form Submission\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;
    window.open(`https://wa.me/918087541496?text=${encodeURIComponent(msg)}`, "_blank");
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({ name: "", email: "", phone: "", subject: "general", message: "" });
      setErrors({}); setTouched({});
    }, 3000);
  };

  const isFormValid = () => !errors.name && !errors.email && !errors.phone && !errors.message && formData.name.trim() && formData.email.trim() && formData.message.trim();

  return (
    <div className="contact-page">

      {/*
       * FIX 1: contain:strict bg-mesh replaces position:fixed orbs.
       * Orbs used transform:translate() @keyframes = GPU upload every frame.
       * mesh-layer-2 animates opacity only → pure compositor, zero paint.
       */}
      <div className="bg-mesh" aria-hidden="true">
        <div className="mesh-layer-1" />
        <div className="mesh-layer-2" />
        <div className="grid-overlay" />
      </div>

      {/* ── Hero — badge + title + subtitle, matches all other pages ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">✦ Contact Us ✦</div>
          <h1 className="hero-title">Get In Touch</h1>
          <p className="hero-subtitle">We're here to help and answer any question you might have</p>
        </div>
      </section>

      <div className="container">

        {/* Contact method cards */}
        <div className="methods-grid">
          {contactMethods.map((method, i) => (
            <a
              key={i}
              href={method.action}
              target={method.action.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="method-card reveal"
              style={{ "--delay": `${i * 80}ms`, "--hover-color": method.color } as CSSProperties}
            >
              <div className="method-icon">{method.icon}</div>
              <h3>{method.title}</h3>
              <p className="method-details">{method.details}</p>
              <p className="method-subtext">{method.subtext}</p>
              <div className="method-arrow"><ArrowIcon /></div>
            </a>
          ))}
        </div>

        {/* Form + Info */}
        <div className="content-grid">

          <div className="form-section reveal" style={{ "--delay": "0ms" } as CSSProperties}>
            <h2>Send Us a Message</h2>
            <p className="form-subtitle">Fill out the form below and we'll get back to you soon</p>

            <div className="form-group">
              <label>Your Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                onBlur={() => handleBlur("name")} placeholder="Enter your full name"
                className={`input ${touched.name && errors.name ? "error" : ""}`} />
              {touched.name && errors.name && (
                <div className="error-message"><AlertIcon /><span>{errors.name}</span></div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  onBlur={() => handleBlur("email")} placeholder="yourname@example.com"
                  className={`input ${touched.email && errors.email ? "error" : ""}`} />
                {touched.email && errors.email && (
                  <div className="error-message"><AlertIcon /><span>{errors.email}</span></div>
                )}
              </div>
              <div className="form-group">
                <label>Phone (Indian)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  onBlur={() => handleBlur("phone")} placeholder="10-digit mobile number"
                  maxLength={10} inputMode="numeric" pattern="[0-9]*"
                  className={`input ${touched.phone && errors.phone ? "error" : ""}`} />
                {touched.phone && errors.phone && (
                  <div className="error-message"><AlertIcon /><span>{errors.phone}</span></div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <select name="subject" value={formData.subject} onChange={handleChange} className="input">
                <option value="general">General Inquiry</option>
                <option value="booking">Booking Question</option>
                <option value="feedback">Feedback</option>
                <option value="complaint">Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Message * (minimum 10 characters)</label>
              <textarea name="message" value={formData.message} onChange={handleChange}
                onBlur={() => handleBlur("message")} rows={6}
                placeholder="Tell us how we can help you..."
                className={`input ${touched.message && errors.message ? "error" : ""}`} />
              <div className="char-count">{formData.message.length}/1000 characters</div>
              {touched.message && errors.message && (
                <div className="error-message"><AlertIcon /><span>{errors.message}</span></div>
              )}
            </div>

            <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting || !isFormValid()}>
              {isSubmitting ? <span className="loader">Sending...</span> : "Send Message"}
            </button>
          </div>

          <div className="info-section reveal" style={{ "--delay": "120ms" } as CSSProperties}>
            <div className="info-card">
              <h3>Location</h3>
              <p>Sukhakarta Holiday Home</p>
              <p>House no 826, Aadarsh Nagar, Kurul,</p>
              <p>Alibag, Maharashtra 402201</p>
              <p>India</p>
            </div>
            <div className="info-card">
              <h3>Business Hours</h3>
              <div className="hours-list">
                <div className="hours-item"><span>Monday - Friday</span><span>8:00 AM - 10:00 PM</span></div>
                <div className="hours-item"><span>Saturday - Sunday</span><span>7:00 AM - 11:00 PM</span></div>
                <div className="hours-item highlight"><span>Check-in Time</span><span>12:00 PM</span></div>
                <div className="hours-item highlight"><span>Check-out Time</span><span>11:00 AM</span></div>
              </div>
            </div>
            <div className="info-card">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="https://www.instagram.com/sukhakarta.holiday.home/" target="_blank" rel="noopener noreferrer" className="social-btn">
                  <span>Instagram</span>
                </a>
                <a href="https://wa.me/918087541496" target="_blank" rel="noopener noreferrer" className="social-btn">
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Map */}
        <div className="map-section reveal" id="map" style={{ "--delay": "0ms" } as CSSProperties}>
          <h2>Find Us</h2>
          <div className="map-container">
            <iframe
              src="https://maps.google.com/maps?q=Sukhakarta%20Holiday%20Home%2C%20House%20no%20826%2C%20Aadarsh%20Nagar%2C%20Kurul%2C%20Alibag%2C%20Maharashtra%20402209&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="Sukhakarta Holiday Home Location"
            />
          </div>
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <a href="https://maps.app.goo.gl/z2MFwbGfMcDXR16dA" target="_blank" rel="noopener noreferrer" className="map-btn">
              Open in Google Maps
            </a>
          </div>
        </div>

      </div>

      {/* Success modal */}
      {showSuccess && (
        <div className="modal">
          <div className="modal-content">
            <div className="success-icon"><CheckIcon /></div>
            <h3>Message Sent!</h3>
            <p>We'll get back to you as soon as possible</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        /*
         * CONTACT PAGE — same performance patterns as BookingPage / PlacesToVisit / AboutPage
         *
         * FIX 1: bg-mesh contain:strict replaces position:fixed animating orbs.
         *        Orbs ran transform:translate() @keyframes = paint every frame.
         *        mesh-layer-2 animates opacity only → pure compositor, zero paint.
         *
         * FIX 2: .reveal + IntersectionObserver — cards and sections animate only
         *        as they enter the viewport, staggered via --delay CSS variable.
         *        Replaces always-on @keyframes cardSlide / fadeIn / fadeInUp.
         *
         * FIX 3: transition: all → explicit properties on all interactive elements.
         *
         * FIX 4: Hero matches every other page: badge (fadeInDown 0.7s) →
         *        title (fadeInUp 0.8s 0.15s) → subtitle (fadeInUp 0.8s 0.3s).
         */

        *, *::before, *::after { box-sizing: border-box; }

        .contact-page {
          min-height: 100vh;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
          background: #04070f;
          overflow-x: hidden;
        }

        /* ── FIX 1: bg-mesh ── */
        .bg-mesh {
          position: fixed; inset: 0; z-index: 0;
          pointer-events: none; contain: strict;
        }
        .mesh-layer-1 {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 100% 0%,  rgba(249,115,22,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 0%  100%, rgba(14,165,233,0.14)  0%, transparent 60%),
            linear-gradient(160deg, #04070f 0%, #0b1220 50%, #04070f 100%);
        }
        .mesh-layer-2 {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(249,115,22,0.05) 0%, transparent 70%);
          animation: mesh-pulse 8s ease-in-out infinite alternate;
          will-change: opacity;
        }
        @keyframes mesh-pulse { from { opacity: 0.4; } to { opacity: 1; } }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── FIX 2: reveal ── */
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition:
            opacity   0.65s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms),
            transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms);
          will-change: opacity, transform;
          contain: layout style;
        }
        .reveal.in-view { opacity: 1; transform: translateY(0); }

        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; contain: none; }
          .mesh-layer-2 { animation: none; }
        }

        /* ── Hero ── */
        .hero {
          position: relative; z-index: 1;
          padding: 9rem 1.5rem 4rem;
          text-align: center;
        }
        /* FIX 4: badge — fadeInDown 0.7s, matches reference */
        .hero-badge {
          display: inline-block;
          font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.25em; text-transform: uppercase;
          color: #f97316;
          padding: 0.5rem 1.25rem;
          border: 1px solid rgba(249,115,22,0.4);
          border-radius: 100px;
          margin-bottom: 2rem;
          background: rgba(249,115,22,0.08);
          animation: fadeInDown 0.7s ease-out both;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* FIX 4: title — 0.8s 0.15s, matches reference */
        .hero-title {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: clamp(2.8rem, 7vw, 5rem);
          font-weight: 700; line-height: 1.05;
          letter-spacing: -0.02em;
          background: linear-gradient(140deg, #fff 0%, #f4d5b8 50%, #f97316 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 1.25rem;
          animation: fadeInUp 0.8s ease-out 0.15s both;
        }
        /* FIX 4: subtitle — 0.8s 0.3s, matches reference */
        .hero-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.4rem);
          color: rgba(240,244,248,0.8); font-weight: 300;
          margin: 0;
          animation: fadeInUp 0.8s ease-out 0.3s both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Container ── */
        .container {
          max-width: 1400px; width: 100%;
          margin: 0 auto;
          padding: 0 1.5rem 5rem;
          position: relative; z-index: 1;
        }

        /* ── Contact method cards ── */
        .methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
          gap: 1.5rem;
          margin-bottom: 4rem;
        }

        /* FIX 3: explicit transitions */
        .method-card {
          position: relative;
          padding: 1.75rem 1.5rem;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(249,115,22,0.2);
          border-radius: 24px;
          text-align: center;
          text-decoration: none;
          color: #f8fafc;
          transition:
            transform     0.35s cubic-bezier(0.22,1,0.36,1),
            border-color  0.25s ease,
            box-shadow    0.35s ease;
          will-change: transform;
          overflow: hidden;
        }
        /* shimmer sweep — composited via transform */
        .method-card::before {
          content: '';
          position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          transition: transform 0.5s ease;
          will-change: transform;
        }
        .method-card:hover::before { transform: translateX(200%); }
        .method-card:hover {
          transform: translateY(-8px);
          border-color: var(--hover-color);
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
        }
        .method-icon {
          color: var(--hover-color);
          margin-bottom: 1rem;
          display: flex; justify-content: center;
        }
        .method-card h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--hover-color); }
        .method-details { font-weight: 600; margin-bottom: 0.4rem; font-size: 0.88rem; word-break: break-word; }
        .method-subtext { font-size: 0.82rem; color: #94a3b8; }
        .method-arrow {
          margin-top: 1rem; color: var(--hover-color);
          display: flex; justify-content: center;
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
          will-change: transform;
        }
        .method-card:hover .method-arrow { transform: translateX(8px); }

        /* ── Content grid ── */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 4rem;
        }
        @media (min-width: 968px) {
          .content-grid { grid-template-columns: 1.5fr 1fr; gap: 3rem; }
        }

        /* ── Form section ── */
        .form-section {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 24px;
          padding: 2rem;
        }
        @media (min-width: 640px) { .form-section { padding: 2.5rem; } }
        .form-section h2 {
          font-size: 1.75rem; margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .form-subtitle { color: #94a3b8; margin-bottom: 2rem; font-size: 0.9rem; }

        .form-group { margin-bottom: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 640px) { .form-row { grid-template-columns: 1fr 1fr; } }

        label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-weight: 500; font-size: 0.95rem; }

        /* FIX 3: explicit transitions on inputs */
        .input {
          width: 100%; padding: 0.875rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(249,115,22,0.3);
          border-radius: 12px;
          color: #f8fafc; font-size: 1rem;
          font-family: inherit;
          transition:
            border-color 0.2s ease,
            background   0.2s ease,
            box-shadow   0.2s ease;
        }
        .input:focus {
          outline: none;
          border-color: #f97316;
          background: rgba(255,255,255,0.13);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
        .input.error { border-color: #ef4444; background: rgba(239,68,68,0.07); }
        .input.error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .input::placeholder { color: #475569; }
        select.input option { background: #0f172a; color: #f8fafc; }

        .char-count { font-size: 0.78rem; color: #475569; margin-top: 0.4rem; text-align: right; }
        .error-message {
          display: flex; align-items: center; gap: 0.4rem;
          color: #fca5a5; font-size: 0.83rem; margin-top: 0.4rem;
        }

        /* FIX 3: explicit submit button transitions */
        .submit-btn {
          width: 100%; padding: 1.1rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none; border-radius: 12px;
          color: white; font-size: 1rem; font-weight: 600;
          cursor: pointer; font-family: inherit;
          transition:
            transform    0.3s cubic-bezier(0.22,1,0.36,1),
            box-shadow   0.3s ease;
          will-change: transform;
          box-shadow: 0 8px 28px rgba(249,115,22,0.35);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249,115,22,0.55);
        }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .loader { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

        /* ── Info section ── */
        .info-section { display: flex; flex-direction: column; gap: 1.5rem; }
        .info-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249,115,22,0.18);
          border-radius: 20px;
          padding: 1.5rem;
        }
        .info-card h3 { color: #f97316; margin-bottom: 1rem; font-size: 1.15rem; }
        .info-card p { color: #cbd5e1; margin-bottom: 0.4rem; font-size: 0.93rem; }

        .hours-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .hours-item {
          display: flex; justify-content: space-between;
          padding: 0.7rem 0.9rem;
          background: rgba(255,255,255,0.04);
          border-radius: 8px; color: #cbd5e1; font-size: 0.88rem;
        }
        .hours-item.highlight {
          background: rgba(249,115,22,0.1);
          border: 1px solid rgba(249,115,22,0.25);
          color: #f97316; font-weight: 600;
        }

        .social-links { display: flex; flex-direction: column; gap: 0.75rem; }
        /* FIX 3: explicit social btn transitions */
        .social-btn {
          display: flex; align-items: center; gap: 1rem;
          padding: 0.9rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 12px; color: #f8fafc; text-decoration: none;
          transition:
            background    0.2s ease,
            border-color  0.2s ease,
            transform     0.3s cubic-bezier(0.22,1,0.36,1);
          will-change: transform;
        }
        .social-btn:hover {
          background: rgba(249,115,22,0.1);
          border-color: #f97316;
          transform: translateX(5px);
        }

        /* ── Map ── */
        .map-section { width: 100%; }
        .map-section h2 {
          text-align: center; font-size: 2rem; margin-bottom: 2rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .map-container {
          width: 100%; border-radius: 24px; overflow: hidden;
          border: 2px solid rgba(249,115,22,0.3);
          background: rgba(255,255,255,0.03);
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }
        .map-container iframe {
          display: block; width: 100%; height: 350px;
        }
        @media (min-width: 768px) { .map-container iframe { height: 450px; } }

        /* FIX 3: explicit map-btn transitions */
        .map-btn {
          display: inline-block; text-decoration: none;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-radius: 12px; color: white; font-weight: 600;
          font-size: 0.95rem;
          transition:
            transform    0.3s cubic-bezier(0.22,1,0.36,1),
            box-shadow   0.3s ease;
          will-change: transform;
          box-shadow: 0 8px 24px rgba(249,115,22,0.35);
        }
        .map-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(249,115,22,0.55);
        }

        /* ── Modal ── */
        .modal {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.95); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1.5rem;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-content {
          background: linear-gradient(135deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(34,197,94,0.3);
          border-radius: 24px; padding: 3rem;
          text-align: center; max-width: 420px; width: 100%;
          animation: scaleIn 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .success-icon {
          width: 80px; height: 80px; margin: 0 auto 1.5rem;
          background: #22c55e; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: white;
          animation: bounce 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes bounce { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .modal-content h3 { margin-bottom: 0.5rem; color: #22c55e; font-size: 1.75rem; }
        .modal-content p { color: #cbd5e1; font-size: 0.95rem; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .hero { padding: 6.5rem 1rem 3rem; }
          .container { padding: 0 1rem 4rem; }
          .methods-grid { gap: 1rem; }
          .form-section { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
