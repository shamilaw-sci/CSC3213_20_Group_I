"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  ChevronLeft, ChevronRight, CircleHelp, CreditCard, Heart, History,
  House, LifeBuoy, LogOut, Menu, Ruler, Settings, Shirt, Sparkles, X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/features/auth/context/AuthContext";

type SidebarItem = { label: string; icon: LucideIcon; href?: string };

const mainItems: SidebarItem[] = [
  { label: "Overview", href: "/dashboard", icon: House },
  { label: "Digital Twin", href: "/profile?tab=digitalTwin", icon: Shirt },
  { label: "My Measurements", href: "/profile?tab=measurements", icon: Ruler },
  { label: "Virtual Try-On History", href: "/profile/try-on-history", icon: History },
  { label: "My Favorites", href: "/favorites", icon: Heart },
  { label: "Recommended For You", href: "/recommendations", icon: Sparkles },
];

const accountItems: SidebarItem[] = [
  { label: "Help & FAQ", href: "/help", icon: CircleHelp },
  { label: "My Plan", href: "/plan", icon: CreditCard },
  { label: "Account Settings", href: "/profile?tab=account", icon: Settings },
  { label: "Support", href: "/support", icon: LifeBuoy },
];

function SidebarBody({ collapsed, pathname, activeTab, loggingOut, error, onNavigate, onLogout }: {
  collapsed: boolean;
  pathname: string;
  activeTab: string | null;
  loggingOut: boolean;
  error: string;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  function group(title: string, items: SidebarItem[]) {
    return (
      <section aria-label={title} className="mt-5 first:mt-0">
        <h3 className={`px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 ${collapsed ? "sr-only" : ""}`}>{title}</h3>
        <div className="grid gap-1">
          {items.map(({ label, href, icon: Icon }) => {
            const content = <><Icon size={18} className="shrink-0" aria-hidden="true" /><span className={collapsed ? "sr-only" : "min-w-0 flex-1 whitespace-normal break-words leading-tight"}>{label}</span></>;
            if (!href) {
              return (
                <div key={label} title={collapsed ? `${label} — unavailable` : undefined} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400">
                  {content}
                  {collapsed ? <span className="sr-only">not available yet</span> : <span className="text-[10px] font-medium">Unavailable</span>}
                </div>
              );
            }
            const [hrefPath, hrefQuery] = href.split("?");
            const expectedTab = hrefQuery?.startsWith("tab=") ? hrefQuery.slice(4) : null;
            const active = pathname === hrefPath && (expectedTab ? activeTab === expectedTab : !expectedTab);
            return (
              <Link key={label} href={href} onClick={onNavigate} title={collapsed ? label : undefined} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${active ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"}`}>
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <nav aria-label="Customer dashboard" className="flex-1">
        {group("Main menu", mainItems)}
        {group("Account & support", accountItems)}
      </nav>
      <div className="mt-6 border-t border-slate-200 pt-4">
        <button type="button" onClick={onLogout} disabled={loggingOut} title={collapsed ? "Log out" : undefined} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-60">
          <LogOut size={18} className="shrink-0" aria-hidden="true" />
          <span className={collapsed ? "sr-only" : ""}>{loggingOut ? "Logging out…" : "Log out"}</span>
        </button>
        {error && <p role="alert" className="mt-3 px-3 text-sm text-rose-700">{error}</p>}
      </div>
    </div>
  );
}

export default function CustomerSidebar({ embedded = false }: { embedded?: boolean }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = typeof window === "undefined"
    ? null
    : new URLSearchParams(window.location.search).get("tab");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError("");
    try {
      await logout();
      setMobileOpen(false);
      router.replace("/");
      router.refresh();
    } catch {
      setError("Could not log out. Please try again.");
      setLoggingOut(false);
    }
  }

  const bodyProps = {
    pathname,
    activeTab,
    loggingOut,
    error,
    onNavigate: () => setMobileOpen(false),
    onLogout: () => void handleLogout(),
  };

  return (
    <>
      <button type="button" aria-label="Open dashboard menu" aria-expanded={mobileOpen} aria-controls="customer-mobile-sidebar" onClick={() => setMobileOpen(true)} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:hidden">
        <Menu size={19} aria-hidden="true" /> Dashboard menu
      </button>

      <aside className={`${embedded ? "fixed left-4 top-24 z-40" : ""} hidden shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-[width] lg:flex lg:h-[calc(100vh-7rem)] lg:flex-col ${collapsed ? "lg:w-20" : "lg:w-72"}`}>
        <div className={`mb-5 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && <p className="px-3 text-sm font-bold text-slate-900">Your fitting room</p>}
          <button type="button" aria-label={collapsed ? "Expand dashboard sidebar" : "Collapse dashboard sidebar"} aria-expanded={!collapsed} onClick={() => setCollapsed((value) => !value)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600">
            {collapsed ? <ChevronRight size={18} aria-hidden="true" /> : <ChevronLeft size={18} aria-hidden="true" />}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarBody {...bodyProps} collapsed={collapsed} />
        </div>
      </aside>

      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-[60] lg:hidden">
        <div className="fixed inset-0 bg-slate-950/50" aria-hidden="true" />
        <DialogPanel id="customer-mobile-sidebar" className="fixed inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col overflow-y-auto bg-white p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-slate-900">Your fitting room</DialogTitle>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close dashboard menu" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"><X size={20} aria-hidden="true" /></button>
          </div>
          <div className="min-h-0 flex-1"><SidebarBody {...bodyProps} collapsed={false} /></div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
