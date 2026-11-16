import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentSession: vi.fn(),
  profileFindUnique: vi.fn(),
  profileUpdate: vi.fn(),
  measurementUpsert: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/server/auth/session", () => ({
  getCurrentSession: mocks.getCurrentSession,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    profile: {
      findUnique: mocks.profileFindUnique,
      update: mocks.profileUpdate,
    },
    measurement: {
      upsert: mocks.measurementUpsert,
    },
    $transaction: mocks.transaction,
  },
}));

import {
  GET,
  PUT,
} from "../../../app/api/v1/profiles/measurements/route";

const VALID_MEASUREMENTS = {
  height: 165,
  weight: 58,
  chest: 86,
  waist: 68,
  hips: 92,
  shoulder: 39,
};

const STORED_MEASUREMENT = {
  heightCm: 165,
  weightKg: 58,
  chestCm: 86,
  waistCm: 68,
  hipsCm: 92,
  shoulderCm: 39,
};

function putRequest(body: unknown) {
  return new Request(
    "http://localhost/api/v1/profiles/measurements",
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("Measurement API", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.getCurrentSession.mockResolvedValue({
      session: { userId: "user-123" },
    });
    mocks.profileFindUnique.mockResolvedValue({
      profileId: "profile-123",
      userId: "user-123",
      gender: "Female",
      measurement: STORED_MEASUREMENT,
    });
    mocks.measurementUpsert.mockResolvedValue(STORED_MEASUREMENT);
    mocks.profileUpdate.mockResolvedValue({});
    mocks.transaction.mockImplementation(
      (operations: Promise<unknown>[]) => Promise.all(operations),
    );
  });

  it("requires authentication before returning measurements", async () => {
    mocks.getCurrentSession.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Authentication is required.",
    });
    expect(mocks.profileFindUnique).not.toHaveBeenCalled();
  });

  it("requires authentication before saving measurements", async () => {
    mocks.getCurrentSession.mockResolvedValue(null);

    const response = await PUT(
      putRequest(VALID_MEASUREMENTS),
    );

    expect(response.status).toBe(401);
    expect(mocks.measurementUpsert).not.toHaveBeenCalled();
  });

  it("returns a missing-profile response", async () => {
    mocks.profileFindUnique.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "Profile not found.",
    });
  });

  it("returns stored measurements and gender", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.profileFindUnique).toHaveBeenCalledWith({
      where: { userId: "user-123" },
      select: {
        gender: true,
        measurement: true,
      },
    });
    expect(body).toEqual({
      measurements: {
        ...VALID_MEASUREMENTS,
        gender: "Female",
      },
    });
  });

  it("uses zero values and Unisex when no measurements exist", async () => {
    mocks.profileFindUnique.mockResolvedValue({
      profileId: "profile-123",
      userId: "user-123",
      gender: null,
      measurement: null,
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      measurements: {
        height: 0,
        weight: 0,
        chest: 0,
        waist: 0,
        hips: 0,
        shoulder: 0,
        gender: "Unisex",
      },
    });
  });

  it("rejects negative and excessively large values", async () => {
    const negativeResponse = await PUT(
      putRequest({
        ...VALID_MEASUREMENTS,
        waist: -1,
      }),
    );
    const largeResponse = await PUT(
      putRequest({
        ...VALID_MEASUREMENTS,
        height: 301,
      }),
    );

    expect(negativeResponse.status).toBe(400);
    expect(largeResponse.status).toBe(400);
    expect(mocks.profileFindUnique).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("saves measurements and gender together", async () => {
    const response = await PUT(
      putRequest({
        ...VALID_MEASUREMENTS,
        gender: "Male",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.measurementUpsert).toHaveBeenCalledWith({
      where: { profileId: "profile-123" },
      create: expect.objectContaining({
        profileId: "profile-123",
        heightCm: 165,
        weightKg: 58,
        chestCm: 86,
        waistCm: 68,
        hipsCm: 92,
        shoulderCm: 39,
      }),
      update: expect.objectContaining({
        heightCm: 165,
        weightKg: 58,
        chestCm: 86,
        waistCm: 68,
        hipsCm: 92,
        shoulderCm: 39,
      }),
    });
    expect(mocks.profileUpdate).toHaveBeenCalledWith({
      where: { profileId: "profile-123" },
      data: expect.objectContaining({ gender: "Male" }),
      select: { profileId: true, gender: true },
    });
    expect(body).toEqual({
      measurements: {
        ...VALID_MEASUREMENTS,
        gender: "Male",
      },
    });
  });

  it("preserves the existing gender when it is omitted", async () => {
    const response = await PUT(
      putRequest(VALID_MEASUREMENTS),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.profileUpdate).toHaveBeenCalledWith({
      where: { profileId: "profile-123" },
      data: expect.not.objectContaining({ gender: expect.anything() }),
      select: { profileId: true, gender: true },
    });
    expect(body.measurements.gender).toBe("Female");
  });

  it("does not store or return the removed inseam field", async () => {
    const response = await PUT(
      putRequest({
        ...VALID_MEASUREMENTS,
        gender: "Female",
        inseam: 75,
      }),
    );
    const body = await response.json();
    const upsertInput = mocks.measurementUpsert.mock.calls[0][0];

    expect(response.status).toBe(200);
    expect(upsertInput.create).not.toHaveProperty("inseamCm");
    expect(upsertInput.update).not.toHaveProperty("inseamCm");
    expect(body.measurements).not.toHaveProperty("inseam");
  });
});
