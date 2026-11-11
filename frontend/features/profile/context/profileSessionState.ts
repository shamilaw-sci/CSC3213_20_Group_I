import type { Account, Measurements, ProfileState } from "../types/profile";

export function createEmptyProfile(): ProfileState {
  return {
    activeTab: "digitalTwin",
    digitalTwin: { image: null },
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
  };
}

export function profileScopeKey(ready: boolean, userId: string | null): string {
  if (!ready) return "checking-session";
  return userId ? `user:${userId}` : "signed-out";
}

export function mergeLoadedProfile(
  profile: ProfileState,
  account: Account,
  measurements: Partial<Measurements> | null,
): ProfileState {
  return {
    ...profile,
    account,
    measurements: measurements
      ? { ...profile.measurements, ...measurements }
      : profile.measurements,
  };
}
