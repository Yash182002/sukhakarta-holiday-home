import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Rooms', href: '/rooms' },
    { name: 'Places to Visit', href: '/places' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Book Now', href: '/book' }
  ];

  const contactInfo = [
    { icon: '📞', label: 'Phone', value: '+91 80875 41496', href: 'tel:+918087541496' },
    { icon: '✉️', label: 'Email', value: 'sukhakartaholidayhome@gmail.com', href: 'mailto:sukhakartaholidayhome@gmail.com' },
    { icon: '📍', label: 'Location', value: 'Alibag, Maharashtra, India', href: '#' }
  ];

  const socialLinks = [
    { icon: '📘', name: 'Facebook', href: '#' },
    { icon: '📷', name: 'Instagram', href: '#' },
    { icon: '🐦', name: 'Twitter', href: '#' },
    { icon: '💬', name: 'WhatsApp', href: 'https://wa.me/918087541496' }
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
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-logo">
              <div className="brand-icon">🏖️</div>
              <div>
                <h3 className="brand-name">Sukhakarta</h3>
                <p className="brand-tagline">Holiday Home</p>
              </div>
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
                <span className="hours-time">2:00 PM</span>
              </div>
              <div className="hours-item highlight">
                <span className="hours-day">Check-out</span>
                <span className="hours-time">11:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="newsletter-section">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>Subscribe to Our Newsletter</h3>
              <p>Get special offers and updates delivered to your inbox</p>
            </div>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button className="newsletter-btn">
                Subscribe →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Sukhakarta Holiday Home. All rights reserved.
            </p>
            <div className="footer-links-bottom">
              <a href="#" className="footer-link-bottom">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="#" className="footer-link-bottom">Terms of Service</a>
              <span className="separator">•</span>
              <a href="#" className="footer-link-bottom">Cancellation Policy</a>
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
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(50px, -50px); }
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
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .brand-icon {
          font-size: 3rem;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .brand-name {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-tagline {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .brand-description {
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
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
        }

        .social-link:hover {
          background: rgba(249, 115, 22, 0.2);
          border-color: #f97316;
          transform: translateY(-3px);
        }

        .social-icon {
          font-size: 1.5rem;
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
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
          font-size: 1.5rem;
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

        .newsletter-section {
          margin-bottom: 3rem;
          padding: 2.5rem;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(14, 165, 233, 0.1));
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 20px;
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .newsletter-content {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          align-items: center;
        }

        .newsletter-text h3 {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          color: #f97316;
        }

        .newsletter-text p {
          color: #cbd5e1;
          margin: 0;
        }

        .newsletter-form {
          display: flex;
          gap: 1rem;
        }

        .newsletter-input {
          flex: 1;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s;
        }

        .newsletter-input:focus {
          border-color: #f97316;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .newsletter-input::placeholder {
          color: #64748b;
        }

        .newsletter-btn {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
          white-space: nowrap;
        }

        .newsletter-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.5);
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

          .newsletter-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }

          .footer-links-bottom {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
}
