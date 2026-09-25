/** WBS-3.x | Owner: S/21/501 | Branch: feature/s21-501-catalogue-merchants | Scope: Catalogue, merchants, comparison and redirects. */
"use client"; 

import React, { useEffect, useMemo, useState } from "react";
// Use relative imports to avoid module alias issues in this file
import Navbar from "../components/Navbar";
import SearchFilterBar from "../components/SearchFilterBar";
import CategoryTabs, { type CatalogueCategory } from "../components/CategoryTabs";
import ProductGrid from "../components/ProductGrid";
import type { Product } from "../data/products";

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
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<CatalogueCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
        <CategoryTabs
          active={category}
          categories={categories}
          onChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        />

        {loading ? <p className="text-sm text-gray-400 mb-4">Loading database catalog...</p> : error ? <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : <p className="text-sm text-gray-400 mb-4">Showing {products.length} of {total} database products</p>}

        <ProductGrid products={products} />

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
