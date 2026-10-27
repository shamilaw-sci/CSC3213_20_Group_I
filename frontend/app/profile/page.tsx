/** WBS-Shared | Owner: All members | Branch: reviewed integration branch | Scope: Shared application foundation. */
"use client";

import Navbar from "@/app/components/Navbar";

import ProfileTabs from "@/features/profile/components/profileTabs";
import DigitalTwinTab from "@/features/profile/components/DigitalTwinTab";
import MeasurementsTab from "@/features/profile/components/MeasurementsTab";
import AccountTab from "@/features/profile/components/AccountTab";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/context/AuthContext";
import { useProfile } from "@/features/profile/hooks/useProfile";

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
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Profile & Settings
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your Digital Twin, measurements and account settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <ProfileTabs />
        </div>

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
