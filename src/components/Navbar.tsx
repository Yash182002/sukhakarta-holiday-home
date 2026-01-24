"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Rooms", href: "/rooms" },
  { name: "Book", href: "/book" },
  { name: "Places", href: "/places" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link href="/" className="logo">
          Sukhakarta
        </Link>

        {/* Desktop Menu */}
        <nav className="nav-links">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${
                pathname === link.href ? "active" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-link ${
                pathname === link.href ? "active" : ""
              }`}
              onClick={() => setOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-size: 1.6rem;
          font-weight: 800;
          text-decoration: none;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          color: #e5e7eb;
          text-decoration: none;
          font-weight: 600;
          position: relative;
          transition: color 0.3s;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 0;
          height: 2px;
          background: #f97316;
          transition: width 0.3s;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        .nav-link.active {
          color: #f97316;
        }

        .menu-btn {
          display: none;
          font-size: 1.8rem;
          background: none;
          border: none;
          color: #f8fafc;
          cursor: pointer;
        }

        .mobile-menu {
          display: none;
        }

        @media (max-width: 900px) {
          .nav-links {
            display: none;
          }

          .menu-btn {
            display: block;
          }

          .mobile-menu {
            display: flex;
            flex-direction: column;
            background: rgba(15, 23, 42, 0.98);
            border-top: 1px solid rgba(249, 115, 22, 0.2);
          }

          .mobile-link {
            padding: 1rem 2rem;
            color: #e5e7eb;
            text-decoration: none;
            font-weight: 600;
            border-bottom: 1px solid rgba(249, 115, 22, 0.1);
          }

          .mobile-link.active {
            color: #f97316;
            background: rgba(249, 115, 22, 0.1);
          }
        }
      `}</style>
    </header>
  );
}
