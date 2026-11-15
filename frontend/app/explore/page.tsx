/** WBS-3.x | Owner: S/21/501 | Branch: feature/s21-501-catalogue-merchants | Scope: Catalogue, merchants, comparison and redirects. */
"use client"; 

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
// Use relative imports to avoid module alias issues in this file
import Navbar from "../components/Navbar";
import SearchFilterBar from "../components/SearchFilterBar";
import CategoryTabs, { type CatalogueCategory } from "../components/CategoryTabs";
import ProductGrid from "../components/ProductGrid";
import type { Product } from "../data/products";
import { useFavorites } from "@/features/favorites/useFavorites";

type ProductResponse = {
  id: string;
  name: string;
  image: string | null;
  merchant: { name: string };
  category: { name: string; slug: string };
  price: number;
};

const pageSize = 12;

export default function ExplorePage() {
  const { favoriteIds, loading: favoritesLoading, error: favoritesError, updateFavorite } = useFavorites();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<CatalogueCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [compareName, setCompareName] = useState("");
  const [compareMessage, setCompareMessage] = useState("");
  const [savingComparison, setSavingComparison] = useState(false);
  const [savedComparison, setSavedComparison] = useState<{ id: string; name: string } | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSubmittedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          sort,
        });

        if (submittedSearch) params.set("q", submittedSearch);
        if (category !== "all") params.set("category", category);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);

        const response = await fetch(`/api/v1/products?${params}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Could not load catalog.");
        setProducts(data.products.map((product: ProductResponse) => ({
          id: product.id,
          title: product.name,
          image: product.image ?? "https://placehold.co/600x750?text=TryVora",
          store: product.merchant.name,
          category: product.category.name as Product["category"],
          categorySlug: product.category.slug,
          price: product.price,
        })));
        setTotal(data.total);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not load catalog.");
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    void loadProducts();
  }, [category, maxPrice, minPrice, page, sort, submittedSearch]);

  useEffect(() => {
    async function loadCategories() {
      const response = await fetch("/api/v1/categories", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setCategories(data.categories);
    }

    void loadCategories();
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);
  const selectedCompareIds = useMemo(
    () => new Set(compareProducts.map((product) => product.id)),
    [compareProducts],
  );

  function toggleCompareProduct(product: Product) {
    setCompareMessage("");
    setCompareProducts((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current.filter((item) => item.id !== product.id);
      }

      if (current.length >= 4) return current;
      return [...current, product];
    });
  }

  async function saveComparison() {
    setSavingComparison(true);
    setCompareMessage("");

    try {
      const response = await fetch("/api/v1/products/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: compareProducts.map((product) => product.id),
          name: compareName || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Could not save comparison.");
      }

      const savedId = data.comparison?.id as string | undefined;
      if (savedId) setSavedComparison({ id: savedId, name: data.comparison.name ?? (compareName.trim() || "Saved comparison") });
      setCompareMessage(savedId ? "Comparison saved." : "Comparison saved. Open Comparisons to review it.");
      setCompareProducts([]);
      setCompareName("");
    } catch (reason) {
      setCompareMessage(reason instanceof Error ? reason.message : "Could not save comparison.");
    } finally {
      setSavingComparison(false);
    }
  }

  return (
    <div className="tv-page">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Fashion Wardrobe</h1>
        <p className="text-gray-500 text-sm mb-6">Explore curated collections from top stores</p>

        <SearchFilterBar
          value={search}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
          onChange={setSearch}
          onMinPriceChange={(value) => {
            setMinPrice(value);
            setPage(1);
          }}
          onMaxPriceChange={(value) => {
            setMaxPrice(value);
            setPage(1);
          }}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        />

        {savedComparison && (
          <Link href={`/comparisons?comparisonId=${encodeURIComponent(savedComparison.id)}`} className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-indigo-200 bg-white p-4 shadow-2xl transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-indigo-200">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700" aria-hidden="true">↗</span>
            <span><span className="block text-xs font-semibold uppercase tracking-wide text-indigo-600">Comparison saved</span><span className="block max-w-52 truncate font-bold text-slate-950">View {savedComparison.name}</span></span>
          </Link>
        )}
        <CategoryTabs
          active={category}
          categories={categories}
          onChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        />

        {loading ? <p className="text-sm text-gray-400 mb-4">Loading database catalog...</p> : error ? <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : <p className="text-sm text-gray-400 mb-4">Showing {products.length} of {total} database products</p>}
        {favoritesError && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">Favorites are unavailable: {favoritesError}</p>}

        <ProductGrid
          products={products}
          favoriteIds={favoriteIds}
          favoriteStateUnavailable={favoritesLoading || Boolean(favoritesError)}
          onFavoriteChange={updateFavorite}
          selectedCompareIds={selectedCompareIds}
          compareDisabled={compareProducts.length >= 4}
          onToggleCompare={toggleCompareProduct}
        />

        {compareProducts.length > 0 && (
          <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-4xl rounded-2xl border border-indigo-100 bg-white p-4 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-950">Compare selected products</p>
                <p className="text-sm text-slate-500">{compareProducts.length} selected · choose 2 to 4 products</p>
              </div>
              <button
                onClick={() => {
                  setCompareProducts([]);
                  setCompareMessage("");
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {compareProducts.map((product) => (
                <span key={product.id} className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                  {product.title}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={compareName}
                onChange={(event) => setCompareName(event.target.value)}
                placeholder="Comparison name"
                className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => void saveComparison()}
                disabled={compareProducts.length < 2 || savingComparison}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingComparison ? "Saving..." : "Save comparison"}
              </button>
            </div>

            {compareMessage && <p className="mt-3 text-sm font-semibold text-indigo-700">{compareMessage}</p>}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
