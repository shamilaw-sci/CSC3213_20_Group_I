"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

const searchItems = [
  { label: "Dashboard overview", keywords: "home statistics totals overview", href: "/admin" },
  { label: "Analytics", keywords: "charts reporting login growth redirects trends", href: "/admin/analytics" },
  { label: "User management", keywords: "users accounts customer merchant admin", href: "/admin/users" },
  { label: "Catalog management", keywords: "catalog products garments categories inventory", href: "/admin/catalog" },
  { label: "Merchant management", keywords: "merchants stores partners approve suspend", href: "/admin/merchants" },
  { label: "Digital twin monitor", keywords: "twins images avatars", href: "/admin/twins" },
  { label: "Try-on management", keywords: "virtual try on processing failed retry cancel", href: "/admin/try-ons" },
  { label: "Feedback management", keywords: "feedback reports ratings resolve review", href: "/admin/feedback" },
  { label: "Security", keywords: "audit activity login security", href: "/admin/security" },
  { label: "Admin profile", keywords: "profile picture name email password account edit", href: "/adminprofile" },
];

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return searchItems.filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(term));
  }, [query]);

  function openResult(href: string) {
    setQuery("");
    setFocused(false);
    router.push(href);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (results[0]) openResult(results[0].href);
  }

  return (
    <header className="relative z-20 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-4">
        <form onSubmit={submitSearch} role="search" className="relative w-full max-w-xl">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 ring-purple-600 focus-within:ring-2">
            <Search size={19} className="shrink-0 text-slate-500" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 120)} placeholder="Search dashboard, users, twins, security…" aria-label="Search admin dashboard" aria-controls="admin-search-results" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500" />
          </div>
          {focused && query.trim() && (
            <div id="admin-search-results" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-xl border bg-white shadow-xl">
              {results.length ? results.map((item) => (
                <button key={item.href} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => openResult(item.href)} className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-purple-50">{item.label}</button>
              )) : <p className="px-4 py-3 text-sm text-slate-500">No admin page matches “{query.trim()}”.</p>}
            </div>
          )}
        </form>
      </div>
    </header>
  );
}
