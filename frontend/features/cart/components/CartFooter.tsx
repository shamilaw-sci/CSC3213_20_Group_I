"use client";

import Link from "next/link";
import { useCart } from "../hooks/useCart";

export default function CartFooter() {
  const { totalPrice, closeCart } = useCart();

  // Fixed delivery charge
  const deliveryFee = 10;

  const grandTotal = totalPrice + deliveryFee;

  return (
    <div className="border-t bg-white p-6">
      {/* Subtotal */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-500">
          Subtotal
        </span>

        <span className="font-semibold">
          ${totalPrice.toFixed(2)}
        </span>
      </div>

      {/* Delivery */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-500">
          Delivery
        </span>

        <span className="font-semibold">
          ${deliveryFee.toFixed(2)}
        </span>
      </div>

      {/* Divider */}
      <hr className="my-4" />

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-bold">
          Total
        </span>

        <span className="text-2xl font-extrabold text-indigo-600">
          ${grandTotal.toFixed(2)}
        </span>
      </div>

      {/* Proceed To Checkout */}
      <Link
        href="/checkout"
        onClick={closeCart}
        className="
          w-full
          py-4
          rounded-2xl
          bg-gradient-to-r
          from-indigo-500
          to-cyan-400
          text-white
          font-bold
          text-lg
          hover:opacity-90
          transition
          flex
          items-center
          justify-center
        "
      >
        Proceed To Checkout
      </Link>
    </div>
  );
}