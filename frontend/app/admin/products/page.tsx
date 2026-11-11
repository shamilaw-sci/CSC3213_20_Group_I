"use client";

import { useEffect, useState } from "react";

type Status = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
type Product = { id: string; name: string; status: Status; price: number; currency: string; image: string | null; merchant: { name: string; email: string }; category: { name: string }; variantCount: number };

const statuses: Status[] = ["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Status | "ALL">("DRAFT");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const query = filter === "ALL" ? "" : `?status=${filter}`;
    const response = await fetch(`/api/v1/admin/products${query}`, { cache: "no-store" });
    const body = await response.json();
    if (response.ok) setProducts(body.products ?? []);
    else setMessage(body.message ?? "Could not load products.");
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [filter]);

  async function updateStatus(id: string, status: Status) {
    setMessage("");
    const response = await fetch(`/api/v1/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const body = await response.json();
    if (!response.ok) return setMessage(body.message ?? "Could not update product status.");
    setMessage(`Product status updated to ${status}.`);
    await load();
  }

  return (
    <main className="space-y-6">
      <div><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Administration</p><h1 className="mt-2 text-3xl font-black text-slate-950">Product approvals</h1><p className="mt-2 text-slate-600">Review draft products before they become visible in Explore.</p></div>
      <div className="flex flex-wrap gap-2">{["ALL", ...statuses].map((status) => <button key={status} type="button" onClick={() => setFilter(status as Status | "ALL")} className={`rounded-xl px-4 py-2 text-sm font-bold ${filter === status ? "bg-indigo-600 text-white" : "bg-white text-slate-700 shadow-sm hover:bg-indigo-50"}`}>{status.replaceAll("_", " ")}</button>)}</div>
      {message && <p role="status" className="rounded-xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-800">{message}</p>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-6 text-slate-600">Loading products…</p> : products.length === 0 ? <p className="p-6 text-slate-600">No products found for this status.</p> : <div className="divide-y divide-slate-100">{products.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div className="flex min-w-0 items-center gap-4"><div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">{product.image && <img src={product.image} alt="" className="h-full w-full object-contain bg-white p-1" />}</div><div className="min-w-0"><p className="truncate font-bold text-slate-950">{product.name}</p><p className="text-sm text-slate-500">{product.merchant.name} · {product.category.name} · {product.currency} {product.price.toFixed(2)}</p><p className="text-xs text-slate-400">{product.variantCount} variants</p></div></div><div className="flex items-center gap-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{product.status}</span>{product.status === "DRAFT" && <button type="button" onClick={() => void updateStatus(product.id, "ACTIVE")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">Activate</button>}{product.status === "ACTIVE" && <button type="button" onClick={() => void updateStatus(product.id, "OUT_OF_STOCK")} className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50">Mark out of stock</button>}</div></div>)}</div>}
      </section>
    </main>
  );
}
