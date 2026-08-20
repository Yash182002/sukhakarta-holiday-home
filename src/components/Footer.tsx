"use client";
import React from 'react';
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Professional SVG Icons
  const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );

  const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );

  const MapPinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );

  const TwitterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );

  const WhatsAppIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Rooms', href: '/rooms' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Places to Visit', href: '/places' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blogs', href: '/blog' },
    { name: 'Book Now', href: '/book' }
  ];

  const contactInfo = [
    { icon: <PhoneIcon />, label: 'Phone', value: '+91 80875 41496', href: 'tel:+918087541496' },
    { icon: <MailIcon />, label: 'Email', value: 'sukhakartaholidayhome@gmail.com', href: 'mailto:sukhakartaholidayhome@gmail.com' },
    { icon: <MapPinIcon />, label: 'Location', value: 'Alibag, Maharashtra, India', href: 'https://maps.app.goo.gl/z2MFwbGfMcDXR16dA' }
  ];

  const socialLinks = [
    // { icon: <FacebookIcon />, name: 'Facebook', href: '#' },
    { icon: <InstagramIcon />, name: 'Instagram', href: 'https://www.instagram.com/sukhakarta.holiday.home/' },
    { icon: <WhatsAppIcon />, name: 'WhatsApp', href: 'https://wa.me/918087541496' rel="nofollow noopener noreferrer" target="_blank"}
  ];

  return (
    <footer className="footer">
      {/* Animated Background */}
      <div className="footer-bg">
        <div className="footer-orb orb-1"></div>
        <div className="footer-orb orb-2"></div>
      </div>

      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Brand Section with Logo */}
          <div className="footer-brand">
           <div className="brand-logo">
            <Image
              src="/logo.webp"
              alt="Sukhakarta Holiday Home"
              width={289}
              height={140}
              loading="lazy"
              style={{ width: "auto", height: "80px", maxWidth: "100%" }}
              />
            </div>
              <p className="brand-description">
              Experience luxury coastal living in the heart of Alibag. Your perfect beach getaway awaits.
            </p>
            <div className="social-links">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  <span className="social-icon">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="footer-link">
                    <span className="link-arrow">→</span>
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="contact-list">
              {contactInfo.map((contact, idx) => (
                <a
                  key={idx}
                  href={contact.href}
                  className="contact-item"
                >
                  <span className="contact-icon">{contact.icon}</span>
                  <div>
                    <p className="contact-label">{contact.label}</p>
                    <p className="contact-value">{contact.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Business Hours */}
          <div className="footer-section">
            <h4 className="footer-heading">Business Hours</h4>
            <div className="hours-list">
              <div className="hours-item">
                <span className="hours-day">Monday - Friday</span>
                <span className="hours-time">8 AM - 10 PM</span>
              </div>
              <div className="hours-item">
                <span className="hours-day">Saturday - Sunday</span>
                <span className="hours-time">7 AM - 11 PM</span>
              </div>
              <div className="hours-item highlight">
                <span className="hours-day">Check-in</span>
                <span className="hours-time">12:00 PM</span>
              </div>
              <div className="hours-item highlight">
                <span className="hours-day">Check-out</span>
                <span className="hours-time">11:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-trust-row">
            <span className="trust-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              SSL Secured
            </span>
            <span className="trust-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              NOC Approved · Alibag
            </span>
            <span className="trust-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              House no 826, Kurul, Alibag 402209
            </span>
            <span className="trust-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              +91 80875 41496
            </span>
          </div>
            <p className="copyright">
              © {currentYear} Sukhakarta Holiday Home. All rights reserved.
            </p>
            <div className="footer-links-bottom">
              <a href="/privacy-policy" className="footer-link-bottom">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="/terms-of-service" className="footer-link-bottom">Terms of Service</a>
              <span className="separator">•</span>
              <a href="/cancellation-policy" className="footer-link-bottom">Cancellation Policy</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          position: relative;
          background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }

        .footer-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 0;
        }

        .footer-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: #f97316;
          top: -200px;
          left: -200px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: #0ea5e9;
          bottom: -150px;
          right: -150px;
          animation-delay: 10s;
        }

        @keyframes float {
          from { transform: translateY(0); }
          to { transform: translateY(20px); }
        }

        .footer-container {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 4rem 2rem 2rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 3rem;
          margin-bottom: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .footer-brand {
          animation: fadeInUp 0.6s ease-out;
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

        .brand-logo {
          margin-bottom: 1.5rem;
        }

        .footer-logo-img {
          height: 80px;
          width: auto;
          max-width: 100%;
          object-fit: contain;
        }

        .brand-description {
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .social-link {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.3s;
          color: #f97316;
        }

        .social-link:hover {
          background: rgba(249, 115, 22, 0.2);
          border-color: #f97316;
          transform: translateY(-3px);
        }

        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-section {
          animation: fadeInUp 0.6s ease-out;
        }

        .footer-heading {
          font-size: 1.3rem;
          margin-bottom: 1.5rem;
          color: #f97316;
          font-weight: 700;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        @media (max-width: 768px) {
          .footer-links {
            grid-template-columns: 1fr;
          }
        }

        .footer-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.3s;
          padding: 0.5rem 0;
        }

        .footer-link:hover {
          color: #f97316;
          transform: translateX(5px);
        }

        .link-arrow {
          color: #f97316;
          transition: transform 0.3s;
        }

        .footer-link:hover .link-arrow {
          transform: translateX(5px);
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s;
        }

        .contact-item:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: #f97316;
        }

        .contact-icon {
          color: #f97316;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0.25rem;
        }

        .contact-label {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0 0 0.25rem 0;
        }

        .contact-value {
          color: #cbd5e1;
          margin: 0;
          font-weight: 500;
          word-break: break-word;
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
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 8px;
        }

        .hours-item.highlight {
          background: rgba(249, 115, 22, 0.1);
          border-color: rgba(249, 115, 22, 0.3);
        }

        .hours-day {
          color: #cbd5e1;
        }

        .hours-time {
          color: #f97316;
          font-weight: 600;
        }

        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid rgba(249, 115, 22, 0.2);
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .copyright {
          color: #94a3b8;
          margin: 0;
        }

        .footer-links-bottom {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .footer-link-bottom {
          color: #cbd5e1;
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-link-bottom:hover {
          color: #f97316;
        }

        .separator {
          color: #64748b;
        }

        @media (max-width: 968px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }

          .footer-links-bottom {
            flex-wrap: wrap;
            justify-content: center;
          }
          .footer-trust-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem 1.5rem;
            justify-content: center;
            align-items: center;
            margin-bottom: 1.5rem;
            padding: 1rem 1.5rem;
            background: rgba(249,115,22,0.04);
            border: 1px solid rgba(249,115,22,0.12);
            border-radius: 14px;
            width: 100%;
          }
          .trust-chip {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.78rem;
            font-weight: 500;
            color: #94a3b8;
            letter-spacing: 0.02em;
            padding: 0;
            background: none;
            border: none;
            border-radius: 0;
          }
          .trust-chip svg {
            color: #f97316;
            flex-shrink: 0;
            opacity: 0.85;
          }
          .trust-chip-divider {
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: rgba(249,115,22,0.3);
            flex-shrink: 0;
          }
        }
        .footer-trust-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem 1.5rem;
            justify-content: center;
            align-items: center;
            margin-bottom: 1.5rem;
            padding: 1rem 1.5rem;
            background: rgba(249,115,22,0.04);
            border: 1px solid rgba(249,115,22,0.12);
            border-radius: 14px;
            width: 100%;
          }
          .trust-chip {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.78rem;
            font-weight: 500;
            color: #94a3b8;
            letter-spacing: 0.02em;
            padding: 0;
            background: none;
            border: none;
            border-radius: 0;
          }
          .trust-chip svg {
            color: #f97316;
            flex-shrink: 0;
            opacity: 0.85;
          }
          .trust-chip-divider {
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: rgba(249,115,22,0.3);
            flex-shrink: 0;
          }
      `}</style>
    </footer>
  );
}
