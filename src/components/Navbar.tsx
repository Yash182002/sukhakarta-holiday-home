"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Rooms", href: "/rooms", icon: "🏨" },
  { name: "Book Now", href: "/book", icon: "📅" },
  { name: "Places", href: "/places", icon: "📍" },
  { name: "About", href: "/about", icon: "ℹ️" },
  { name: "Contact", href: "/contact", icon: "📧" }
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

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  // Icon SVG components
  const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );

  const RoomsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="9" y1="9" x2="15" y2="9"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );

  const PlacesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );

  const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );

  const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );

  const ArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );

  const getIcon = (href: string) => {
    switch(href) {
      case "/": return <HomeIcon />;
      case "/rooms": return <RoomsIcon />;
      case "/book": return <CalendarIcon />;
      case "/places": return <PlacesIcon />;
      case "/about": return <InfoIcon />;
      case "/contact": return <MailIcon />;
      default: return null;
    }
  };

  return (
    <>
      <style jsx global>{`
        html, body {
          overflow-x: hidden;
          width: 100%;
        }
      
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(249, 115, 22, 0.15);
          width: 100%;
        }

        .navbar.scrolled {
          background: rgba(15, 23, 42, 0.95);
          border-bottom: 1px solid rgba(249, 115, 22, 0.3);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.6rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          position: relative;
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0.5rem 1rem;
          }
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          position: relative;
          z-index: 1001;
        }

        .logo-image {
          height: 48px;
          width: auto;
          max-width: 160px;
          object-fit: contain;
        }

        @media (max-width: 768px) {
          .logo-image {
            height: 40px;
            max-width: 140px;
          }
        }

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
          display: flex;
          align-items: center;
          justify-content: center;
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
        }

        .cta-button {
          display: none;
        }

        @media (min-width: 1024px) {
          .cta-button {
            display: flex;
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
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.5);
        }

        .mobile-menu-btn {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 28px;
          height: 22px;
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

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(10px);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease;
          z-index: 998;
        }
        
        .mobile-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 75%;
          max-width: 320px;
          height: 100vh;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(249, 115, 22, 0.2);
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -20px 0 60px rgba(0, 0, 0, 0.6);
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
          min-height: 64px;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mobile-logo .logo-image {
          height: 36px;
          max-width: 120px;
        }

        .mobile-nav-links {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background: rgba(249, 115, 22, 0.15);
          border-color: rgba(249, 115, 22, 0.3);
          color: #f97316;
          transform: translateX(5px);
        }

        .mobile-nav-link .nav-text {
          flex: 1;
        }

        .mobile-nav-link .nav-arrow {
          opacity: 0;
          transition: all 0.3s;
          display: flex;
          align-items: center;
        }

        .mobile-nav-link:hover .nav-arrow,
        .mobile-nav-link.active .nav-arrow {
          opacity: 1;
        }

        .mobile-menu-footer {
          padding: 1.5rem 1rem;
          border-top: 1px solid rgba(249, 115, 22, 0.2);
          padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
        }

        .mobile-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.125rem 1.5rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          text-decoration: none;
          font-weight: 700;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
          transition: all 0.3s;
          text-align: center;
        }

        .mobile-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
        }

        @media (min-width: 1024px) {
          .mobile-menu,
          .mobile-overlay {
            display: none;
          }
        }
      `}</style>

      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <Link href="/" className="logo-section">
            <img
              src="/logo.png"
              alt="Sukhakarta Holiday Home"
              className="logo-image"
            />
          </Link>

          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? "active" : ""}`}
              >
                <span className="nav-icon">{getIcon(link.href)}</span>
                <span className="nav-text">{link.name}</span>
                {pathname === link.href && (
                  <span className="active-indicator" />
                )}
              </Link>
            ))}
          </nav>

          <Link href="/book" className="cta-button">
            <span>Book Your Stay</span>
          </Link>

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
      </header>

      <div
        className={`mobile-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <img
              src="/logo.png"
              alt="Sukhakarta Holiday Home"
              className="logo-image"
            />
          </div>
        </div>

        <nav className="mobile-nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-nav-link ${
                pathname === link.href ? "active" : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{getIcon(link.href)}</span>
              <span className="nav-text">{link.name}</span>
              <span className="nav-arrow"><ArrowIcon /></span>
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
          </Link>
        </div>
      </div>
    </>
  );
}
