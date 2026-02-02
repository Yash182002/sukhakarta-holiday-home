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

  useEffect(() => {
  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [open]);

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


  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="logo-section">
          <img
            src="/logo.png"
            alt="Sukhakarta Holiday Home"
            className="logo-image"
            style={{ height: "80px", width: "auto", animation: "none" }}
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
              style={{ height: "50px", width: "auto", animation: "none" }}
            />
          </div>
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
          </Link>
        </div>
      </div>
    </header>
 );
}
      
