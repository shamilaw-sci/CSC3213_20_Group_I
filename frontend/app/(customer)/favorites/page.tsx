"use client";

import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import ProductGrid from "@/app/components/ProductGrid";
import type { Product } from "@/app/data/products";
import { useFavorites } from "@/features/favorites/useFavorites";

export default function FavoritesPage() {
  const { favorites, favoriteIds, loading, error, isAuthenticated, updateFavorite } = useFavorites();
  const products: Product[] = favorites.map((favorite) => ({
    id: favorite.product.id,
    title: favorite.product.name,
    image: favorite.product.image ?? "https://placehold.co/600x750?text=TryVora",
    store: favorite.product.merchant.name,
    category: favorite.product.category.name as Product["category"],
    categorySlug: favorite.product.category.slug,
    price: favorite.product.price,
  }));

  return (
    <div className="tv-page min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8 lg:pl-80">
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
          ) : !isAuthenticated ? (
            <p className="text-sm text-gray-700">Log in to see your saved products. <Link href="/login" className="font-semibold text-indigo-600 underline">Log in</Link></p>
          ) : error ? (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-700">No saved products yet. Explore the catalogue and tap a heart to save one.</p>
          ) : (
            <ProductGrid products={products} favoriteIds={favoriteIds} onFavoriteChange={updateFavorite} />
          )}
        </div>
      </main>
    </div>
  );
}
