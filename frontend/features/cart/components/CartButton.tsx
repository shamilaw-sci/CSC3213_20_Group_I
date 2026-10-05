"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "../hooks/useCart";

export default function CartButton() {
  const { totalItems, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-indigo-600 bg-indigo-600 text-white shadow-md transition hover:border-indigo-700 hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <ShoppingCart className="h-6 w-6" />

      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-1">
          {totalItems}
        </span>
      )}
    </button>
  );
}
