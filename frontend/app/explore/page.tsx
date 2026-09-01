/** WBS-3.x | Owner: S/21/501 | Branch: feature/s21-501-catalogue-merchants | Scope: Catalogue, merchants, comparison and redirects. */
"use client"; 

import React, { useEffect, useMemo, useState } from "react";
// Use relative imports to avoid module alias issues in this file
import Navbar from "../components/Navbar";
import SearchFilterBar from "../components/SearchFilterBar";
import CategoryTabs from "../components/CategoryTabs";
import ProductGrid from "../components/ProductGrid";
import type { Product } from "../data/products";


export default function ExplorePage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/v1/products", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Could not load catalog.");
        setProducts(data.products.map((product: { id: string; name: string; image: string | null; merchant: { name: string }; category: { name: string }; price: number }) => ({ id: product.id, title: product.name, image: product.image ?? "https://placehold.co/600x750?text=TryVora", store: product.merchant.name, category: product.category.name as Product["category"], price: product.price })));
      } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load catalog."); }
      finally { setLoading(false); }
    }
    void loadProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const query = search.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(query) || p.store.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <div className="tv-page">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Fashion Wardrobe</h1>
        <p className="text-gray-500 text-sm mb-6">Explore curated collections from top stores</p>

        <SearchFilterBar value={search} onChange={setSearch} />
        <CategoryTabs active={category} onChange={setCategory} />

        {loading ? <p className="text-sm text-gray-400 mb-4">Loading database catalog…</p> : error ? <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : <p className="text-sm text-gray-400 mb-4">Showing {filtered.length} database products</p>}

        <ProductGrid products={filtered} />
      </main>
    </div>
  );
}
