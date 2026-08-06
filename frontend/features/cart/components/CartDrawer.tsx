"use client";

import { X } from "lucide-react";
import { useCart } from "../hooks/useCart";
import CartItem from "./CartItem";
import CartFooter from "./CartFooter";
import EmptyCart from "./EmptyCart";

export default function CartDrawer() {
  const { cart, closeCart, totalItems } = useCart();

  return (
    <>
      {/* Overlay */}
      {cart.isOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-[420px] max-w-full bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          cart.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-xl font-bold">Shopping Cart</h2>

            <p className="text-sm text-gray-500">
              {totalItems} Item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={closeCart}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && <CartFooter />}
      </div>
    </>
  );
}