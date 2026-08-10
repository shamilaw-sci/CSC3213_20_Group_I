"use client";

import React, {
  createContext,
  useContext,
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
    id: number
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
    id: number
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
    id: number
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