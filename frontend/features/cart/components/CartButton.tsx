"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "../hooks/useCart";

export default function CartButton() {
  const { totalItems, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100 transition"
    >
      <ShoppingCart className="w-6 h-6 text-gray-700" />

      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-1">
          {totalItems}
        </span>
      )}
    </button>
  );
}