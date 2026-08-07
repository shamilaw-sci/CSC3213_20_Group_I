"use client";

import Navbar from "@/app/components/Navbar";

import ProfileTabs from "@/features/profile/components/profileTabs";
import DigitalTwinTab from "@/features/profile/components/DigitalTwinTab";
import MeasurementsTab from "@/features/profile/components/MeasurementsTab";
import AccountTab from "@/features/profile/components/AccountTab";

import { useProfile } from "@/features/profile/hooks/useProfile";

export default function ProfilePage() {
  const { profile } = useProfile();

  return (
    <div className="min-h-screen bg-gray-50">

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