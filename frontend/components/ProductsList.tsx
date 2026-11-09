"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductGrid from "@/app/components/ProductGrid";
import type { Product } from "@/app/data/products";
import { useFavorites } from "@/features/favorites/useFavorites";
import TryOnModal from "@/features/try-on/components/TryOnModal";

type CatalogueProduct = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  currency: string;
  merchant: { name: string };
  category: { name: string; slug: string };
  variants: { size: string | null }[];
};

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const favorites = useFavorites();

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/v1/products?pageSize=4&sort=newest", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not load products.");
        const data = await response.json();
        if (!Array.isArray(data.products)) throw new Error("Could not load products.");
        const items = data.products.map((product: CatalogueProduct): Product => ({
          id: product.id,
          title: product.name,
          image: product.image || "/placeholders/product.svg",
          price: product.price,
          currency: product.currency,
          store: product.merchant.name,
          category: product.category.name as Product["category"],
          categorySlug: product.category.slug,
          availableSizes: [...new Set(product.variants.flatMap((variant) => variant.size ? [variant.size] : []))],
        }));
        if (!controller.signal.aborted) setProducts(items);
      } catch {
        if (!controller.signal.aborted) {
          setProducts([]);
          setError("Could not load products. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadProducts();
    return () => controller.abort();
  }, [attempt]);

  return (
    <section id="latest-products" aria-labelledby="latest-products-title" className="scroll-mt-28 bg-gradient-to-r from-pink-100 to-gray-100 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 id="latest-products-title" className="text-center text-4xl font-semibold text-gray-950">Latest Outfits</h2>
        <p className="mt-4 mb-10 text-center text-lg text-gray-600">Discover the latest arrivals from our partner stores and try them on.</p>
        {loading ? (
          <p role="status" className="py-16 text-center text-gray-600">Loading products…</p>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-white p-8 text-center text-rose-700">
            <p>{error}</p>
            <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-4 rounded-lg border border-rose-700 px-5 py-2 font-semibold hover:bg-rose-50">Try again</button>
          </div>
        ) : products.length === 0 ? (
          <p role="status" className="py-16 text-center text-gray-600">No products are available yet. Check back soon for new arrivals.</p>
        ) : (
          <>
            {favorites.error && <p role="alert" className="mb-4 text-rose-700">Favorites are unavailable: {favorites.error}</p>}
            <ProductGrid products={products} favoriteIds={favorites.favoriteIds} favoriteStateUnavailable={favorites.loading || Boolean(favorites.error)} onFavoriteChange={favorites.updateFavorite} />
          </>
        )}
        <div className="mt-10 text-center">
          <Link href="/explore" className="inline-block rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white">Explore All Items</Link>
        </div>
      </div>
      <TryOnModal />
    </section>
  );
}
