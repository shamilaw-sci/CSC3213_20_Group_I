"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

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
      inseam: 0,
    },

    account: {
      firstName: "",
      lastName: "",
      email: "",
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

  // -----------------------------
  // Save Profile
  // -----------------------------

  const saveProfile = () => {
    console.log("Profile Saved", profile);

    // Backend API call later
    // POST /api/profile
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