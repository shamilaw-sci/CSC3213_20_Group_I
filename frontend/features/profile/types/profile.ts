// =========================
// Profile Tabs
// =========================

export type ProfileTab =
  | "digitalTwin"
  | "measurements"
  | "account";

// =========================
// Digital Twin
// =========================

export interface DigitalTwin {
  image: string | null;
}

// =========================
// User Measurements
// =========================

export interface Measurements {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  inseam: number;
}

// =========================
// Account Information
// =========================

export interface Account {
  firstName: string;
  lastName: string;
  email: string;
}

// =========================
// Complete Profile State
// =========================

export interface ProfileState {
  activeTab: ProfileTab;

  digitalTwin: DigitalTwin;

  measurements: Measurements;

  account: Account;
}

// =========================
// Context Interface
// =========================

export interface ProfileContextType {
  profile: ProfileState;

  changeTab: (tab: ProfileTab) => void;

  uploadImage: (image: string) => void;

  removeImage: () => void;

  updateMeasurements: (
    measurements: Partial<Measurements>
  ) => void;

  updateAccount: (
    account: Partial<Account>
  ) => void;

  saveProfile: () => void;
}