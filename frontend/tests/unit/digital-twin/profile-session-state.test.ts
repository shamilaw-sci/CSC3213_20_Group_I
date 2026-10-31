import { describe, expect, it } from "vitest";

import {
  createEmptyProfile,
  mergeLoadedProfile,
  profileScopeKey,
} from "../../../features/profile/context/profileSessionState";

const account = {
  firstName: "Alice",
  lastName: "Example",
  email: "alice@example.com",
  phone: "",
  dateOfBirth: "",
  country: "",
};

describe("Profile state isolation", () => {
  it("uses a different state scope for each account and for sign-out", () => {
    expect(profileScopeKey(false, null)).toBe("checking-session");
    expect(profileScopeKey(true, "alice")).not.toBe(profileScopeKey(true, "bob"));
    expect(profileScopeKey(true, "alice")).not.toBe(profileScopeKey(true, null));
  });

  it("starts the next user with blank account, Twin, and measurement data", () => {
    const alice = mergeLoadedProfile(createEmptyProfile(), account, { chest: 88 });
    const bob = createEmptyProfile();

    expect(alice.account.email).toBe("alice@example.com");
    expect(bob.account.email).toBe("");
    expect(bob.measurements.chest).toBe(0);
    expect(bob.digitalTwin.image).toBeNull();
    expect(bob).not.toBe(alice);
  });

  it("loads saved measurements without sharing a previous account", () => {
    const bob = mergeLoadedProfile(createEmptyProfile(), {
      ...account,
      firstName: "Bob",
      email: "bob@example.com",
    }, { waist: 72 });

    expect(bob.account.email).toBe("bob@example.com");
    expect(bob.measurements.waist).toBe(72);
    expect(bob.measurements.chest).toBe(0);
  });
});
