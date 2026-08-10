"use client";

import Link from "next/link";
import { Sparkles, ShoppingCart } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <Link href="/" className="font-bold text-xl text-violet-700">
          Tryvora
        </Link>

        <nav className="hidden md:flex gap-6 text-gray-700">
          <Link href="/">Home</Link>
          <Link href="/explore">Explore</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/how-it-works">How it Works</Link>
        </nav>

       <div className="flex items-center gap-4">
  <Link href="/login">
  <button className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700">
    Sign In
  </button>
</Link>

  <ShoppingCart className="w-5 h-5 text-black cursor-pointer hover:text-violet-600" />
</div>
      </div>
    </header>
  );
}
