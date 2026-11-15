"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

type FavoriteButtonProps = {
  productId: string;
  isFavorite: boolean;
  disabled?: boolean;
  onChange: (productId: string, nextFavorite: boolean) => Promise<void>;
};

export default function FavoriteButton({
  productId,
  isFavorite,
  disabled = false,
  onChange,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function toggleFavorite() {
    setPending(true);
    setError("");
    try {
      await onChange(productId, !isFavorite);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update favorites.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => void toggleFavorite()}
        disabled={disabled || pending}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={isFavorite}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow disabled:cursor-wait disabled:opacity-60"
      >
        <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"} />
      </button>
      {error && (
        <p role="alert" className="max-w-48 rounded-lg bg-white p-2 text-right text-xs text-rose-700 shadow">
          {error === "Log in to save favorites." ? <Link href="/login" onClick={(event) => { event.preventDefault(); const returnTo = `${window.location.pathname}${window.location.search}`; router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`); }} className="underline">{error}</Link> : error}
        </p>
      )}
    </div>
  );
}
