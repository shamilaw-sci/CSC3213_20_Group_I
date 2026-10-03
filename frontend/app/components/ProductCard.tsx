"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Heart } from "lucide-react";

import type { Product } from "@/app/data/products";
import { useCart } from "@/features/cart/hooks/useCart";
import TryOnButton from "@/features/try-on/components/TryOnButton";

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
}

export default function ProductCard({
  product,
  compareSelected = false,
  compareDisabled = false,
  onToggleCompare,
}: ProductCardProps) {
  const [liked, setLiked] = useState(false);

  const { addToCart } = useCart();
  const sizes = Array.from(new Set(product.variants?.map((variant) => variant.size).filter(Boolean))).slice(0, 4);
  const colors = Array.from(new Set(product.variants?.map((variant) => variant.color).filter(Boolean)));
  const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock ?? 0), 0);
  const priceFormatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency: product.currency ?? "USD",
  });

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

        {/* Wishlist */}
        <button
          onClick={async () => {
            const nextLiked = !liked;
            setLiked(nextLiked);
            const response = await fetch(`/api/v1/favorites/${product.id}`, {
              method: nextLiked ? "POST" : "DELETE",
            });

            if (!response.ok) {
              setLiked(!nextLiked);
            }
          }}
          aria-label={liked ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center"
        >
          <Heart
            size={18}
            className={
              liked
                ? "fill-red-500 text-red-500"
                : "text-gray-500"
            }
          />
        </button>
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
          {priceFormatter.format(product.price)}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
          {typeof totalStock === "number" && (
            <span className={`rounded-full px-2.5 py-1 ${totalStock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
            </span>
          )}
          {sizes.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              Sizes {sizes.join(", ")}
            </span>
          )}
          {colors.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {colors.length} colour{colors.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

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
