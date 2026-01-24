"use client";

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const contactMethods = [
    {
      icon: '📞',
      title: 'Call Us',
      details: '+91 80875 41496',
      subtext: 'Mon - Sun, 8 AM - 10 PM',
      action: 'tel:+918087541496',
      color: '#0ea5e9'
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      details: 'Quick Response',
      subtext: 'Available 24/7',
      action: 'https://wa.me/918087541496',
      color: '#22c55e'
    },
    {
      icon: '✉️',
      title: 'Email',
      details: 'info@sukhakarta.com',
      subtext: 'Response within 24 hours',
      action: 'mailto:info@sukhakarta.com',
      color: '#f97316'
    },
    {
      icon: '📍',
      title: 'Visit Us',
      details: 'Alibag, Maharashtra',
      subtext: 'Get Directions',
      action: '#map',
      color: '#ec4899'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const message = `🏖️ Contact Form Submission

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Subject: ${formData.subject}

Message:
${formData.message}`;

    const whatsappUrl = `https://wa.me/918087541496?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="contact-page">
      {/* Animated Background */}
      <div className="bg-canvas">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1>Get In Touch</h1>
          <p>We're here to help and answer any question you might have</p>
        </div>
      </div>

      <div className="container">
        {/* Contact Methods Grid */}
        <div className="methods-grid">
          {contactMethods.map((method, idx) => (
            <a
              key={idx}
              href={method.action}
              target={method.action.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="method-card"
              style={{ 
                animationDelay: `${idx * 0.1}s`,
                '--hover-color': method.color 
              }}
            >
              <div className="method-icon">{method.icon}</div>
              <h3>{method.title}</h3>
              <p className="method-details">{method.details}</p>
              <p className="method-subtext">{method.subtext}</p>
              <div className="method-arrow">→</div>
            </a>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Contact Form */}
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
                placeholder="John Doe"
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
                  placeholder="john@example.com"
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
                rows="6"
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
                <>Send Message <span className="btn-arrow">→</span></>
              )}
            </button>
          </div>

          {/* Info Sidebar */}
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
                  <span>f</span>
                  <span>Facebook</span>
                </a>
                <a href="#" className="social-btn">
                  <span>📷</span>
                  <span>Instagram</span>
                </a>
                <a href="#" className="social-btn">
                  <span>🐦</span>
                  <span>Twitter</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section" id="map">
          <h2>Find Us</h2>
          <div className="map-placeholder">
            <div className="map-icon">📍</div>
            <h3>Sukhakarta Holiday Home</h3>
            <p>Alibag, Maharashtra, India</p>
            <button className="map-btn">Open in Google Maps</button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal">
          <div className="modal-content">
            <div className="success-icon">✓</div>
            <h3>Message Sent!</h3>
            <p>We'll get back to you as soon as possible</p>
          </div>
        </div>
      )}

      style={{
  animationDelay: `${idx * 0.1}s`,
  '--hover-color': method.color
} as React.CSSProperties}
{`
        .contact-page {
          min-height: 100vh;
          background: #0f172a;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
        }

        .bg-canvas {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 0;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
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
          padding: 8rem 2rem 4rem;
          text-align: center;
          z-index: 1;
        }

        .hero-content h1 {
          font-size: clamp(3rem, 8vw, 5rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 0.8s ease-out;
        }

        .hero-content p {
          font-size: 1.3rem;
          color: #cbd5e1;
          animation: fadeInUp 0.8s ease-out 0.2s both;
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
          margin: 0 auto;
          padding: 0 2rem 4rem;
          position: relative;
          z-index: 1;
        }

        .methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .method-card {
          position: relative;
          padding: 2rem;
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
        }

        @keyframes cardSlide {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        .method-card:hover {
          transform: translateY(-10px);
          border-color: var(--hover-color);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .method-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .method-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--hover-color);
        }

        .method-details {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .method-subtext {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .method-arrow {
          margin-top: 1rem;
          font-size: 1.5rem;
          color: var(--hover-color);
          transition: transform 0.3s;
        }

        .method-card:hover .method-arrow {
          transform: translateX(10px);
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }

        .form-section, .info-section {
          animation: fadeIn 0.8s ease-out;
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
          padding: 2.5rem;
        }

        .form-section h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .form-subtitle {
          color: #94a3b8;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        input, select, textarea {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 1rem;
          transition: all 0.3s;
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
        }

        .submit-btn {
          width: 100%;
          padding: 1.2rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-arrow {
          transition: transform 0.3s;
        }

        .submit-btn:hover .btn-arrow {
          transform: translateX(5px);
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
        }

        .info-card h3 {
          color: #f97316;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .info-card p {
          color: #cbd5e1;
          margin-bottom: 0.5rem;
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
        }

        .social-btn:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: #f97316;
          transform: translateX(5px);
        }

        .social-btn span:first-child {
          font-size: 1.5rem;
        }

        .map-section {
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .map-section h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .map-placeholder {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(14, 165, 233, 0.1));
          border: 2px solid rgba(249, 115, 22, 0.3);
          border-radius: 24px;
          padding: 4rem 2rem;
          text-align: center;
        }

        .map-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .map-placeholder h3 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #f97316;
        }

        .map-placeholder p {
          color: #cbd5e1;
          margin-bottom: 2rem;
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
        }

        .map-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.5);
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
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(249, 115, 22, 0.2));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(34, 197, 94, 0.3);
          border-radius: 24px;
          padding: 3rem;
          text-align: center;
          animation: scaleIn 0.4s ease-out;
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
          font-size: 3rem;
          color: white;
          animation: bounce 0.6s ease-out;
        }

        .modal-content h3 {
          margin-bottom: 0.5rem;
          color: #22c55e;
        }

        .modal-content p {
          color: #cbd5e1;
        }

        @media (max-width: 968px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .methods-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .hero {
            padding: 6rem 1rem 3rem;
          }
        }
      `}</style>
    </div>
  );
}
