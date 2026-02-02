"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Professional SVG Icons
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

  const contactMethods = [
    {
      icon: <PhoneIcon />,
      title: "Call Us",
      details: "+91 80875 41496",
      subtext: "Mon - Sun, 8 AM - 10 PM",
      action: "tel:+918087541496",
      color: "#0ea5e9"
    },
    {
      icon: <WhatsAppIcon />,
      title: "WhatsApp",
      details: "Quick Response",
      subtext: "Available 24/7",
      action: "https://wa.me/918087541496",
      color: "#22c55e"
    },
    {
      icon: <MailIcon />,
      title: "Email",
      details: "sukhakartaholidayhome@gmail.com",
      subtext: "Response within 24 hours",
      action: "mailto:sukhakartaholidayhome@gmail.com",
      color: "#f97316"
    },
    {
      icon: <MapPinIcon />,
      title: "Visit Us",
      details: "Alibag, Maharashtra",
      subtext: "Get Directions",
      action: "#map",
      color: "#ec4899"
    }
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const message = `Contact Form Submission

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}
Subject: ${formData.subject}

Message:
${formData.message}`;

    const whatsappUrl = `https://wa.me/918087541496?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");

    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: ""
      });
    }, 3000);
  };

  return (
    <div className="contact-page">
      <div className="bg-canvas">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="hero">
        <div className="hero-content">
          <h1>Get In Touch</h1>
          <p>We're here to help and answer any question you might have</p>
        </div>
      </div>

      <div className="container">
        <div className="methods-grid">
          {contactMethods.map((method, idx) => (
            <a
              key={idx}
              href={method.action}
              target={method.action.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="method-card"
              style={
                {
                  animationDelay: `${idx * 0.1}s`,
                  "--hover-color": method.color
                } as CSSProperties
              }
            >
              <div className="method-icon">{method.icon}</div>
              <h3>{method.title}</h3>
              <p className="method-details">{method.details}</p>
              <p className="method-subtext">{method.subtext}</p>
              <div className="method-arrow"><ArrowIcon /></div>
            </a>
          ))}
        </div>

        <div className="content-grid">
          <div className="form-section">
            <h2>Send Us a Message</h2>
            <p className="form-subtitle">Fill out the form below and we'll get back to you soon</p>

            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourmail@gmail.com"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <select name="subject" value={formData.subject} onChange={handleChange}>
                <option value="general">General Inquiry</option>
                <option value="booking">Booking Question</option>
                <option value="feedback">Feedback</option>
                <option value="complaint">Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                placeholder="Tell us how we can help you..."
              />
            </div>

            <button 
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loader">Sending...</span>
              ) : (
                <>Send Message <span className="btn-arrow"><ArrowIcon /></span></>
              )}
            </button>
          </div>

          <div className="info-section">
            <div className="info-card">
              <h3>Location</h3>
              <p>Sukhakarta Holiday Home</p>
              <p>Alibag Beach Road</p>
              <p>Alibag, Maharashtra 402201</p>
              <p>India</p>
            </div>

            <div className="info-card">
              <h3>Business Hours</h3>
              <div className="hours-list">
                <div className="hours-item">
                  <span>Monday - Friday</span>
                  <span>8:00 AM - 10:00 PM</span>
                </div>
                <div className="hours-item">
                  <span>Saturday - Sunday</span>
                  <span>7:00 AM - 11:00 PM</span>
                </div>
                <div className="hours-item highlight">
                  <span>Check-in Time</span>
                  <span>2:00 PM</span>
                </div>
                <div className="hours-item highlight">
                  <span>Check-out Time</span>
                  <span>11:00 AM</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="#" className="social-btn">
                  <span>Facebook</span>
                </a>
                <a href="#" className="social-btn">
                  <span>Instagram</span>
                </a>
                <a href="#" className="social-btn">
                  <span>Twitter</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="map-section" id="map">
          <h2>Find Us</h2>
          <div className="map-placeholder">
            <div className="map-icon"><MapPinIcon /></div>
            <h3>Sukhakarta Holiday Home</h3>
            <p>Alibag, Maharashtra, India</p>
            <button className="map-btn">Open in Google Maps</button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="modal">
          <div className="modal-content">
            <div className="success-icon"><CheckIcon /></div>
            <h3>Message Sent!</h3>
            <p>We'll get back to you as soon as possible</p>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .contact-page {
          min-height: 100vh;
          background: #0f172a;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
          isolation: isolate;
          overflow-x: hidden;
          width: 100%;
        }

        .bg-canvas {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .orb {
            filter: blur(60px);
            opacity: 0.2;
          }
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: #f97316;
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: #0ea5e9;
          bottom: -150px;
          right: -150px;
          animation-delay: 5s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: #22c55e;
          top: 50%;
          left: 50%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(100px, -100px) scale(1.1);
          }
          66% {
            transform: translate(-100px, 100px) scale(0.9);
          }
        }

        .hero {
          position: relative;
          padding: 8rem 1rem 4rem;
          text-align: center;
          z-index: 1;
          width: 100%;
        }

        .hero-content {
          max-width: 100%;
          overflow-wrap: break-word;
        }

        .hero-content h1 {
          font-size: clamp(2.5rem, 8vw, 5rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 0.8s ease-out;
          word-wrap: break-word;
        }

        .hero-content p {
          font-size: clamp(1rem, 3vw, 1.3rem);
          color: #cbd5e1;
          animation: fadeInUp 0.8s ease-out 0.2s both;
          padding: 0 1rem;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .container {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 0 1rem 4rem;
          position: relative;
          z-index: 1;
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .container {
            padding: 0 2rem 4rem;
          }
        }

        .methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
          gap: 1rem;
          margin-bottom: 4rem;
          width: 100%;
        }

        @media (min-width: 640px) {
          .methods-grid {
            gap: 2rem;
          }
        }

        .method-card {
          position: relative;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(249, 115, 22, 0.2);
          border-radius: 24px;
          text-align: center;
          text-decoration: none;
          color: #f8fafc;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          animation: cardSlide 0.6s ease-out both;
          min-width: 0;
        }

        @media (min-width: 640px) {
          .method-card {
            padding: 2rem;
          }
        }

        @keyframes cardSlide {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .method-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--hover-color);
          transform: scaleX(0);
          transition: transform 0.4s;
        }

        .method-card:hover::before {
          transform: scaleX(1);
        }

        @media (hover: hover) {
          .method-card:hover {
            transform: translateY(-6px);
            border-color: var(--hover-color);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
        }

        .method-icon {
          color: var(--hover-color);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .method-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--hover-color);
          word-wrap: break-word;
        }

        @media (min-width: 640px) {
          .method-card h3 {
            font-size: 1.5rem;
          }
        }

        .method-details {
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          word-wrap: break-word;
          overflow-wrap: anywhere;
        }

        .method-subtext {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .method-arrow {
          margin-top: 1rem;
          color: var(--hover-color);
          transition: transform 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (hover: hover) {
          .method-card:hover .method-arrow {
            transform: translateX(10px);
          }
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 4rem;
          width: 100%;
        }

        @media (min-width: 968px) {
          .content-grid {
            grid-template-columns: 1.5fr 1fr;
            gap: 3rem;
          }
        }

        .form-section, .info-section {
          animation: fadeIn 0.8s ease-out;
          min-width: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .form-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 24px;
          padding: 1.5rem;
        }

        @media (min-width: 640px) {
          .form-section {
            padding: 2.5rem;
          }
        }

        .form-section h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          word-wrap: break-word;
        }

        @media (min-width: 640px) {
          .form-section h2 {
            font-size: 2rem;
          }
        }

        .form-subtitle {
          color: #94a3b8;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
          font-weight: 500;
          font-size: 0.95rem;
        }

        input, select, textarea {
          width: 100%;
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 1rem;
          transition: all 0.3s;
          box-sizing: border-box;
        }

        @media (min-width: 640px) {
          input, select, textarea {
            padding: 1rem;
          }
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #f97316;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        input::placeholder, textarea::placeholder {
          color: #64748b;
        }

        textarea {
          resize: vertical;
          min-height: 120px;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        @media (min-width: 640px) {
          .submit-btn {
            font-size: 1.1rem;
            padding: 1.2rem 2rem;
          }
        }

        @media (hover: hover) {
          .submit-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
          }
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-arrow {
          transition: transform 0.3s;
          display: flex;
          align-items: center;
        }

        @media (hover: hover) {
          .submit-btn:hover .btn-arrow {
            transform: translateX(5px);
          }
        }

        .loader {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 20px;
          padding: 1.5rem;
          min-width: 0;
        }

        .info-card h3 {
          color: #f97316;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          word-wrap: break-word;
        }

        @media (min-width: 640px) {
          .info-card h3 {
            font-size: 1.3rem;
          }
        }

        .info-card p {
          color: #cbd5e1;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
          word-wrap: break-word;
        }

        .hours-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .hours-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          color: #cbd5e1;
          font-size: 0.9rem;
          gap: 0.5rem;
        }

        .hours-item span {
          word-wrap: break-word;
        }

        .hours-item.highlight {
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          color: #f97316;
          font-weight: 600;
        }

        .social-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .social-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 12px;
          color: #f8fafc;
          text-decoration: none;
          transition: all 0.3s;
          font-size: 0.95rem;
        }

        @media (hover: hover) {
          .social-btn:hover {
            background: rgba(249, 115, 22, 0.1);
            border-color: #f97316;
            transform: translateX(5px);
          }
        }

        .map-section {
          animation: fadeInUp 0.8s ease-out 0.4s both;
          width: 100%;
        }

        .map-section h2 {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          word-wrap: break-word;
        }

        @media (min-width: 640px) {
          .map-section h2 {
            font-size: 2.5rem;
          }
        }

        .map-placeholder {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(14, 165, 233, 0.1));
          border: 2px solid rgba(249, 115, 22, 0.3);
          border-radius: 24px;
          padding: 3rem 1.5rem;
          text-align: center;
        }

        @media (min-width: 640px) {
          .map-placeholder {
            padding: 4rem 2rem;
          }
        }

        .map-icon {
          color: #f97316;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .map-placeholder h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #f97316;
          word-wrap: break-word;
        }

        @media (min-width: 640px) {
          .map-placeholder h3 {
            font-size: 2rem;
          }
        }

        .map-placeholder p {
          color: #cbd5e1;
          margin-bottom: 2rem;
          word-wrap: break-word;
        }

        .map-btn {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.95rem;
        }

        @media (hover: hover) {
          .map-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(249, 115, 22, 0.5);
          }
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
          padding: 1rem;
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(249, 115, 22, 0.2));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(34, 197, 94, 0.3);
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          animation: scaleIn 0.4s ease-out;
          max-width: 90%;
        }

        @media (min-width: 640px) {
          .modal-content {
            padding: 3rem;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          animation: bounce 0.6s ease-out;
        }

        .modal-content h3 {
          margin-bottom: 0.5rem;
          color: #22c55e;
          font-size: 1.5rem;
        }

        @media (min-width: 640px) {
          .modal-content h3 {
            font-size: 1.75rem;
          }
        }

        .modal-content p {
          color: #cbd5e1;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}
