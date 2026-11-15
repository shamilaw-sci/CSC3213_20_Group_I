"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
type Product = {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  status: Status;
  price: number;
  currency: string;
  imageUrl: string | null;
  merchantUrl: string;
  merchant: string;
  category: string;
  variants: number;
};

const statuses: Status[] = ["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Status | "ALL">("DRAFT");
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/admin/products", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message ?? "Could not load products.");
        if (!Array.isArray(body.products)) throw new Error("Invalid product-list response.");
        setProducts(body.products);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setMessage(reason instanceof Error ? reason.message : "Could not load products.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const visibleProducts = useMemo(
    () => products.filter((product) => filter === "ALL" || product.status === filter),
    [filter, products],
  );

  async function updateStatus(product: Product, status: Status) {
    if (pendingId) return;
    setPendingId(product.id);
    setMessage("");
    try {
      const response = await fetch(`/api/v1/admin/products/${encodeURIComponent(product.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: product.merchantId,
          categoryName: product.category,
          productName: product.name,
          description: product.description ?? "",
          price: product.price,
          currency: product.currency,
          merchantUrl: product.merchantUrl,
          primaryImageUrl: product.imageUrl ?? "",
          status,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not update product status.");
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, status } : item));
      setMessage(`${product.name} is now ${status.toLowerCase().replaceAll("_", " ")}.`);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not update product status.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <main className="space-y-6">
      <div><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Administration</p><h1 className="mt-2 text-3xl font-black text-slate-950">Product approvals</h1><p className="mt-2 text-slate-600">Review draft products before they become visible in Explore.</p></div>
      <div className="flex flex-wrap gap-2">{["ALL", ...statuses].map((status) => <button key={status} type="button" onClick={() => setFilter(status as Status | "ALL")} className={`rounded-xl px-4 py-2 text-sm font-bold ${filter === status ? "bg-indigo-600 text-white" : "bg-white text-slate-700 shadow-sm hover:bg-indigo-50"}`}>{status.replaceAll("_", " ")}</button>)}</div>
      {message && <p role="status" className="rounded-xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-800">{message}</p>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p role="status" className="p-6 text-slate-600">Loading products…</p> : visibleProducts.length === 0 ? <p className="p-6 text-slate-600">No products found for this status.</p> : <div className="divide-y divide-slate-100">{visibleProducts.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div className="flex min-w-0 items-center gap-4"><div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">{product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-contain bg-white p-1" />}</div><div className="min-w-0"><p className="truncate font-bold text-slate-950">{product.name}</p><p className="text-sm text-slate-500">{product.merchant} · {product.category} · {product.currency} {product.price.toFixed(2)}</p><p className="text-xs text-slate-400">{product.variants} variants</p></div></div><div className="flex items-center gap-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{product.status}</span>{product.status === "DRAFT" && <button type="button" disabled={pendingId !== null} onClick={() => void updateStatus(product, "ACTIVE")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{pendingId === product.id ? "Activating…" : "Activate"}</button>}{product.status === "ACTIVE" && <button type="button" disabled={pendingId !== null} onClick={() => void updateStatus(product, "OUT_OF_STOCK")} className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-50">Mark out of stock</button>}</div></div>)}</div>}
      </section>
    </main>
  );
}
