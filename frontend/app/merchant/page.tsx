"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, PlusCircle, Trash2, Upload } from "lucide-react";

import Navbar from "@/app/components/Navbar";

type Category = { id: string; name: string };
type ProductVariant = {
  id?: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number | null;
  stockQuantity: number;
};
type Product = {
  id: string;
  name: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
  price: number;
  currency: string;
  image: string | null;
  merchantUrl: string;
  categoryId: string;
  category: string;
  variants: ProductVariant[];
};

type ProductFormState = {
  productName: string;
  categoryId: string;
  description: string;
  price: string;
  currency: string;
  stock: string;
  sizes: string;
  colors: string;
  merchantUrl: string;
  status: Product["status"];
  imageUrl: string;
};

const emptyForm: ProductFormState = {
  productName: "",
  categoryId: "",
  description: "",
  price: "",
  currency: "USD",
  stock: "0",
  sizes: "M",
  colors: "",
  merchantUrl: "",
  status: "DRAFT",
  imageUrl: "",
};

function slugifySku(name: string, size: string, index: number) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${size}-${index}`;
}

function variantsFromForm(form: ProductFormState) {
  const sizes = form.sizes.split(",").map((size) => size.trim()).filter(Boolean);
  const colors = form.colors.split(",").map((color) => color.trim()).filter(Boolean);
  return sizes.map((size, index) => ({
    sku: slugifySku(form.productName, size, index),
    size,
    color: colors[index % Math.max(colors.length, 1)] || null,
    stockQuantity: Number(form.stock || 0),
  }));
}

function productToForm(product: Product): ProductFormState {
  return {
    productName: product.name,
    categoryId: product.categoryId,
    description: product.description ?? "",
    price: String(product.price),
    currency: product.currency,
    stock: String(product.variants[0]?.stockQuantity ?? 0),
    sizes: product.variants.map((variant) => variant.size).filter(Boolean).join(", ") || "M",
    colors: product.variants.map((variant) => variant.color).filter(Boolean).join(", "),
    merchantUrl: product.merchantUrl,
    status: product.status,
    imageUrl: product.image ?? "",
  };
}

export default function MerchantPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const [syncing, setSyncing] = useState(false);

  const modalTitle = editing ? "Edit Catalog Product" : "Add Dress to Catalog";
  const categoryOptions = useMemo(() => categories, [categories]);

  async function load() {
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch("/api/v1/categories"),
      fetch("/api/v1/merchant/products"),
    ]);
    if (categoriesResponse.ok) setCategories((await categoriesResponse.json()).categories);
    if (productsResponse.ok) setProducts((await productsResponse.json()).products);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function updateField(field: keyof ProductFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEditModal(product: Product) {
    setEditing(product);
    setForm(productToForm(product));
    setOpen(true);
  }

  async function uploadImage(image: FormDataEntryValue | null) {
    if (!(image instanceof File) || !image.size) return form.imageUrl || undefined;
    const upload = new FormData();
    upload.set("image", image);
    const response = await fetch("/api/v1/merchant/uploads", { method: "POST", body: upload });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    return result.imageUrl as string;
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const submitted = new FormData(event.currentTarget);
      const primaryImageUrl = await uploadImage(submitted.get("image"));
      const payload = {
        categoryId: form.categoryId,
        productName: form.productName,
        description: form.description || null,
        price: Number(form.price),
        currency: form.currency,
        merchantUrl: form.merchantUrl,
        primaryImageUrl,
        status: form.status,
        variants: variantsFromForm(form),
      };

      const response = await fetch(
        editing ? `/api/v1/merchant/products/${editing.id}` : "/api/v1/merchant/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessage(editing ? "Catalog product updated." : "Dress submitted as DRAFT.");
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save catalog product.");
    } finally {
      setSaving(false);
    }
  }

  async function archiveProduct(product: Product) {
    const response = await fetch(`/api/v1/merchant/products/${product.id}`, { method: "DELETE" });
    if (response.ok) {
      setMessage("Catalog product archived.");
      await load();
    }
  }

  async function syncFeed(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSyncing(true);
    setMessage("");
    try {
      const response = await fetch("/api/v1/merchant/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feedUrl }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Could not synchronize the product feed.");
      setMessage(`Product feed synchronized: ${result.sync?.upserted ?? 0} product(s) updated.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not synchronize the product feed.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="tv-page min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <section className="rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-600 p-7 text-white">
          <p className="font-bold uppercase tracking-wider text-white/75">Merchant Dashboard</p>
          <h1 className="mt-2 text-3xl font-black">Your TryVora catalog</h1>
          <p className="mt-2 text-white/85">Create dress listings, edit stock and variants, and monitor approval status.</p>
          <button onClick={openCreateModal} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-indigo-700 shadow hover:bg-indigo-50">
            <PlusCircle size={20} /> Add Catalog
          </button>
        </section>

        {message && <p className="mt-6 rounded-xl bg-indigo-50 p-4 font-medium text-indigo-900">{message}</p>}

        <section className="tv-card mt-6 p-6">
          <h2 className="text-xl font-bold">Add multiple products</h2>
          <p className="mt-1 text-sm text-gray-500">Import several catalogue products at once from a JSON feed hosted on your approved merchant website. Each imported product is saved as DRAFT for admin review.</p>
          <form onSubmit={syncFeed} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input value={feedUrl} onChange={(event) => setFeedUrl(event.target.value)} required type="url" placeholder="https://your-store.example/catalog.json" className="min-w-0 flex-1 rounded-xl border p-3" />
            <button type="submit" disabled={syncing} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">{syncing ? "Importing…" : "Import products"}</button>
          </form>
        </section>

        <section className="tv-card mt-8 p-6">
          <h2 className="text-xl font-bold">Catalog products</h2>
          {products.length ? (
            <div className="mt-4 divide-y">
              {products.map((product) => (
                <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category} · {product.variants.length} sizes/variants</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{product.currency} {product.price.toFixed(2)}</p>
                      <span className="text-sm font-bold text-indigo-700">{product.status}</span>
                    </div>
                    <button onClick={() => openEditModal(product)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" aria-label={`Edit ${product.name}`}>
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => void archiveProduct(product)} className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50" aria-label={`Archive ${product.name}`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">Select Add Catalog to submit your first dress.</p>
          )}
        </section>
      </main>

      {open && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <form onSubmit={saveProduct} className="mx-auto my-8 max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black">{modalTitle}</h2>
                <p className="mt-1 text-sm text-gray-500">Manage the product details customers see in Explore.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-2xl">x</button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input value={form.productName} onChange={(event) => updateField("productName", event.target.value)} required placeholder="Dress name" className="rounded-xl border p-3" />
              <select value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)} required className="rounded-xl border p-3">
                <option value="">Category</option>
                {categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Dress description" className="min-h-28 rounded-xl border p-3 sm:col-span-2" />
              <input value={form.price} onChange={(event) => updateField("price", event.target.value)} required type="number" min="0" step="0.01" placeholder="Price" className="rounded-xl border p-3" />
              <input value={form.currency} onChange={(event) => updateField("currency", event.target.value.toUpperCase())} required maxLength={3} placeholder="Currency" className="rounded-xl border p-3" />
              <input value={form.stock} onChange={(event) => updateField("stock", event.target.value)} required type="number" min="0" placeholder="Stock quantity" className="rounded-xl border p-3" />
              <select value={form.status} onChange={(event) => updateField("status", event.target.value)} className="rounded-xl border p-3">
                <option value="DRAFT">Draft</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <input value={form.sizes} onChange={(event) => updateField("sizes", event.target.value)} required placeholder="Sizes: S, M, L, XL" className="rounded-xl border p-3" />
              <input value={form.colors} onChange={(event) => updateField("colors", event.target.value)} placeholder="Colours: Red, Blue" className="rounded-xl border p-3" />
              <input value={form.merchantUrl} onChange={(event) => updateField("merchantUrl", event.target.value)} required type="url" placeholder="Customer redirection / purchase link" className="rounded-xl border p-3 sm:col-span-2" />
              <input value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} type="url" placeholder="Existing image URL" className="rounded-xl border p-3 sm:col-span-2" />
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-indigo-300 p-4 text-sm font-semibold text-indigo-700 sm:col-span-2">
                <Upload size={20} /> Upload replacement image (JPG, PNG, WebP; max 5 MB)
                <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" />
              </label>
            </div>

            <button disabled={saving} className="tv-button mt-6 w-full py-3 disabled:opacity-60">
              {saving ? "Saving..." : editing ? "Save Product Changes" : "Submit Dress as Draft"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
