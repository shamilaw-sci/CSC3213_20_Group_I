"use client";

import { type ReactNode } from "react";

import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ProfileProvider } from "@/features/profile/context/ProfileContext";
import { TryOnProvider } from "@/features/try-on/context/TryOnContext";
import TryOnModal from "@/features/try-on/components/TryOnModal";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <TryOnProvider>
          {children}
          <TryOnModal />
        </TryOnProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
