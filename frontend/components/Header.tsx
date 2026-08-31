/** WBS-Shared | Owner: All members | Branch: reviewed integration branch | Scope: Shared application foundation. */
"use client";

import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { useAuth } from ../features/auth/context/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "My fitting room", href: "/profile" },
  { label: "How it works", href: "/#how-it-works" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, ready } = useAuth();

  return (
    <header className="bg-gradient-to-r from-purple-700 to-blue-500">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="text-xl font-bold text-white">TryVora</Link>
        <div className="hidden items-center gap-8 lg:flex">{navLinks.map((link) => <Link key={link.href} href={link.href} className="text-sm font-semibold text-white/90 hover:text-white">{link.label}</Link>)}</div>
        <div className="hidden items-center gap-4 lg:flex">
          {ready && user ? <>{user.role !== "MERCHANT" && <Link href="/merchant/onboarding" className="text-sm font-semibold text-white">Become a merchant</Link>}{user.role === "MERCHANT" && <Link href="/merchant" className="text-sm font-semibold text-white">Merchant Dashboard</Link>}<Link href="/profile" className="text-sm font-semibold text-white">Hi, {user.name}</Link><button type="button" onClick={logout} className="rounded-lg border border-white/70 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">Log out</button></> : <><Link href="/login" className="text-sm font-semibold text-white">Log in</Link><Link href="/register" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Register</Link></>}
        </div>
        <button type="button" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)} className="rounded-md p-2 text-white lg:hidden"><Bars3Icon className="h-6 w-6" /></button>
      </nav>
      {mobileMenuOpen && <div className="fixed inset-0 z-50 bg-slate-950/80 lg:hidden" onClick={() => setMobileMenuOpen(false)}><div className="ml-auto flex h-full w-full max-w-sm flex-col bg-slate-950 p-6" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><span className="text-xl font-bold text-white">TryVora</span><button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="rounded-md p-2 text-white"><XMarkIcon className="h-6 w-6" /></button></div><div className="mt-8 space-y-2">{navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-3 text-base font-semibold text-white hover:bg-white/10">{link.label}</Link>)}</div><div className="mt-6 border-t border-white/10 pt-6">{user ? <><Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-3 font-semibold text-white">My profile</Link><button type="button" onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full rounded-lg border border-white/30 px-3 py-3 text-left font-semibold text-white">Log out</button></> : <div className="space-y-2"><Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-3 font-semibold text-white">Log in</Link><Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-white px-3 py-3 font-semibold text-indigo-700">Register</Link></div>}</div></div></div>}
    </header>
  );
}
