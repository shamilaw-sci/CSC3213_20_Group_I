"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu as AccountMenu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Menu, User, X } from "lucide-react";
import CartButton from "@/features/cart/components/CartButton";
import { useAuth } from "@/features/auth/context/AuthContext";
import CustomerSidebar from "../dashboard/CustomerSidebar";

const homeLink = { label: "Home", href: "/" };
const exploreLink = { label: "Explore", href: "/explore" };
const howItWorksLink = { label: "How It Works", href: "/#how-it-works" };

export default function Navbar() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authError, setAuthError] = useState("");

  const role = ready ? user?.role : undefined;
  const navLinks = role === "CUSTOMER"
    ? [homeLink, exploreLink, { label: "Dashboard", href: "/dashboard" }, howItWorksLink]
    : role === "MERCHANT"
      ? [homeLink, exploreLink, { label: "Merchant Dashboard", href: "/merchant" }, howItWorksLink]
      : role === "ADMIN"
        ? [homeLink, exploreLink, { label: "Admin", href: "/admin" }, howItWorksLink]
        : [homeLink, exploreLink, howItWorksLink];

  const accountLinks = role === "CUSTOMER"
    ? [
        { label: "Profile", href: "/profile" },
        { label: "My Favorites", href: "/favorites" },
        { label: "Recommended For You", href: "/recommendations" },
      ]
    : role === "MERCHANT"
      ? [
          { label: "Merchant Profile", href: "/merchant/profile" },
          { label: "Merchant Analytics", href: "/merchant/analytics" },
        ]
      : [{ label: "Admin", href: "/admin" }];
  const customerWorkspace = role === "CUSTOMER" && ["/dashboard", "/profile", "/favorites", "/recommendations"].some((route) => pathname === route || pathname.startsWith(`${route}/`));

  function isActive(href: string) {
    const target = href.split("#")[0];
    if (href.includes("#")) return false;
    return target === "/" ? pathname === "/" : pathname === target || pathname.startsWith(`${target}/`);
  }

  useEffect(() => {
    if (!menuOpen) return;
    mobileMenuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setAuthError("");
    try {
      await logout();
      setMenuOpen(false);
      window.location.assign("/");
    } catch {
      setAuthError("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <Link href="/" aria-label="TryVora home" className="flex shrink-0 items-center gap-3 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white" aria-hidden="true">TV</span>
          <span className="leading-tight">
            <span className="block text-lg font-bold text-gray-900">TryVora</span>
            <span className="block text-xs text-gray-500">Digital Fitting Room</span>
          </span>
        </Link>

        <div className="hidden items-center gap-5 xl:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`rounded-md px-1 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${active ? "text-indigo-700 underline decoration-2 underline-offset-8" : "text-gray-600 hover:text-indigo-700"}`}>{link.label}</Link>;
          })}
        </div>

        <div className="flex items-center gap-3">
          {ready && (
            <div className="hidden items-center gap-3 xl:flex">
              {!user && (
                <>
                  <Link href="/login" onClick={(event) => { event.preventDefault(); const currentPath = `${window.location.pathname}${window.location.search}`; const returnTo = window.location.pathname === "/" ? "/profile?tab=digitalTwin" : currentPath; router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`); }} className="text-sm font-semibold text-gray-700 hover:text-indigo-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-indigo-600">Log in</Link>
                  <Link href="/register" onClick={(event) => { event.preventDefault(); const returnTo = `${window.location.pathname}${window.location.search}`; router.push(`/register?returnTo=${encodeURIComponent(returnTo)}`); }} className="text-sm font-semibold text-gray-700 hover:text-indigo-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-indigo-600">Register</Link>
                </>
              )}
              {(!user || role === "CUSTOMER") && (
                <Link href="/merchant" className="rounded-lg border border-indigo-600 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Login as Merchant</Link>
              )}
            </div>
          )}

          <CartButton />

          {ready && user && (
            <AccountMenu as="div" className="relative">
              <MenuButton aria-label="Account menu" className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <User size={18} aria-hidden="true" />
              </MenuButton>
              <MenuItems className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl focus:outline-none">
                <p className="truncate border-b border-gray-100 px-3 py-2 text-xs font-semibold text-gray-500">{user.name}</p>
                {accountLinks.map((link) => (
                  <MenuItem key={link.href}>
                    <Link href={link.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 data-[focus]:bg-indigo-50 data-[focus]:text-indigo-700">{link.label}</Link>
                  </MenuItem>
                ))}
                <MenuItem>
                  <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 data-[focus]:bg-indigo-50 data-[focus]:text-indigo-700 disabled:opacity-50">
                    {loggingOut ? "Logging out…" : "Log out"}
                  </button>
                </MenuItem>
              </MenuItems>
            </AccountMenu>
          )}

          <button ref={menuButtonRef} type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600 xl:hidden" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-main-navigation" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {customerWorkspace && <CustomerSidebar embedded />}

      {authError && <p role="alert" className="mx-auto max-w-7xl px-6 pb-2 text-sm text-rose-700">{authError}</p>}

      {menuOpen && (
        <div ref={mobileMenuRef} id="mobile-main-navigation" className="border-t border-gray-200 bg-white px-5 py-3 xl:hidden">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 ${active ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"}`} onClick={() => setMenuOpen(false)}>{link.label}</Link>;
          })}
          {ready && !user && (
            <div className="mt-2 border-t border-gray-100 pt-2">
              <Link href="/login" onClick={(event) => { event.preventDefault(); setMenuOpen(false); const currentPath = `${window.location.pathname}${window.location.search}`; const returnTo = window.location.pathname === "/" ? "/profile?tab=digitalTwin" : currentPath; router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`); }} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50">Log in</Link>
              <Link href="/register" onClick={(event) => { event.preventDefault(); setMenuOpen(false); const returnTo = `${window.location.pathname}${window.location.search}`; router.push(`/register?returnTo=${encodeURIComponent(returnTo)}`); }} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50">Register</Link>
            </div>
          )}
          {ready && (!user || role === "CUSTOMER") && (
            <Link href="/merchant" onClick={() => setMenuOpen(false)} className="mt-2 block rounded-lg border border-indigo-600 px-3 py-2 text-center text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Login as Merchant</Link>
          )}
          {ready && user && (
            <div className="mt-2 border-t border-gray-100 pt-2">
              {accountLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50">{link.label}</Link>
              ))}
              <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-indigo-50 disabled:opacity-50">{loggingOut ? "Logging out…" : "Log out"}</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
