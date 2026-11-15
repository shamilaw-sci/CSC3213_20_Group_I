"use client";

import { useRouter } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";

type AdminSearchResult = { id: string; category: string; label: string; detail: string; href: string };

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
  const { logout } = useAuth();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [recordResults, setRecordResults] = useState<AdminSearchResult[]>([]);
  const [searchingRecords, setSearchingRecords] = useState(false);
  const [searchError, setSearchError] = useState("");
  const pageResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return searchItems.filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(term));
  }, [query]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setRecordResults([]);
      setSearchingRecords(false);
      setSearchError("");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearchingRecords(true);
      setSearchError("");
      try {
        const response = await fetch(`/api/v1/admin/search?q=${encodeURIComponent(term)}`, { cache: "no-store", signal: controller.signal });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message ?? "Could not search dashboard records.");
        if (!controller.signal.aborted) setRecordResults(Array.isArray(body.results) ? body.results : []);
      } catch (reason) {
        if (!controller.signal.aborted) {
          setRecordResults([]);
          setSearchError(reason instanceof Error ? reason.message : "Could not search dashboard records.");
        }
      } finally {
        if (!controller.signal.aborted) setSearchingRecords(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function openResult(href: string, includeQuery = false) {
    const target = includeQuery ? `${href}?search=${encodeURIComponent(query.trim())}` : href;
    setQuery("");
    setFocused(false);
    router.push(target);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (recordResults[0]) openResult(recordResults[0].href, true);
    else if (pageResults[0]) openResult(pageResults[0].href);
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
      window.location.assign("/");
    } catch {
      setLogoutError("Could not log out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <header className="relative z-20 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
      <div className="flex w-full items-center justify-between gap-4">
        <form onSubmit={submitSearch} role="search" className="relative w-full max-w-xl flex-1">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 ring-purple-600 focus-within:ring-2">
            <Search size={19} className="shrink-0 text-slate-500" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 120)} placeholder="Search dashboard, users, twins, security…" aria-label="Search admin dashboard" aria-controls="admin-search-results" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500" />
          </div>
          {focused && query.trim() && (
            <div id="admin-search-results" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] max-h-[min(70vh,32rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
              {pageResults.length > 0 && <section aria-label="Admin pages">
                <p className="bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Pages</p>
                {pageResults.map((item) => (
                  <button key={item.href} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => openResult(item.href)} className="block w-full px-4 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-purple-50">{item.label}</button>
                ))}
              </section>}
              {query.trim().length >= 2 && <section aria-label="Dashboard records">
                <p className="bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Dashboard records</p>
                {recordResults.map((item) => (
                  <button key={`${item.category}-${item.id}`} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => openResult(item.href, true)} className="block w-full border-t border-slate-100 px-4 py-2.5 text-left hover:bg-purple-50">
                    <span className="flex items-center justify-between gap-3"><span className="truncate text-sm font-semibold text-slate-800">{item.label}</span><span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-800">{item.category}</span></span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{item.detail}</span>
                  </button>
                ))}
                {searchingRecords && <p className="px-4 py-3 text-sm text-slate-500">Searching records…</p>}
                {!searchingRecords && !searchError && recordResults.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No matching dashboard records.</p>}
                {searchError && <p role="alert" className="px-4 py-3 text-sm text-red-600">{searchError}</p>}
              </section>}
              {pageResults.length === 0 && query.trim().length < 2 && <p className="px-4 py-3 text-sm text-slate-500">Type at least 2 characters to search dashboard records.</p>}
            </div>
          )}
        </form>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:cursor-wait disabled:opacity-60" aria-label="Log out">
            <LogOut size={17} aria-hidden="true" />
            <span>{loggingOut ? "Logging out…" : "Log out"}</span>
          </button>
        </div>
      </div>
      {logoutError && <p role="alert" className="mt-2 text-right text-sm text-red-600">{logoutError}</p>}
    </header>
  );
}
