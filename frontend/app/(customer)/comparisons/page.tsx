"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "@/app/components/Navbar";
import TryOnButton from "@/features/try-on/components/TryOnButton";

type ComparedProduct = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string | null;
  merchant: string;
  category: string;
  variants: { id: string; size: string | null; color: string | null; stock: number | null }[];
};

type Comparison = {
  id: string;
  name: string | null;
  updatedAt: string;
  products: ComparedProduct[];
};

const imageFallback = "/placeholders/product.svg";

export default function ComparisonsPage() {
  const router = useRouter();
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");

  async function loadComparisons() {
    try {
      const response = await fetch("/api/v1/comparisons", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Could not load comparisons.");
      setComparisons(data.comparisons);
      const requestedId = new URLSearchParams(window.location.search).get("comparisonId");
      if (requestedId && data.comparisons.some((comparison: Comparison) => comparison.id === requestedId)) {
        setSelectedId(requestedId);
        const requested = data.comparisons.find((comparison: Comparison) => comparison.id === requestedId);
        setName(requested?.name ?? "");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load comparisons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadComparisons(); }, []);

  const selected = comparisons.find((comparison) => comparison.id === selectedId) ?? null;

  async function updateComparison(updates: { name?: string | null; productIds?: string[] }) {
    if (!selected) return;
    setBusy(true);
    const response = await fetch(`/api/v1/comparisons/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const body = await response.json().catch(() => ({})) as { message?: string };
    setBusy(false);
    if (!response.ok) {
      setError(body.message ?? "Could not update comparison.");
      return;
    }
    setError("");
    await loadComparisons();
  }

  async function deleteComparison() {
    if (!selected) return;
    const response = await fetch(`/api/v1/comparisons/${selected.id}`, { method: "DELETE" });
    if (!response.ok) return;
    setComparisons((current) => current.filter((comparison) => comparison.id !== selected.id));
    setSelectedId(null);
  }

  const stockSizes = (product: ComparedProduct) => [...new Set(product.variants.filter((variant) => (variant.stock ?? 0) > 0).map((variant) => variant.size ?? "One size"))];
  const stockColors = (product: ComparedProduct) => [...new Set(product.variants.filter((variant) => (variant.stock ?? 0) > 0).map((variant) => variant.color).filter((color): color is string => Boolean(color)))];
  const lowestPrice = selected ? Math.min(...selected.products.map((product) => product.price)) : 0;
  const mostSizes = selected ? Math.max(...selected.products.map((product) => stockSizes(product).length)) : 0;

  return (
    <div className="tv-page min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:pl-80">
        <button type="button" onClick={() => router.back()} className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Go back</button>
        <div className="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-100">Compare your shortlist</p>
          <h1 className="mt-2 text-3xl font-black">My Comparisons</h1>
          <p className="mt-2 text-sm text-indigo-100">Open a comparison tile to review its products side by side.</p>
          <Link href="/explore" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-50">Find products</Link>
        </div>

        <div className="mt-8">
          {loading ? <p role="status" className="text-sm text-gray-500">Loading comparisons…</p>
            : error && !selected ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
              : !selected ? comparisons.length ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {comparisons.map((comparison) => (
                    <button key={comparison.id} type="button" onClick={() => { setSelectedId(comparison.id); setName(comparison.name ?? ""); setError(""); }} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                      <span className="block truncate text-lg font-bold text-slate-950">{comparison.name || "Saved comparison"}</span>
                      <span className="mt-1 block text-sm text-slate-500">{comparison.products.length} products · Updated {new Date(comparison.updatedAt).toLocaleDateString()}</span>
                      <span className="mt-4 grid grid-cols-4 gap-2">
                        {comparison.products.slice(0, 4).map((product) => <span key={product.id} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-100"><Image src={product.image ?? imageFallback} alt={product.name} fill unoptimized className="object-contain p-1" /></span>)}
                      </span>
                      <span className="mt-4 block text-sm font-bold text-indigo-700">Open comparison →</span>
                    </button>
                  ))}
                </div>
              ) : <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center"><p className="font-semibold text-gray-900">No comparisons saved yet.</p><p className="mt-2 text-sm text-gray-500">Select two or more products in Explore and save a comparison.</p></div>
                : (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button type="button" onClick={() => { setSelectedId(null); setError(""); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← All comparisons</button>
                      <h2 className="text-xl font-bold text-slate-950">{selected.name || "Saved comparison"}</h2>
                      <button type="button" disabled={busy} onClick={() => void deleteComparison()} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Delete comparison</button>
                    </div>
                    {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

                    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {selected.products.map((product) => <article key={product.id} className="rounded-xl border border-slate-100 p-3"><Link href={`/products/${product.id}`} className="block"><div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-50"><Image src={product.image ?? imageFallback} alt={product.name} fill unoptimized className="object-contain p-2" /></div><h2 className="mt-3 font-bold text-slate-900">{product.name}</h2></Link><p className="text-sm text-slate-500">{product.merchant}</p></article>)}
                    </div>

                    <div className="mt-7 overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-left text-sm"><thead><tr><th className="p-3">Details</th>{selected.products.map((product) => <th key={product.id} className="p-3 align-top"><span className="block font-bold">{product.name}</span><span className="mt-2 flex flex-wrap gap-1">{product.price === lowestPrice && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">Lowest price</span>}{stockSizes(product).length === mostSizes && <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800">Most sizes in stock</span>}</span></th>)}</tr></thead><tbody>
                      <tr className="border-t"><th className="p-3">Price</th>{selected.products.map((product) => <td key={product.id} className="p-3 font-bold">{product.currency} {product.price.toFixed(2)}</td>)}</tr>
                      <tr className="border-t"><th className="p-3">Merchant</th>{selected.products.map((product) => <td key={product.id} className="p-3">{product.merchant}</td>)}</tr>
                      <tr className="border-t"><th className="p-3">Category</th>{selected.products.map((product) => <td key={product.id} className="p-3">{product.category}</td>)}</tr>
                      <tr className="border-t"><th className="p-3">In-stock colors</th>{selected.products.map((product) => <td key={product.id} className="p-3">{stockColors(product).join(", ") || "None listed"}</td>)}</tr>
                      <tr className="border-t"><th className="p-3">In-stock sizes</th>{selected.products.map((product) => <td key={product.id} className="p-3">{stockSizes(product).join(", ") || "None listed"}</td>)}</tr>
                      <tr className="border-t"><th className="p-3">Actions</th>{selected.products.map((product) => <td key={product.id} className="space-y-2 p-3"><TryOnButton product={{ id: product.id, title: product.name, image: product.image ?? imageFallback, store: product.merchant, category: product.category, price: product.price, currency: product.currency, availableSizes: stockSizes(product) }} /><button type="button" disabled={busy} onClick={() => void updateComparison({ productIds: selected.products.filter((item) => item.id !== product.id).map((item) => item.id) })} className="block text-sm font-semibold text-rose-700 underline disabled:opacity-50">Remove</button></td>)}</tr>
                    </tbody></table></div>
                  </section>
                )}
        </div>
      </main>
    </div>
  );
}
