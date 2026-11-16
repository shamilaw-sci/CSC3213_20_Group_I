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
    <div className="tv-page min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:pl-80">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-100">Your saved style</p>
            <h1 className="mt-2 text-3xl font-black">Favorites</h1>
            <p className="mt-2 text-sm text-indigo-100">Keep the dresses and products you want to revisit.</p>
          </div>
          <Link href="/explore" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50">
            Explore more
          </Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading favorites">
              {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-slate-200" />)}
            </div>
          ) : !isAuthenticated ? (
            <p className="text-sm text-gray-700">Log in to see your saved products. <Link href="/login" className="font-semibold text-indigo-600 underline">Log in</Link></p>
          ) : error ? (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/60 p-8 text-center">
              <p className="font-bold text-slate-900">No saved products yet</p>
              <p className="mt-1 text-sm text-slate-600">Explore the catalogue and tap a heart to save a style you love.</p>
              <Link href="/explore" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Browse Explore</Link>
            </div>
          ) : (
            <ProductGrid products={products} favoriteIds={favoriteIds} onFavoriteChange={updateFavorite} />
          )}
        </div>
      </main>
    </div>
  );
}
