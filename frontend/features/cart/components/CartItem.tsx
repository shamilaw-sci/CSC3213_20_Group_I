"use client";

import { Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "../types/cart";
import { useCart } from "../hooks/useCart";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  return (
    <div className="flex gap-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">

      {/* Product Image */}
      <img
        src={item.image}
        alt={item.title}
        className="w-24 h-28 object-cover rounded-xl"
      />

      {/* Product Details */}
      <div className="flex flex-col flex-1">

        <span className="text-xs uppercase text-gray-400 font-semibold">
          {item.store}
        </span>

        <h3 className="text-lg font-bold text-gray-800">
          {item.title}
        </h3>

        <span className="text-sm text-gray-500">
          {item.category}
        </span>

        <p className="text-xl font-bold text-indigo-600 mt-2">
          ${item.price.toFixed(2)}
        </p>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between mt-4">

          {/* Quantity */}
          <div className="flex items-center border rounded-xl overflow-hidden">

            <button
              onClick={() => decreaseQuantity(item.id)}
              className="px-3 py-2 hover:bg-gray-100"
            >
              −
            </button>

            <span className="px-4 font-semibold">
              {item.quantity}
            </span>

            <button
              onClick={() => increaseQuantity(item.id)}
              className="px-3 py-2 hover:bg-gray-100"
            >
              +
            </button>

          </div>

          {/* Delete */}
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={20} />
          </button>

        </div>

      </div>

    </div>
  );
}