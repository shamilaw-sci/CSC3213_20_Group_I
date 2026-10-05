"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import type { Product } from "@/app/data/products";
import { useCart } from "@/features/cart/hooks/useCart";
import TryOnButton from "@/features/try-on/components/TryOnButton";
import FavoriteButton from "./FavoriteButton";

const badgeColors: Record<string, string> = {
  Dresses: "bg-purple-600",
  Tops: "bg-sky-500",
  Bottoms: "bg-emerald-500",
  Accessories: "bg-amber-500",
};

interface ProductCardProps {
  product: Product;
  compareSelected?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: (product: Product) => void;
  isFavorite: boolean;
  favoriteStateUnavailable?: boolean;
  onFavoriteChange: (productId: string, nextFavorite: boolean) => Promise<void>;
}

export default function ProductCard({
  product,
  compareSelected = false,
  compareDisabled = false,
  onToggleCompare,
  isFavorite,
  favoriteStateUnavailable = false,
  onFavoriteChange,
}: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">

      {/* Product Image */}
      <div className="relative aspect-[4/5] bg-gray-100">

        <Link href={`/products/${product.id}`} aria-label={`View ${product.title}`}>
          <Image
            src={product.image}
            alt={product.title}
            fill
            unoptimized
            className="object-cover"
          />
        </Link>

        {/* Category Badge */}
        <span
          className={`absolute top-3 left-3 text-white text-xs font-medium px-3 py-1 rounded-full ${
            badgeColors[product.category] ?? "bg-gray-500"
          }`}
        >
          {product.category}
        </span>

        <FavoriteButton
          productId={String(product.id)}
          isFavorite={isFavorite}
          disabled={favoriteStateUnavailable}
          onChange={onFavoriteChange}
        />
      </div>

      {/* Product Details */}
      <div className="p-5">

        <p className="text-xs uppercase tracking-wide text-gray-400">
          {product.store}
        </p>

        <Link href={`/products/${product.id}`} className="mt-1 block font-semibold text-lg text-gray-900 hover:text-indigo-600">
          {product.title}
        </Link>

        <p className="mt-2 text-2xl font-bold text-indigo-600">
          ${product.price.toFixed(2)}
        </p>

        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(product)}
            disabled={compareDisabled && !compareSelected}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              compareSelected
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {compareSelected && <CheckCircle2 size={16} />}
            {compareSelected ? "Selected to compare" : "Compare"}
          </button>
        )}

        {/* Add To Cart */}
        <button
          onClick={() =>
            addToCart({
              id: product.id,
              image: product.image,
              title: product.title,
              category: product.category,
              store: product.store,
              price: product.price,
            })
          }
          className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Add to Cart
        </button>

        {/* Try On */}
        <div className="mt-3">
          <TryOnButton
            product={{
              id: product.id,
              title: product.title,
              store: product.store,
              category: product.category,
              image: product.image,
              price: product.price,
            }}
          />
        </div>

      </div>
    </div>
  );
}
