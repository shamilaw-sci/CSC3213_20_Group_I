"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface Product {
  image: string;
  title: string;
  category: string;
  store: string;
  price: number;
}

const badgeColors: Record<string, string> = {
  Dresses: "bg-purple-600",
  Tops: "bg-sky-500",
  Bottoms: "bg-emerald-500",
  Accessories: "bg-amber-500",
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition">
      <div className="relative aspect-[4/5] bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />

        <span
          className={`absolute top-3 left-3 text-white text-xs font-medium px-2 py-1 rounded-md ${badgeColors[product.category]}`}
        >
          {product.category}
        </span>

        <button
          onClick={() => setLiked((prev) => !prev)}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
        >
          <Heart
            size={16}
            className={liked ? "fill-red-500 text-red-500" : "text-gray-500"}
          />
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{product.store}</p>
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
        <p className="font-semibold text-gray-900 mb-3">${product.price.toFixed(2)}</p>

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg mb-2 transition">
          Add to Cart
        </button>
        <button className="w-full border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition">
          Try On
        </button>
      </div>
    </div>
  );
}
