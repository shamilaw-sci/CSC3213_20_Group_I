"use client";

import Link from "next/link";
import { User } from "lucide-react";
import CartButton from "@/features/cart/components/CartButton";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "How it Works", href: "/how-it-works" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            AI
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Universal AI
            </h1>
            <p className="text-xs text-gray-500">
              Fitting Room
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* Shopping Cart */}
          <CartButton />

          {/* Profile */}
          <button
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition"
            aria-label="Profile"
          >
            <User size={18} />
          </button>

        </div>

      </div>
    </nav>
  );
}