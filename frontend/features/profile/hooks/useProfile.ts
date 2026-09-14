/** WBS-2.x | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Scope: Profile, Digital Twin, storage and privacy. */
"use client";

import { useProfileContext } from "../context/ProfileContext";

export function useProfile() {
  return useProfileContext();
}
