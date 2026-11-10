"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/features/auth/context/AuthContext";

type SavedTryOn = {
  id: string;
  createdAt: string;
  status: string;
  product: { id: string; name: string; image: string | null };
  size: string | null;
  fitPercentage: number | null;
};

function groupByDate(items: SavedTryOn[], order: "newest" | "oldest") {
  const sorted = [...items].sort((a, b) =>
    order === "newest"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const groups = new Map<string, SavedTryOn[]>();
  for (const item of sorted) {
    const date = new Date(item.createdAt).toDateString();
    groups.set(date, [...(groups.get(date) ?? []), item]);
  }
  return [...groups.entries()];
}

export default function TryOnHistoryPage() {
  const { user, ready } = useAuth();
  const [items, setItems] = useState<SavedTryOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    const userId = user.id;

    const controller = new AbortController();
    async function loadHistory() {
      setLoading(true);
      setItems([]);
      setError("");
      setLoginRequired(false);
      try {
        const response = await fetch("/api/v1/try-ons", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.status === 401) {
          setLoginRequired(true);
          return;
        }
        if (!response.ok) throw new Error("Could not load your Try-On history.");
        const body = await response.json() as { tryOns?: SavedTryOn[] };
        if (!Array.isArray(body.tryOns)) throw new Error("Could not load your Try-On history.");
        if (!controller.signal.aborted) setItems(body.tryOns);
      } catch {
        if (!controller.signal.aborted) setError("Could not load your Try-On history. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoadedUserId(userId);
          setLoading(false);
        }
      }
    }

    void loadHistory();
    return () => controller.abort();
  }, [ready, user]);

  async function deleteItem(id: string) {
    if (!window.confirm("Delete this saved Try-On result?")) return;
    setDeletingId(id);
    setError("");
    try {
      const response = await fetch(`/api/v1/try-ons/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete this Try-On result.");
      setItems((previous) => previous.filter((item) => item.id !== id));
      setSelectedId((previous) => previous === id ? null : previous);
    } catch {
      setError("Could not delete this Try-On result. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const groups = groupByDate(items, sortOrder);

  return (
    <div className="tv-page min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl min-w-0 px-6 py-10 lg:pl-80">
        <Link href="/profile" className="text-sm font-semibold text-indigo-700 hover:underline">
          Back to Profile
        </Link>
        <header className="mt-7 rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-100">Your fitting room</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Try-On History</h1>
              <p className="mt-2 text-sm text-indigo-100 sm:text-base">Review your saved fitting guides and revisit products you explored.</p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium text-slate-700">
              <span className="text-indigo-100">Sort by</span>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
                className="mt-1 block rounded-xl border-0 bg-white px-4 py-3 text-slate-900 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
            <button
              type="button"
              disabled
              title="Download all is unavailable because illustrative Try-On results are not stored as image files."
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-white/60 px-5 py-3 font-semibold text-indigo-950"
            >
              <Download size={18} /> Download all
            </button>
            </div>
          </div>
        </header>
        <p className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-slate-600">
          Saved fitting guides are illustrative. The current Try-On system does not store a downloadable result image.
        </p>

        {!ready ? (
          <p role="status" className="mt-12 text-slate-600">Loading Try-On history...</p>
        ) : !user || loginRequired ? (
          <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-bold text-slate-900">Log in to view your Try-On history</h2>
            <p className="mt-2 text-slate-600">Only your saved fitting guides are shown here.</p>
            <Link href="/login" className="mt-4 inline-block font-semibold text-indigo-700 underline">Log in</Link>
          </section>
        ) : loading || loadedUserId !== user.id ? (
          <p role="status" className="mt-12 text-slate-600">Loading Try-On history...</p>
        ) : error && items.length === 0 ? (
          <p role="alert" className="mt-12 rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>
        ) : items.length === 0 ? (
          <section className="mt-12 rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/50 px-8 py-16 text-center">
            <Sparkles className="mx-auto text-indigo-600" size={32} />
            <h2 className="mt-4 text-2xl font-bold text-slate-900">No try-on history yet</h2>
            <p className="mt-2 text-slate-600">Your saved Try-On results will appear here.</p>
            <Link href="/explore" className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700">Explore products</Link>
          </section>
        ) : (
          <div className="mt-10 space-y-12">
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>}
            {groups.map(([date, records]) => (
              <section key={date}>
                <h2 className="mb-5 text-xl font-bold text-slate-900">
                  {new Date(date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {records.map((item) => (
                    <article
                      key={item.id}
                      className={`group overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition hover:shadow-lg ${selectedId === item.id ? "border-indigo-600" : "border-transparent hover:border-indigo-200"}`}
                    >
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setSelectedId((previous) => previous === item.id ? null : item.id)}
                          aria-pressed={selectedId === item.id}
                          aria-label={`Select saved fitting guide for ${item.product.name}`}
                          className="relative block aspect-[3/4] w-full bg-indigo-50 text-left"
                        >
                          {item.product.image ? (
                            <Image src={item.product.image} alt={`${item.product.name} product photo`} fill unoptimized className="object-cover" />
                          ) : (
                            <span className="flex h-full items-center justify-center text-center font-semibold text-indigo-800">Product image unavailable</span>
                          )}
                        </button>
                        <span className="absolute left-3 top-3 rounded-lg bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">
                          Illustrative fitting guide
                        </span>
                        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                          <button
                            type="button"
                            disabled
                            title="A downloadable Try-On image was not stored."
                            aria-label={`Download ${item.product.name} Try-On result unavailable`}
                            className="rounded-lg bg-white p-2 text-slate-400 shadow"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteItem(item.id)}
                            disabled={deletingId === item.id}
                            aria-label={`Delete saved fitting guide for ${item.product.name}`}
                            className="rounded-lg bg-white p-2 text-rose-700 shadow hover:bg-rose-50 disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Product photo · saved fitting guide</p>
                        <h3 className="mt-1 font-bold text-slate-900">{item.product.name}</h3>
                        <p className="mt-2 text-sm text-slate-600">
                          Size {item.size ?? "not recorded"} · Fit {item.fitPercentage === null ? "not available" : `${Math.round(item.fitPercentage)}%`}
                        </p>
                        <Link href={`/products/${item.product.id}`} className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:underline">
                          View product
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
