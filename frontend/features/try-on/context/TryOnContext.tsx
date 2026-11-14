"use client";

import { createContext, ReactNode, useEffect, useState } from "react";

import { TryOnContextType, TryOnState, TryOnProduct } from "../types/tryon";
import { useAuth } from "@/features/auth/context/AuthContext";
import { takePendingTryOn } from "../utils/pendingTryOn";

export const TryOnContext = createContext<TryOnContextType | undefined>(undefined);

export function TryOnProvider({ children }: { children: ReactNode }) {
  const { user, isGuest, ready } = useAuth();
  const [state, setState] = useState<TryOnState>({
    isOpen: false,
    selectedProduct: null,
  });

  useEffect(() => {
    if (!ready || (!user && !isGuest)) return;
    const timer = window.setTimeout(() => {
      const pending = takePendingTryOn();
      if (pending) setState({
        isOpen: !user && isGuest,
        selectedProduct: pending.product,
        selectedSize: pending.size,
        resumeAfterTwin: Boolean(user),
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [ready, user, isGuest]);

  const openTryOn = (product: TryOnProduct) => {
    setState((previous) => ({
      isOpen: true,
      selectedProduct: product,
      selectedSize: previous.selectedProduct?.id === product.id ? previous.selectedSize : null,
      resumeAfterTwin: false,
    }));
  };

  const selectProduct = (product: TryOnProduct) => {
    setState({ isOpen: false, selectedProduct: product, selectedSize: null, resumeAfterTwin: false });
  };

  const setSelectedSize = (size: string) => {
    setState((previous) => ({ ...previous, selectedSize: size }));
  };

  const goToTwinSetup = () => {
    setState((previous) => ({ ...previous, isOpen: false, resumeAfterTwin: true }));
  };

  const closeTryOn = () => {
    setState((previous) => ({ ...previous, isOpen: false, resumeAfterTwin: false }));
  };

  return (
    <TryOnContext.Provider value={{ state, openTryOn, selectProduct, setSelectedSize, goToTwinSetup, closeTryOn }}>
      {children}
    </TryOnContext.Provider>
  );
}
