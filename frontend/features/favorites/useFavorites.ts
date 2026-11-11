"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/context/AuthContext";

export type FavoriteRecord = {
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

type FavoriteSnapshot = {
  userId: string;
  favorites: FavoriteRecord[];
  favoriteIds: Set<string>;
  error: string;
};

const emptyFavorites: FavoriteRecord[] = [];
const emptyFavoriteIds = new Set<string>();

export function useFavorites() {
  const { ready, user } = useAuth();
  const userId = user?.id;
  const [snapshot, setSnapshot] = useState<FavoriteSnapshot | null>(null);
  const current = snapshot?.userId === userId ? snapshot : null;
  const favorites = current?.favorites ?? emptyFavorites;
  const favoriteIds = current?.favoriteIds ?? emptyFavoriteIds;
  const error = current?.error ?? "";
  const loading = !ready || Boolean(userId && !current);

  useEffect(() => {
    if (!ready || !userId) return;

    const controller = new AbortController();

    async function loadFavorites() {
      try {
        const response = await fetch("/api/v1/favorites", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.message ?? "Could not load favorites.");
        }

        if (!Array.isArray(body.favorites)) throw new Error("Could not load favorites.");
        const saved = body.favorites as FavoriteRecord[];
        if (!controller.signal.aborted) {
          setSnapshot({
            userId: userId!,
            favorites: saved,
            favoriteIds: new Set(saved.map((favorite) => favorite.product.id)),
            error: "",
          });
        }
      } catch (reason) {
        if (!controller.signal.aborted) {
          setSnapshot({
            userId: userId!,
            favorites: [],
            favoriteIds: new Set(),
            error: reason instanceof Error ? reason.message : "Could not load favorites.",
          });
        }
      }
    }

    void loadFavorites();
    return () => controller.abort();
  }, [ready, userId]);

  const updateFavorite = useCallback(async (productId: string, nextFavorite: boolean) => {
    if (!user) throw new Error("Log in to save favorites.");

    const response = await fetch(`/api/v1/favorites/${encodeURIComponent(productId)}`, {
      method: nextFavorite ? "POST" : "DELETE",
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) throw new Error("Log in to save favorites.");
      throw new Error(body.message ?? "Could not update favorites.");
    }

    setSnapshot((previous) => {
      if (!previous || previous.userId !== user.id) return previous;
      const updatedIds = new Set(previous.favoriteIds);
      if (nextFavorite) updatedIds.add(productId);
      else updatedIds.delete(productId);
      return {
        ...previous,
        favoriteIds: updatedIds,
        favorites: nextFavorite
          ? previous.favorites
          : previous.favorites.filter((favorite) => favorite.product.id !== productId),
      };
    });
  }, [user]);

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    isAuthenticated: Boolean(user),
    updateFavorite,
  };
}
