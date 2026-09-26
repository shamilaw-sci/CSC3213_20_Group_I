/** WBS-3.x | Owner: S/21/501 | Branch: feature/s21-501-catalogue-merchants | Scope: Catalogue, merchants, comparison and redirects. */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  CartContextType,
  CartItem,
  CartState,
} from "../types/cart";
import { saveGuestCart } from "@/features/cart/utils/guestCartRestore";

export const CartContext =
  createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({
  children,
}: CartProviderProps) {
  const router = useRouter();

  const [cart, setCart] =
    useState<CartState>({
      items: [],
      isOpen: false,
    });

  useEffect(() => {
    saveGuestCart(cart.items);
  }, [cart.items]);

  useEffect(() => {
    function restoreCart(event: Event) {
      const customEvent = event as CustomEvent<{ items?: CartItem[] }>;
      const items = customEvent.detail?.items ?? [];
      if (!items.length) return;
      setCart((prev) => ({
        ...prev,
        items,
        isOpen: true,
      }));
    }

    window.addEventListener("tryvora:restore-cart", restoreCart);
    return () => window.removeEventListener("tryvora:restore-cart", restoreCart);
  }, []);

  // --------------------------
  // Drawer Controls
  // --------------------------

  const openCart = () => {
    setCart((prev) => ({
      ...prev,
      isOpen: true,
    }));
  };

  const closeCart = () => {
    setCart((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const toggleCart = () => {
    setCart((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  };

  // --------------------------
  // Add Item
  // --------------------------

  const addToCart = (
    item: Omit<CartItem, "quantity">
  ) => {
    setCart((prev) => {
      const existing =
        prev.items.find(
          (p) => p.id === item.id
        );

      if (existing) {
        return {
          ...prev,
          isOpen: true,
          items: prev.items.map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  quantity: p.quantity + 1,
                }
              : p
          ),
        };
      }

      return {
        ...prev,
        isOpen: true,
        items: [
          ...prev.items,
          {
            ...item,
            quantity: 1,
          },
        ],
      };
    });
  };

  // --------------------------
  // Remove Item
  // --------------------------

  const removeFromCart = (
    id: string | number
  ) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter(
        (item) => item.id !== id
      ),
    }));
  };

  // --------------------------
  // Increase Quantity
  // --------------------------

  const increaseQuantity = (
    id: string | number
  ) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      ),
    }));
  };

  // --------------------------
  // Decrease Quantity
  // --------------------------

  const decreaseQuantity = (
    id: string | number
  ) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        ),
    }));
  };

  // --------------------------
  // Clear Cart
  // --------------------------

  const clearCart = () => {
    setCart((prev) => ({
      ...prev,
      items: [],
    }));
  };

  // --------------------------
  // Go To Checkout
  // --------------------------

  const goToCheckout = () => {
    if (cart.items.length === 0) {
      return;
    }

    closeCart();

    router.push("/checkout");
  };

  // --------------------------
  // Totals
  // --------------------------

  const totalItems = useMemo(() => {
    return cart.items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );
  }, [cart.items]);

  const totalPrice = useMemo(() => {
    return cart.items.reduce(
      (sum, item) =>
        sum +
        item.price * item.quantity,
      0
    );
  }, [cart.items]);

  return (
    <CartContext.Provider
      value={{
        cart,

        openCart,
        closeCart,
        toggleCart,

        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        goToCheckout,

        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// --------------------------
// Custom Hook
// --------------------------

export function useCartContext() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCartContext must be used inside CartProvider"
    );
  }

  return context;
}
