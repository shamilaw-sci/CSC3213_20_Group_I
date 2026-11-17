"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers3, Trash2 } from "lucide-react";

import Navbar from "@/app/components/Navbar";

type ComparedProduct = { id: string; name: string; image: string | null; merchant: string; price: number; currency: string };
type Comparison = { id: string; name: string | null; updatedAt: string; products: ComparedProduct[] };

export default function ComparisonsPage() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadComparisons() {
    try {
      const response = await fetch("/api/v1/comparisons", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Could not load comparisons.");
      setComparisons(data.comparisons);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load comparisons.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteComparison(id: string) {
    const response = await fetch(`/api/v1/comparisons/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.message ?? "Could not delete this comparison.");
      return;
    }
    setComparisons((current) => current.filter((comparison) => comparison.id !== id));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadComparisons(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="tv-page min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:pl-80">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Your shortlist</p><h1 className="mt-1 text-3xl font-black text-slate-950">Comparisons</h1><p className="mt-2 text-slate-600">Open a comparison to see products side by side.</p></div>
          <Link href="/explore" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Find products <ArrowRight size={16} /></Link>
        </header>

        {error && <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        {loading ? <p role="status" className="mt-8 text-sm text-slate-500">Loading comparisons…</p> : comparisons.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {comparisons.map((comparison) => (
              <article key={comparison.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <Link href={`/comparisons/${encodeURIComponent(comparison.id)}`} aria-label={`Open ${comparison.name ?? "Saved comparison"}`} className="block focus-visible:outline-2 focus-visible:outline-indigo-600">
                  <div className="grid h-52 grid-cols-3 gap-1 bg-slate-100 p-1">
                    {comparison.products.slice(0, 3).map((product) => (
                      <div key={product.id} className="relative overflow-hidden rounded-xl bg-white">
                        {product.image ? <Image src={product.image} alt={product.name} fill unoptimized sizes="180px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-slate-300"><Layers3 size={28} /></div>}
                      </div>
                    ))}
                    {comparison.products.length < 3 && Array.from({ length: 3 - comparison.products.length }, (_, index) => <div key={`empty-${index}`} className="flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-300"><Layers3 size={26} /></div>)}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-lg font-black text-slate-950">{comparison.name || "Saved comparison"}</h2><p className="mt-1 text-sm text-slate-500">{comparison.products.length} products · Updated {new Date(comparison.updatedAt).toLocaleDateString()}</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Open</span></div>
                    <div className="mt-4 space-y-2">{comparison.products.slice(0, 2).map((product) => <div key={product.id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-slate-700">{product.name}</span><span className="shrink-0 font-bold text-slate-900">{product.currency} {product.price.toFixed(2)}</span></div>)}</div>
                  </div>
                </Link>
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3"><span className="text-xs text-slate-500">Saved product shortlist</span><button type="button" onClick={() => void deleteComparison(comparison.id)} aria-label={`Delete ${comparison.name ?? "comparison"}`} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"><Trash2 size={14} /> Delete</button></div>
              </article>
            ))}
          </div>
        ) : !error ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Layers3 size={26} /></div><h2 className="mt-4 text-lg font-bold text-slate-950">No comparisons saved yet</h2><p className="mt-2 text-sm text-slate-600">Choose products in Explore and save them as a comparison.</p><Link href="/explore" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Explore products</Link></div>
        ) : null}
      </main>
    </div>
  );
}
