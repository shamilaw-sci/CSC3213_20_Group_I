"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "../hooks/useCart";

export default function EmptyCart() {
  const { closeCart } = useCart();

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">

      {/* Icon */}
      <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
        <ShoppingBag
          size={52}
          className="text-indigo-600"
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        Your Cart is Empty
      </h2>

      {/* Description */}
      <p className="text-gray-500 mb-8 max-w-xs">
        Looks like you haven't added any fashion items yet.
        Start exploring and build your perfect wardrobe.
      </p>

      {/* Button */}
      <button
        onClick={closeCart}
        className="w-full max-w-xs rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 py-4 text-white font-semibold shadow-lg hover:opacity-90 transition"
      >
        Continue Shopping
      </button>

    </div>
  );
}
