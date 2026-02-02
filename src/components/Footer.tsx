"use client";
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
    </footer>
  );
}
