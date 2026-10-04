/** WBS-2.2 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Profile and measurement client state. */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { useAuth } from "@/features/auth/context/AuthContext";

import type {
  ProfileContextType,
  ProfileState,
  ProfileTab,
  Measurements,
  Account,
} from "../types/profile";

const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({
  children,
}: ProfileProviderProps) {
  const { user, ready } = useAuth();
  const [profile, setProfile] = useState<ProfileState>({
    activeTab: "digitalTwin",

    digitalTwin: {
      image: null,
    },

    measurements: {
      height: 0,
      weight: 0,
      chest: 0,
      waist: 0,
      hips: 0,
      shoulder: 0,
      skinColor: "#dfbeaa",
      gender: "Unisex",
    },

    account: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      country: "",
    },
  });

  // -----------------------------
  // Change Active Tab
  // -----------------------------

  const changeTab = (tab: ProfileTab) => {
    setProfile((prev) => ({
      ...prev,
      activeTab: tab,
    }));
  };

  // -----------------------------
  // Upload Image
  // -----------------------------

  const uploadImage = (image: string) => {
    setProfile((prev) => ({
      ...prev,
      digitalTwin: {
        image,
      },
    }));
  };

  // -----------------------------
  // Remove Image
  // -----------------------------

  const removeImage = () => {
    setProfile((prev) => ({
      ...prev,
      digitalTwin: {
        image: null,
      },
    }));
  };

  // -----------------------------
  // Update Measurements
  // -----------------------------

  const updateMeasurements = (
    measurements: Partial<Measurements>
  ) => {
    setProfile((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        ...measurements,
      },
    }));
  };

  // -----------------------------
  // Update Account
  // -----------------------------

  const updateAccount = (
    account: Partial<Account>
  ) => {
    setProfile((prev) => ({
      ...prev,
      account: {
        ...prev.account,
        ...account,
      },
    }));
  };

  useEffect(() => {
    if (!ready || !user || user.role !== "CUSTOMER") return;

    async function loadProfile() {
      const [profileResponse, measurementResponse] = await Promise.all([
        fetch("/api/v1/profiles/me", { cache: "no-store" }),
        fetch("/api/v1/profiles/measurements", { cache: "no-store" }),
      ]);
      if (!profileResponse.ok) return;
      const profileData = await profileResponse.json() as { account: Account };
      const measurementData = measurementResponse.ok ? await measurementResponse.json() as { measurements: Partial<Measurements> } : null;
      setProfile((previous) => ({
        ...previous,
        account: profileData.account,
        measurements: measurementData ? { ...previous.measurements, ...measurementData.measurements } : previous.measurements,
      }));
    }

    void loadProfile();
  }, [ready, user]);

  // -----------------------------
  // Save Profile
  // -----------------------------

  const saveMeasurements = async () => {
    const measurements = Object.fromEntries(Object.entries(profile.measurements).filter(([key]) => !["skinColor", "gender"].includes(key)).map(([key, value]) => [key, value || null]));
    const measurementResponse = await fetch("/api/v1/profiles/measurements", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(measurements),
    });
    const measurementResult = await measurementResponse.json().catch(() => ({})) as { message?: string };
    if (!measurementResponse.ok) throw new Error(measurementResult.message ?? "Could not save measurements.");
  };

  const saveProfile = async () => {
    const profileResponse = await fetch("/api/v1/profiles/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile.account),
    });
    const profileResult = await profileResponse.json().catch(() => ({})) as { message?: string };
    if (!profileResponse.ok) throw new Error(profileResult.message ?? "Could not save account details.");

    await saveMeasurements();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        changeTab,
        uploadImage,
        removeImage,
        updateMeasurements,
        updateAccount,
        saveProfile,
        saveMeasurements,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfileContext must be used inside ProfileProvider"
    );
  }

  return context;
}
