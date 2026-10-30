/** WBS-Shared | Owner: All members | Branch: reviewed integration branch | Scope: Shared application foundation. */
"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/app/components/Navbar";

import DigitalTwinTab from "@/features/profile/components/DigitalTwinTab";
import MeasurementsTab from "@/features/profile/components/MeasurementsTab";
import AccountTab from "@/features/profile/components/AccountTab";

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
  const { profile } = useProfile();

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

    </div>
  );
}
