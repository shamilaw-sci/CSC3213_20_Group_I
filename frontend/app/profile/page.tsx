/** WBS-Shared | Owner: All members | Branch: reviewed integration branch | Scope: Shared application foundation. */
"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/app/components/Navbar";

import DigitalTwinTab from "@/features/profile/components/DigitalTwinTab";
import MeasurementsTab from "@/features/profile/components/MeasurementsTab";
import AccountTab from "@/features/profile/components/AccountTab";
import TryOnModal from "@/features/try-on/components/TryOnModal";

import { useAuth } from "@/features/auth/context/AuthContext";
import { useProfile } from "@/features/profile/hooks/useProfile";
import type { ProfileTab } from "@/features/profile/types/profile";

function ProfileTabFromUrl() {
  const searchParams = useSearchParams();
  const { changeTab } = useProfile();
  const appliedTab = useRef<string | null>(null);
  const requestedTab = searchParams.get("tab");

  useEffect(() => {
    if (
      (requestedTab === "digitalTwin" || requestedTab === "measurements" || requestedTab === "account") &&
      appliedTab.current !== requestedTab
    ) {
      changeTab(requestedTab as ProfileTab);
      appliedTab.current = requestedTab;
    }
  }, [requestedTab, changeTab]);

  return null;
}

export default function ProfilePage() {
  const { user, ready } = useAuth();
  const { profile, profileLoadStatus } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user || profileLoadStatus !== "ready") {
    const message = !ready ? "Checking your session…"
      : !user ? "Redirecting to login…"
      : profileLoadStatus === "error" ? "Could not load your profile. Refresh this page to try again."
      : "Loading your profile…";
    return (
      <div className="tv-page">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-10" role="status">{message}</main>
      </div>
    );
  }

  return (
    <div className="tv-page">

      {/* Navbar */}
      <Navbar />

      {/* Page */}
      <main className="max-w-7xl mx-auto px-6 py-10 lg:pl-80">
        <Suspense fallback={null}>
          <ProfileTabFromUrl />
        </Suspense>

        {/* Content */}
        {profile.activeTab === "digitalTwin" && (
          <DigitalTwinTab />
        )}

        {profile.activeTab === "measurements" && (
          <MeasurementsTab />
        )}

        {profile.activeTab === "account" && (
          <AccountTab />
        )}

      </main>

      <TryOnModal />

    </div>
  );
}
