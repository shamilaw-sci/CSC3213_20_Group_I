"use client";

import { Suspense, type ReactNode } from "react";

import { AuthProvider } from "@/features/auth/context/AuthContext";
import { CartProvider } from "@/features/cart/context/CartContext";
import CartDrawer from "@/features/cart/components/CartDrawer";
import { ProfileProvider } from "@/features/profile/context/ProfileContext";
import { TryOnProvider } from "@/features/try-on/context/TryOnContext";
import TryOnModal from "@/features/try-on/components/TryOnModal";
import DigitalTwinOnboardingGate from "@/app/components/DigitalTwinOnboardingGate";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <CartProvider>
          <TryOnProvider>
            <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm font-medium text-slate-700" role="status">Checking your Digital Twin…</main>}>
              <DigitalTwinOnboardingGate>{children}</DigitalTwinOnboardingGate>
            </Suspense>
            <CartDrawer />
            <TryOnModal />
          </TryOnProvider>
        </CartProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
