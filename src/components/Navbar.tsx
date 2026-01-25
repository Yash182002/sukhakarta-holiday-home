"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Rooms", href: "/rooms" },
  { name: "Book Now", href: "/book" },
  { name: "Places", href: "/places" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="logo-section">
          <img
            src="/logo.png"
            alt="Sukhakarta Holiday Home"
            className="logo-image"
            style={{ animation: "none" }}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          {navLinks.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "active" : ""}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="nav-text">{link.name}</span>
              {pathname === link.href && (
                <span className="active-indicator" />
              )}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link href="/book" className="cta-button desktop-only">
          <span>Book Your Stay</span>
          <span className="cta-arrow">→</span>
        </Link>

        {/* Mobile Button */}
        <button
          className={`mobile-menu-btn ${open ? "open" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`mobile-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <img
              src="/logo.png"
              alt="Sukhakarta Holiday Home"
              className="logo-image"
              style={{ animation: "none" }}
            />
          </div>

          <button className="close-btn" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <nav className="mobile-nav-links">
          {navLinks.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-nav-link ${
                pathname === link.href ? "active" : ""
              }`}
              onClick={() => setOpen(false)}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <span className="nav-text">{link.name}</span>
              <span className="nav-arrow">→</span>
            </Link>
          ))}
        </nav>

        <div className="mobile-menu-footer">
          <Link
            href="/book"
            className="mobile-cta"
            onClick={() => setOpen(false)}
          >
            <span>Book Your Stay Now</span>
            <span className="cta-icon">🎉</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(249, 115, 22, 0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .navbar.scrolled {
          background: rgba(15, 23, 42, 0.95);
          border-bottom: 1px solid rgba(249, 115, 22, 0.3);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        /* Logo Section */
        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          position: relative;
          z-index: 1001;
        }

        .logo-icon {
          font-size: 2.5rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-main {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #f97316, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        .logo-sub {
          font-size: 0.75rem;
          color: #94a3b8;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 0.5rem;
        }

        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex;
          }
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: 12px;
          transition: all 0.3s;
          animation: slideDown 0.5s ease-out both;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .nav-link:hover {
          color: #f97316;
          background: rgba(249, 115, 22, 0.1);
        }

        .nav-link.active {
          color: #f97316;
          background: rgba(249, 115, 22, 0.15);
        }

        .nav-icon {
          font-size: 1.2rem;
          transition: transform 0.3s;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.2);
        }

        .active-indicator {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #f97316, transparent);
          border-radius: 3px 3px 0 0;
          animation: expand 0.4s ease-out;
        }

        @keyframes expand {
          from { width: 0; }
          to { width: 40%; }
        }

        /* CTA Button */
        .cta-button {
          display: none;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          text-decoration: none;
          font-weight: 700;
          border-radius: 50px;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
          transition: all 0.3s;
          white-space: nowrap;
        }

        @media (min-width: 1024px) {
          .cta-button {
            display: flex;
          }
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.5);
        }

        .cta-arrow {
          transition: transform 0.3s;
        }

        .cta-button:hover .cta-arrow {
          transform: translateX(5px);
        }

        .desktop-only {
          display: none;
        }

        @media (min-width: 1024px) {
          .desktop-only {
            display: flex;
          }
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 30px;
          height: 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 1001;
          position: relative;
        }

        @media (min-width: 1024px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        .mobile-menu-btn span {
          width: 100%;
          height: 3px;
          background: #f97316;
          border-radius: 3px;
          transition: all 0.3s;
        }

        .mobile-menu-btn.open span:nth-child(1) {
          transform: rotate(45deg) translate(8px, 8px);
        }

        .mobile-menu-btn.open span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-btn.open span:nth-child(3) {
          transform: rotate(-45deg) translate(8px, -8px);
        }

        /* Mobile Overlay */
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
          z-index: 999;
        }

        .mobile-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 90%;
          max-width: 400px;
          height: 100vh;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(249, 115, 22, 0.2);
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .mobile-menu.open {
          right: 0;
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mobile-logo .logo-icon {
          font-size: 2rem;
        }

        .mobile-logo .logo-main {
          font-size: 1.25rem;
        }

        .mobile-logo .logo-sub {
          font-size: 0.65rem;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          color: #f97316;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(249, 115, 22, 0.2);
          transform: rotate(90deg);
        }

        .mobile-nav-links {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(249, 115, 22, 0.1);
          border-radius: 16px;
          transition: all 0.3s;
          animation: slideInRight 0.4s ease-out both;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background: rgba(249, 115, 22, 0.15);
          border-color: rgba(249, 115, 22, 0.3);
          color: #f97316;
          transform: translateX(5px);
        }

        .mobile-nav-link .nav-icon {
          font-size: 1.5rem;
        }

        .mobile-nav-link .nav-text {
          flex: 1;
        }

        .mobile-nav-link .nav-arrow {
          opacity: 0;
          transition: all 0.3s;
        }

        .mobile-nav-link:hover .nav-arrow,
        .mobile-nav-link.active .nav-arrow {
          opacity: 1;
          transform: translateX(5px);
        }

        .mobile-menu-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(249, 115, 22, 0.2);
        }

        .mobile-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          text-decoration: none;
          font-weight: 700;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
          margin-bottom: 1rem;
          transition: all 0.3s;
        }

        .mobile-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
        }

        .cta-icon {
          font-size: 1.5rem;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 12px;
          color: #cbd5e1;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s;
        }

        .contact-item:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: #f97316;
          color: #f97316;
        }

        @media (min-width: 1024px) {
          .mobile-menu,
          .mobile-overlay {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
