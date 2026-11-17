"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Plus, Save, Sparkles, X } from "lucide-react";

import Navbar from "@/app/components/Navbar";
import { useTryOn } from "@/features/try-on/hooks/useTryOn";

type Variant = { id: string; size: string | null; color: string | null; stock: number | null };
type Product = { id: string; name: string; description: string | null; price: number; currency: string; image: string | null; merchantUrl: string; merchant: string; category: string; variants: Variant[] };
type Comparison = { id: string; name: string | null; products: Product[] };

export default function ComparisonDetail({ comparisonId }: { comparisonId: string }) {
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { openTryOn } = useTryOn();

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/comparisons/${encodeURIComponent(comparisonId)}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not load this comparison.");
      setComparison(body.comparison);
      setName(body.comparison.name ?? "");
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load this comparison.");
    } finally {
      setLoading(false);
    }
  }, [comparisonId]);

  useEffect(() => { void load(); }, [load]);

  async function saveChanges(changes: { name?: string | null; productIds?: string[] }) {
    if (!comparison || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/comparisons/${encodeURIComponent(comparison.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Could not update this comparison.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update this comparison.");
    } finally {
      setSaving(false);
    }
  }

  const lowestPrice = useMemo(() => comparison?.products.length ? Math.min(...comparison.products.map((product) => product.price)) : Infinity, [comparison]);
  const mostSizes = useMemo(() => comparison?.products.length ? Math.max(...comparison.products.map((product) => new Set(product.variants.filter((variant) => (variant.stock ?? 0) > 0 && variant.size).map((variant) => variant.size)).size)) : 0, [comparison]);

  return (
    <div className="tv-page min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:pl-80">
        <Link href="/comparisons" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"><ArrowLeft size={16} /> All comparisons</Link>
        {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        {loading ? <p role="status" className="mt-8 text-sm text-slate-500">Loading comparison…</p> : comparison ? <>
          <header className="mt-5 flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-6 text-white shadow-lg sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-100">Side-by-side comparison</p><label className="mt-2 block text-xs font-semibold text-indigo-100" htmlFor="comparison-name">Comparison name</label><div className="mt-1 flex max-w-2xl gap-2"><input id="comparison-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={150} placeholder="Name this comparison" className="min-w-0 flex-1 rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-lg font-black text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-white" /><button type="button" onClick={() => void saveChanges({ name: name.trim() || null })} disabled={saving || name === (comparison.name ?? "")} aria-label="Save comparison name" className="rounded-xl bg-white px-3 text-indigo-700 disabled:opacity-50"><Save size={18} /></button></div></div>
            <Link href={`/explore?editComparison=${encodeURIComponent(comparison.id)}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50"><Plus size={17} /> Add products</Link>
          </header>

          {comparison.products.length > 0 && <section aria-label="Compared product images" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{comparison.products.map((product) => <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><Link href={`/products/${product.id}`} className="block"><div className="relative aspect-[4/3] bg-slate-100">{product.image ? <Image src={product.image} alt={product.name} fill unoptimized sizes="(min-width: 1280px) 25vw, 50vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">Image unavailable</div>}</div><div className="p-4"><p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{product.merchant}</p><h2 className="mt-1 line-clamp-2 font-bold text-slate-950">{product.name}</h2><p className="mt-2 text-lg font-black text-indigo-700">{product.currency} {product.price.toFixed(2)}</p></div></Link></article>)}</section>}

          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5"><h2 className="text-xl font-black text-slate-950">Product comparison</h2><p className="mt-1 text-sm text-slate-500">Aligned details make differences easy to scan.</p></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead><tr><th className="sticky left-0 z-10 w-40 border-b border-slate-100 bg-slate-50 p-4 text-xs font-bold uppercase tracking-wide text-slate-500">Details</th>{comparison.products.map((product) => <th key={product.id} className="min-w-52 border-b border-slate-100 bg-slate-50 p-4 align-top"><Link href={`/products/${product.id}`} className="font-bold text-slate-950 hover:text-indigo-700">{product.name}</Link></th>)}</tr></thead><tbody>
              <tr className="border-b border-slate-100"><th className="sticky left-0 bg-white p-4 font-semibold text-slate-600">Price</th>{comparison.products.map((product) => <td key={product.id} className="p-4 font-bold text-slate-900">{product.currency} {product.price.toFixed(2)}{product.price === lowestPrice && <span className="ml-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800">Lowest price</span>}</td>)}</tr>
              <tr className="border-b border-slate-100"><th className="sticky left-0 bg-white p-4 font-semibold text-slate-600">Merchant</th>{comparison.products.map((product) => <td key={product.id} className="p-4 text-slate-700">{product.merchant}</td>)}</tr>
              <tr className="border-b border-slate-100"><th className="sticky left-0 bg-white p-4 font-semibold text-slate-600">Category</th>{comparison.products.map((product) => <td key={product.id} className="p-4 text-slate-700">{product.category}</td>)}</tr>
              <tr className="border-b border-slate-100"><th className="sticky left-0 bg-white p-4 font-semibold text-slate-600">Colors</th>{comparison.products.map((product) => <td key={product.id} className="p-4 text-slate-700">{Array.from(new Set(product.variants.map((variant) => variant.color).filter(Boolean))).join(", ") || "Not listed"}</td>)}</tr>
              <tr className="border-b border-slate-100"><th className="sticky left-0 bg-white p-4 font-semibold text-slate-600">In-stock sizes</th>{comparison.products.map((product) => { const sizes = Array.from(new Set(product.variants.filter((variant) => (variant.stock ?? 0) > 0).map((variant) => variant.size).filter(Boolean))); const wins = sizes.length === mostSizes && mostSizes > 0; return <td key={product.id} className="p-4"><div className="flex flex-wrap gap-1.5">{sizes.length ? sizes.map((size) => <span key={size} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{size}</span>) : <span className="text-slate-400">None listed</span>}</div>{wins && <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-800">Most sizes in stock ({sizes.length})</span>}</td>})}</tr>
              <tr><th className="sticky left-0 bg-white p-4 align-top font-semibold text-slate-600">Actions</th>{comparison.products.map((product) => { const availableSizes = Array.from(new Set(product.variants.filter((variant) => (variant.stock ?? 0) > 0).map((variant) => variant.size ?? "One size"))); return <td key={product.id} className="p-4"><div className="flex flex-col items-start gap-2"><button type="button" onClick={() => openTryOn({ id: product.id, title: product.name, image: product.image ?? "", category: product.category, store: product.merchant, price: product.price, currency: product.currency, availableSizes })} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"><Sparkles size={14} /> Try-On</button><Link href={`/products/${product.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:underline">Product page <ExternalLink size={13} /></Link><a href={product.merchantUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700">Merchant site <ExternalLink size={13} /></a><button type="button" disabled={saving || comparison.products.length <= 1} title={comparison.products.length <= 1 ? "Keep at least one product in the comparison" : undefined} onClick={() => void saveChanges({ productIds: comparison.products.filter((item) => item.id !== product.id).map((item) => item.id) })} className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:underline disabled:opacity-40"><X size={14} /> Remove product</button></div></td>})}</tr>
            </tbody></table></div>
          </section>
        </> : <div className="mt-8 rounded-2xl bg-white p-8 text-slate-600">Comparison not found.</div>}
      </main>
    </div>
  );
}
