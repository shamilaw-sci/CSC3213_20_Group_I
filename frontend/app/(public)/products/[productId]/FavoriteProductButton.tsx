"use client";

import FavoriteButton from "@/app/components/FavoriteButton";
import { useFavorites } from "@/features/favorites/useFavorites";

export default function FavoriteProductButton({ productId }: { productId: string }) {
  const { favoriteIds, loading, error, updateFavorite } = useFavorites();
  return (
    <FavoriteButton
      productId={productId}
      isFavorite={favoriteIds.has(productId)}
      disabled={loading || Boolean(error)}
      onChange={updateFavorite}
    />
  );
}
