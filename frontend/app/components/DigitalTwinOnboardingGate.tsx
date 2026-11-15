"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/features/auth/context/AuthContext";
import { useProfile } from "@/features/profile/hooks/useProfile";

export default function DigitalTwinOnboardingGate({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const { profile, profileLoadStatus } = useProfile();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isTwinSetupRoute = pathname === "/profile" && searchParams.get("tab") === "digitalTwin";

  const isCustomer = ready && user?.role === "CUSTOMER";
  const needsPhoto = isCustomer && profileLoadStatus === "ready" && !profile.digitalTwin.image;

  useEffect(() => {
    if (needsPhoto && !isTwinSetupRoute) {
      router.replace("/profile?tab=digitalTwin");
    }
  }, [needsPhoto, isTwinSetupRoute, router]);

  if (!isCustomer) return children;

  if (profileLoadStatus === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Could not check your Digital Twin</h1>
          <p className="mt-2 text-sm text-slate-600">Reload to continue. Your Digital Twin photo is required before using the app.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">Reload</button>
        </div>
      </main>
    );
  }

  if (profileLoadStatus !== "ready" || (needsPhoto && !isTwinSetupRoute)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center" role="status">
        <p className="text-sm font-medium text-slate-700">{profileLoadStatus === "ready" ? "Opening Digital Twin setup…" : "Checking your Digital Twin…"}</p>
      </main>
    );
  }

  return children;
}
