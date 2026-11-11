"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";

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

export default function ComparisonsPage() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadComparisons() {
    try {
      const response = await fetch("/api/v1/comparisons", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Could not load comparisons.");
      }

      setComparisons(data.comparisons);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load comparisons.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteComparison(comparisonId: string) {
    const response = await fetch(`/api/v1/comparisons/${comparisonId}`, { method: "DELETE" });
    if (response.ok) {
      setComparisons((current) => current.filter((comparison) => comparison.id !== comparisonId));
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadComparisons();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="tv-page min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:pl-80">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-100">Compare your shortlist</p>
            <h1 className="mt-2 text-3xl font-black">Comparisons</h1>
            <p className="mt-2 text-sm text-indigo-100">Review saved products side by side before choosing your next outfit.</p>
          </div>
          <Link href="/explore" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-50">
            Find products
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          {loading ? (
            <p className="text-sm text-gray-400">Loading comparisons...</p>
          ) : error ? (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
          ) : comparisons.length ? (
            comparisons.map((comparison) => (
              <section key={comparison.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-950">{comparison.name ?? "Saved comparison"}</h2>
                    <p className="text-sm text-gray-500">
                      {comparison.products.length} products · Updated {new Date(comparison.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => void deleteComparison(comparison.id)}
                    className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {comparison.products.map((product) => (
                    <Link
                      href={`/products/${product.id}`}
                      key={product.id}
                      className="rounded-xl border border-gray-100 p-4 transition hover:border-indigo-200 hover:shadow"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={product.image ?? "https://placehold.co/600x750?text=TryVora"}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 40vw, 90vw"
                          className="object-contain bg-white p-2"
                        />
                      </div>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {product.merchant}
                      </p>
                      <h3 className="mt-1 font-bold text-gray-900">{product.name}</h3>
                      <p className="mt-2 font-black text-indigo-700">
                        {product.currency} {product.price.toFixed(2)}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {product.variants.length} variants
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="font-semibold text-gray-900">No comparisons saved yet.</p>
              <p className="mt-2 text-sm text-gray-500">Create a comparison from selected products on Explore.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
