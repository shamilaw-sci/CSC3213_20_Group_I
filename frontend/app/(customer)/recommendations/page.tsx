"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import FavoriteButton from "@/app/components/FavoriteButton";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useFavorites } from "@/features/favorites/useFavorites";
import TryOnButton from "@/features/try-on/components/TryOnButton";
import TryOnModal from "@/features/try-on/components/TryOnModal";

type Recommendation = {
  productId: string;
  recommendedSize: string | null;
  fitScore: number | null;
  recommendationScore: number | null;
  mode: "combined" | "fit" | "interest" | "general";
  reasons: string[];
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    merchantName: string;
    categoryName: string;
    price: number;
    currency: string;
    availableSizes: string[];
  };
};

type RecommendationResponse = {
  recommendations: Recommendation[];
  hasMeasurements: boolean;
  hasInterestHistory: boolean;
};

export default function RecommendationsPage() {
  const { changeTab } = useProfile();
  const { favoriteIds, loading: favoritesLoading, error: favoritesError, updateFavorite } = useFavorites();
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecommendations() {
      try {
        const response = await fetch("/api/v1/recommendations", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          setNeedsLogin(true);
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ?? "Could not load recommendations.",
          );
        }

        setData(result as RecommendationResponse);
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load recommendations.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadRecommendations();
    return () => controller.abort();
  }, []);

  return (
    <div className="tv-page min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:pl-80">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Your fitting-room picks
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Recommended For You
          </h1>
          <p className="mt-2 text-gray-600">
            Suggestions based on available size information and your saved
            product interests. Fit percentages are project-level estimates,
            not guarantees.
          </p>
        </div>

        {loading && <p role="status">Loading recommendations...</p>}

        {!loading && needsLogin && (
          <div className="rounded-2xl border bg-white p-6 text-gray-900">
            <p>Log in to see recommendations for your profile.</p>
            <Link href="/login" className="mt-4 inline-block font-semibold text-indigo-600">
              Log in
            </Link>
          </div>
        )}

        {!loading && error && (
          <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700">
            {error}
          </p>
        )}
        {favoritesError && (
          <p role="alert" className="mb-6 rounded-xl bg-rose-50 p-4 text-rose-700">
            Favorites are unavailable: {favoritesError}
          </p>
        )}

        {data && (
          <>
            {!data.hasMeasurements && (
              <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                <p className="font-semibold text-indigo-950">
                  Add your measurements to get personalized size recommendations.
                </p>
                <Link
                  href="/profile"
                  onClick={() => changeTab("measurements")}
                  className="mt-3 inline-block font-semibold text-indigo-700 underline"
                >
                  Add measurements
                </Link>
              </div>
            )}

            {!data.hasInterestHistory && (
              <p className="mb-6 text-sm text-gray-600">
                Save favorites or visit merchant products to improve interest
                matching. You can still explore the available products below.
              </p>
            )}

            {data.recommendations.length === 0 ? (
              <div className="rounded-2xl border bg-white p-6 text-gray-900">
                <p>No active products are available for recommendations yet.</p>
                <Link href="/explore" className="mt-3 inline-block font-semibold text-indigo-600">
                  Explore products
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.recommendations.map((item) => {
                  const product = item.product;
                  const image = product.imageUrl ?? "/clothes.jpg";

                  return (
                    <article
                      key={item.productId}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="relative aspect-[4/3] bg-gray-100">
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                          unoptimized
                        />
                        <FavoriteButton
                          productId={product.id}
                          isFavorite={favoriteIds.has(product.id)}
                          disabled={favoritesLoading || Boolean(favoritesError)}
                          onChange={updateFavorite}
                        />
                      </div>

                      <div className="p-5">
                        <p className="text-xs font-semibold uppercase text-indigo-600">
                          {product.categoryName} · {product.merchantName}
                        </p>
                        <h2 className="mt-2 text-lg font-bold text-gray-900">
                          {product.name}
                        </h2>
                        <p className="mt-1 font-semibold text-gray-700">
                          {product.currency} {product.price.toFixed(2)}
                        </p>

                        <div className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-gray-900">
                          <p>
                            Recommended size:{" "}
                            <strong>{item.recommendedSize ?? "Not available"}</strong>
                          </p>
                          <p className="mt-1">
                            Fit:{" "}
                            <strong>
                              {item.fitScore === null
                                ? "Not available"
                                : `${Math.round(item.fitScore)}%`}
                            </strong>
                          </p>
                        </div>

                        <div className="mt-4">
                          <h3 className="text-sm font-bold text-gray-900">
                            Why recommended?
                          </h3>
                          {item.reasons.length > 0 ? (
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                              {item.reasons.map((reason, index) => (
                                <li key={`${reason}-${index}`}>{reason}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-sm text-gray-600">
                              An available product to explore while we learn
                              your fit and preferences.
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/products/${product.id}`}
                          className="mt-5 block rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white"
                        >
                          View product
                        </Link>

                        <TryOnButton
                          product={{
                            id: product.id,
                            title: product.name,
                            image,
                            category: product.categoryName,
                            store: product.merchantName,
                            price: product.price,
                            currency: product.currency,
                            availableSizes: product.availableSizes,
                          }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <TryOnModal />
    </div>
  );
}
