"use client";

import { ExternalLink, Package, Pencil, Search, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
type Product = { id: string; merchantId: string; merchant: string; category: string; name: string; description: string | null; price: number; currency: string; imageUrl: string | null; merchantUrl: string; status: ProductStatus; variants: number; tryOns: number; updatedAt: string };
type CatalogData = { summary: { draft: number; active: number; outOfStock: number; archived: number; total: number }; products: Product[]; merchants: Array<{ id: string; name: string; status: string }>; categories: string[] };
type ProductForm = { merchantId: string; categoryName: string; productName: string; description: string; price: string; currency: string; merchantUrl: string; primaryImageUrl: string; status: ProductStatus };

const emptyForm: ProductForm = { merchantId: "", categoryName: "", productName: "", description: "", price: "", currency: "USD", merchantUrl: "", primaryImageUrl: "", status: "DRAFT" };

async function fetchCatalog() {
  const response = await fetch("/api/v1/admin/products", { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "Could not load the catalog.");
  return body as CatalogData;
}

export default function CatalogManagementPage() {
  const [data, setData] = useState<CatalogData | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | ProductStatus>("ALL");
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const body = await fetchCatalog();
    setData(body);
    setError("");
  }, []);

  useEffect(() => {
    let active = true;
    fetchCatalog().then((body) => { if (active) setData(body); }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load the catalog."); });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data?.products.filter((product) => (status === "ALL" || product.status === status) && (!term || `${product.name} ${product.merchant} ${product.category}`.toLowerCase().includes(term))) ?? [];
  }, [data, query, status]);

  function openEdit(product: Product) {
    setEditing(product);
    setForm({ merchantId: product.merchantId, categoryName: product.category, productName: product.name, description: product.description ?? "", price: String(product.price), currency: product.currency, merchantUrl: product.merchantUrl, primaryImageUrl: product.imageUrl ?? "", status: product.status });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !editing) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/admin/products/${encodeURIComponent(editing.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, price: Number(form.price) }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not save the product.");
      setEditing(undefined);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save the product.");
    } finally {
      setSaving(false);
    }
  }

  const summary = data?.summary;
  return (
    <section className="space-y-6">
      <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-700">Commerce</p><h2 className="mt-1 text-3xl font-black text-slate-950">Catalog management</h2><p className="mt-2 text-slate-600">Review products, maintain prices and links, and control catalog visibility.</p></div>
      {error && <p role="alert" className="rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {([['total','All products'],['active','Active'],['draft','Draft'],['outOfStock','Out of stock'],['archived','Archived']] as const).map(([key, label]) => <div key={key} className="rounded-2xl bg-white p-5 shadow"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-slate-950">{summary?.[key] ?? 0}</p></div>)}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-xl border px-3"><Search size={18} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, merchants, or categories" className="w-full py-3 outline-none" /></label>
        <select value={status} onChange={(event) => setStatus(event.target.value as "ALL" | ProductStatus)} className="rounded-xl border px-4 py-3 font-semibold"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="DRAFT">Draft</option><option value="OUT_OF_STOCK">Out of stock</option><option value="ARCHIVED">Archived</option></select>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((product) => <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="flex h-44 items-center justify-center bg-slate-100 bg-cover bg-center" style={product.imageUrl ? { backgroundImage: `url(${JSON.stringify(product.imageUrl).slice(1, -1)})` } : undefined}>{!product.imageUrl && <Package size={44} className="text-slate-300" />}</div>
          <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-purple-700">{product.category}</p><h3 className="mt-1 text-lg font-black text-slate-950">{product.name}</h3><p className="text-sm text-slate-500">{product.merchant}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">{product.status.replaceAll("_", " ")}</span></div><p className="mt-4 text-2xl font-black">{product.currency} {product.price.toFixed(2)}</p><p className="mt-2 text-sm text-slate-500">{product.variants} variants · {product.tryOns} try-ons</p><div className="mt-5 flex gap-2"><button type="button" onClick={() => openEdit(product)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-200 px-3 py-2 font-bold text-purple-700 hover:bg-purple-50"><Pencil size={16} /> Edit</button><a href={product.merchantUrl} target="_blank" rel="noreferrer" aria-label={`Open ${product.name} merchant page`} className="rounded-xl border p-2 text-slate-600 hover:bg-slate-50"><ExternalLink size={18} /></a></div></div>
        </article>)}
        {!data && !error && <p role="status" className="rounded-2xl bg-white p-6 shadow">Loading catalog…</p>}
        {data && !visible.length && <p className="rounded-2xl bg-white p-6 text-slate-500 shadow">No products match the current search and status.</p>}
      </div>

      {editing !== undefined && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="product-form-title"><form onSubmit={save} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h3 id="product-form-title" className="text-2xl font-black">Edit product</h3><button type="button" onClick={() => setEditing(undefined)} aria-label="Close product form" className="rounded-lg p-2 hover:bg-slate-100"><X /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormField label="Product name"><input required minLength={2} maxLength={200} value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} className="rounded-xl border p-3" /></FormField>
        <FormField label="Merchant"><select required value={form.merchantId} onChange={(event) => setForm({ ...form, merchantId: event.target.value })} className="rounded-xl border p-3"><option value="">Choose merchant</option>{data?.merchants.map((merchant) => <option key={merchant.id} value={merchant.id}>{merchant.name} ({merchant.status.toLowerCase()})</option>)}</select></FormField>
        <FormField label="Category"><input required list="catalog-categories" value={form.categoryName} onChange={(event) => setForm({ ...form, categoryName: event.target.value })} className="rounded-xl border p-3" /><datalist id="catalog-categories">{data?.categories.map((category) => <option key={category} value={category} />)}</datalist></FormField>
        <FormField label="Status"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProductStatus })} className="rounded-xl border p-3"><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="OUT_OF_STOCK">Out of stock</option><option value="ARCHIVED">Archived</option></select></FormField>
        <FormField label="Price"><input required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="rounded-xl border p-3" /></FormField>
        <FormField label="Currency"><input required minLength={3} maxLength={3} value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} className="rounded-xl border p-3 uppercase" /></FormField>
        <FormField label="Merchant product URL"><input required type="url" value={form.merchantUrl} onChange={(event) => setForm({ ...form, merchantUrl: event.target.value })} className="rounded-xl border p-3" /></FormField>
        <FormField label="Image URL"><input type="url" value={form.primaryImageUrl} onChange={(event) => setForm({ ...form, primaryImageUrl: event.target.value })} className="rounded-xl border p-3" /></FormField>
        <label className="grid gap-2 text-sm font-bold sm:col-span-2">Description<textarea rows={4} maxLength={5000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="rounded-xl border p-3 font-normal" /></label>
      </div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditing(undefined)} className="rounded-xl border px-5 py-3 font-bold">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-purple-700 px-5 py-3 font-bold text-white disabled:opacity-40">{saving ? "Saving…" : "Save product"}</button></div></form></div>}
    </section>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-bold">{label}{children}</label>;
}
