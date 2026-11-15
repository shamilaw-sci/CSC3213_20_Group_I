"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { TryOnContextType, TryOnState, TryOnProduct } from "../types/tryon";
import { useAuth } from "@/features/auth/context/AuthContext";
import { takePendingTryOn } from "../utils/pendingTryOn";

export const TryOnContext = createContext<TryOnContextType | undefined>(undefined);

export function TryOnProvider({ children }: { children: ReactNode }) {
  const { user, isGuest, ready } = useAuth();
  const pathname = usePathname();
  const [state, setState] = useState<TryOnState>({
    isOpen: false,
    selectedProduct: null,
  });

  useEffect(() => {
    if (!ready || (!user && !isGuest)) return;
    const timer = window.setTimeout(() => {
      const pending = takePendingTryOn(`${window.location.pathname}${window.location.search}`);
      if (pending) setState({
        isOpen: true,
        selectedProduct: pending.product,
        selectedSize: pending.size,
        resumeAfterTwin: false,
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [ready, user, isGuest, pathname]);

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
