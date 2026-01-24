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
    <header className="sticky top-0 z-[1000] bg-slate-950/85 backdrop-blur-md border-b border-orange-500/20">
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-2xl font-extrabold bg-gradient-to-r from-white to-orange-500 bg-clip-text text-transparent"
        >
          Sukhakarta
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative font-semibold transition-colors ${
                pathname === link.href 
                  ? "text-orange-500" 
                  : "text-gray-200 hover:text-white"
              } after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:bg-orange-500 after:transition-all ${
                pathname === link.href 
                  ? "after:w-full" 
                  : "after:w-0 hover:after:w-full"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-3xl text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden flex flex-col bg-slate-950/98 border-t border-orange-500/20">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-8 py-4 font-semibold border-b border-orange-500/10 ${
                pathname === link.href
                  ? "text-orange-500 bg-orange-500/10"
                  : "text-gray-200"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
