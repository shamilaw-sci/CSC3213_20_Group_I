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
  ProfileTab,
  Measurements,
  Account,
  ProfileLoadStatus,
} from "../types/profile";
import {
  createEmptyProfile,
  mergeLoadedProfile,
  profileScopeKey,
} from "./profileSessionState";

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
  const userId = ready && user?.role === "CUSTOMER" ? user.id : null;

  // A new user identity receives a fresh state tree before any Profile UI renders.
  return (
    <ScopedProfileProvider key={profileScopeKey(ready, userId)} userId={userId}>
      {children}
    </ScopedProfileProvider>
  );
}

function ScopedProfileProvider({
  children,
  userId,
}: ProfileProviderProps & { userId: string | null }) {
  const [profile, setProfile] = useState(createEmptyProfile);
  const [profileLoadStatus, setProfileLoadStatus] = useState<ProfileLoadStatus>(
    userId ? "loading" : "ready"
  );

  // -----------------------------
  // Change Active Tab
  // -----------------------------

  const changeTab = (tab: ProfileTab) => {
    setProfile((previous) => ({
      ...previous,
      activeTab: tab,
    }));
  };

  // -----------------------------
  // Upload Image
  // -----------------------------

  const uploadImage = (image: string) => {
    setProfile((previous) => ({
      ...previous,
      digitalTwin: {
        image,
      },
    }));
  };

  // -----------------------------
  // Remove Image
  // -----------------------------

  const removeImage = () => {
    setProfile((previous) => ({
      ...previous,
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
    setProfile((previous) => ({
      ...previous,
      measurements: {
        ...previous.measurements,
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
    setProfile((previous) => ({
      ...previous,
      account: {
        ...previous.account,
        ...account,
      },
    }));
  };

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    async function loadProfile() {
      try {
        const [profileResponse, measurementResponse] = await Promise.all([
          fetch("/api/v1/profiles/me", { cache: "no-store", signal: controller.signal }),
          fetch("/api/v1/profiles/measurements", { cache: "no-store", signal: controller.signal }),
        ]);
        if (!profileResponse.ok) throw new Error("Could not load profile.");
        const profileData = await profileResponse.json() as { account: Account };
        const measurementData = measurementResponse.ok
          ? await measurementResponse.json() as { measurements: Partial<Measurements> }
          : null;
        if (controller.signal.aborted) return;
        setProfile((previous) => mergeLoadedProfile(
          previous,
          profileData.account,
          measurementData?.measurements ?? null,
        ));
        setProfileLoadStatus("ready");
      } catch {
        if (!controller.signal.aborted) {
          setProfileLoadStatus("error");
        }
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, [userId]);

  // -----------------------------
  // Save Profile
  // -----------------------------

  const saveMeasurements = async () => {
    const measurements = Object.fromEntries(
      Object.entries(profile.measurements)
        .filter(([key]) => key !== "skinColor")
        .map(([key, value]) => [key, value || null]),
    );
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
        profileLoadStatus,
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
