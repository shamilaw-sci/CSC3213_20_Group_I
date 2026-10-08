"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { User } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "How It Works", href: "/#how-it-works" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-purple-700 to-blue-300">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between gap-5 p-6 lg:px-8">
        <Link href="/" className="font-semibold text-white">TryVora</Link>

        <div className="hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-semibold text-white hover:underline">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-4 lg:flex">
            <Link href="/login" className="text-sm font-semibold text-white hover:underline">Log in</Link>
            <Link href="/register" className="text-sm font-semibold text-white hover:underline">Register</Link>
          </div>
          <Link href="/login" className="hidden rounded-lg border border-white/70 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:inline-flex">Login as Merchant</Link>
          <Link href="/profile" aria-label="Profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
            <User size={18} />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open main menu"
            className="rounded-md p-2 text-white lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-slate-950/50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-semibold">TryVora</Link>
            <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="rounded-md p-2">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-white/10">
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-white/20" />
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-white/10">Profile</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-white/10">Log in</Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-white/10">Register</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-white px-3 py-3 font-semibold text-indigo-700 hover:bg-indigo-50">Login as Merchant</Link>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
