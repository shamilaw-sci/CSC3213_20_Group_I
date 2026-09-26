"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import ProductGrid from "@/app/components/ProductGrid";
import type { Product } from "@/app/data/products";

type FavoriteResponse = {
  id: string;
  product: {
    id: string;
    name: string;
    image: string | null;
    merchant: { name: string };
    category: { name: string; slug: string };
    price: number;
  };
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      try {
        const response = await fetch("/api/v1/favorites", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "Could not load favorites.");
        }

        setFavorites(data.favorites.map((favorite: FavoriteResponse) => ({
          id: favorite.product.id,
          title: favorite.product.name,
          image: favorite.product.image ?? "https://placehold.co/600x750?text=TryVora",
          store: favorite.product.merchant.name,
          category: favorite.product.category.name as Product["category"],
          categorySlug: favorite.product.category.slug,
          price: favorite.product.price,
        })));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not load favorites.");
      } finally {
        setLoading(false);
      }
    }

    void loadFavorites();
  }, []);

  return (
    <div className="tv-page min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Favorites</h1>
            <p className="mt-1 text-sm text-gray-500">Saved dresses and products for quick comparison.</p>
          </div>
          <Link href="/explore" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
            Explore more
          </Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <p className="text-sm text-gray-400">Loading favorites...</p>
          ) : error ? (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
          ) : (
            <ProductGrid products={favorites} />
          )}
        </div>
      </main>
    </div>
  );
}
