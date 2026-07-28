"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useCart } from "@/features/cart/hooks/useCart";

interface Product {
  id: number;
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

  const { addToCart } = useCart();
  console.log("Rendering ProductCard:", product.title);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition duration-300">

      {/* Image */}
      <div className="relative aspect-[4/5] bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />

        <span
          className={`absolute top-3 left-3 text-white text-xs font-medium px-2 py-1 rounded-md ${
            badgeColors[product.category] ?? "bg-gray-500"
          }`}
        >
          {product.category}
        </span>

        <button
          onClick={() => setLiked(!liked)}
          aria-label="Wishlist"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow"
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
      <div className="p-4">
        <p className="text-xs uppercase text-gray-400 mb-1">
          {product.store}
        </p>

        <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
          {product.title}
        </h3>

        <p className="text-indigo-600 text-xl font-bold mt-2 mb-4">
          ${product.price.toFixed(2)}
        </p>

        {/* Add To Cart */}
        
        <button
          onClick={() => {
            console.log("Adding:", product);
            addToCart({
              id: product.id,
              image: product.image,
              title: product.title,
              category: product.category,
              store: product.store,
              price: product.price,
            });
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Add to Cart
        </button>
        

        {/* Try On */}
        <button
          className="w-full mt-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl transition"
        >
          ✨ Try On
        </button>
      </div>
    </div>
  );
}