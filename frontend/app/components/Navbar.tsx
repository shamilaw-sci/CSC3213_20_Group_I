"use client";

import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "How it Works", href: "/how-it-works" },
];

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600" />
          <span className="font-semibold text-gray-900">Universal AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.label === "Explore"
                  ? "text-indigo-600 font-medium"
                  : "text-gray-500 hover:text-gray-900"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-900" aria-label="Cart">
          <ShoppingCart size={20} />
        </button>
        <button
          className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white"
          aria-label="Profile"
        >
          <User size={16} />
        </button>
      </div>
    </nav>
  );
}
