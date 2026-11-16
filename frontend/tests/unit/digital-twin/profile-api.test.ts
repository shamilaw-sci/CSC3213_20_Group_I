import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentSession: vi.fn(),
  toPublicUser: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  sessionUpdateMany: vi.fn(),
  twinFindMany: vi.fn(),
  twinUpdateMany: vi.fn(),
  transaction: vi.fn(),
  transactionUserUpdate: vi.fn(),
  transactionProfileUpsert: vi.fn(),
  removeEncryptedTwin: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/server/auth/session", () => ({
  getCurrentSession: mocks.getCurrentSession,
  toPublicUser: mocks.toPublicUser,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
      update: mocks.userUpdate,
    },
    session: {
      updateMany: mocks.sessionUpdateMany,
    },
    digitaltwin: {
      findMany: mocks.twinFindMany,
      updateMany: mocks.twinUpdateMany,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/server/storage/digital-twin-storage", () => ({
  removeEncryptedTwin: mocks.removeEncryptedTwin,
}));

import {
  DELETE,
  GET,
  PATCH,
} from "../../../app/api/v1/profiles/me/route";

const EXISTING_USER = {
  userId: "user-123",
  userName: "Hana Rafai",
  userEmail: "hana@example.com",
  role: "CUSTOMER" as const,
  profile: {
    phone: "0771234567",
    country: "Sri Lanka",
    dateOfBirth: new Date("2001-05-10T00:00:00.000Z"),
  },
};

function patchRequest(body: unknown) {
  return new Request("http://localhost/api/v1/profiles/me", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Profile API", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.getCurrentSession.mockResolvedValue({
      session: { userId: "user-123" },
    });
    mocks.toPublicUser.mockImplementation(
      (user: typeof EXISTING_USER) => ({
        id: user.userId,
        name: user.userName,
        email: user.userEmail,
        role: user.role,
      }),
    );
    mocks.userFindUnique.mockResolvedValue(EXISTING_USER);
    mocks.transactionUserUpdate.mockResolvedValue({
      ...EXISTING_USER,
      userName: "Hana Perera",
      userEmail: "hana.perera@example.com",
    });
    mocks.transactionProfileUpsert.mockResolvedValue({
      phone: "0712345678",
      country: "Sri Lanka",
      dateOfBirth: new Date("2001-05-10T00:00:00.000Z"),
    });
    mocks.userUpdate.mockResolvedValue({});
    mocks.sessionUpdateMany.mockResolvedValue({ count: 1 });
    mocks.twinFindMany.mockResolvedValue([]);
    mocks.twinUpdateMany.mockResolvedValue({ count: 0 });
    mocks.removeEncryptedTwin.mockResolvedValue(undefined);
    mocks.transaction.mockImplementation(
      async (operation: unknown) => {
        if (Array.isArray(operation)) {
          return Promise.all(operation);
        }

        return (
          operation as (client: {
            user: { update: typeof mocks.transactionUserUpdate };
            profile: { upsert: typeof mocks.transactionProfileUpsert };
          }) => unknown
        )({
          user: { update: mocks.transactionUserUpdate },
          profile: { upsert: mocks.transactionProfileUpsert },
        });
      },
    );
  });

  it("requires authentication before returning a profile", async () => {
    mocks.getCurrentSession.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Authentication is required.",
    });
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
  });

  it("returns the authenticated user's formatted profile", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.userFindUnique).toHaveBeenCalledWith({
      where: { userId: "user-123" },
      select: {
        userId: true,
        userName: true,
        userEmail: true,
        role: true,
        profile: {
          select: {
            phone: true,
            country: true,
            dateOfBirth: true,
          },
        },
      },
    });
    expect(body).toEqual({
      user: {
        id: "user-123",
        name: "Hana Rafai",
        email: "hana@example.com",
        role: "CUSTOMER",
      },
      account: {
        firstName: "Hana",
        lastName: "Rafai",
        email: "hana@example.com",
        phone: "0771234567",
        country: "Sri Lanka",
        dateOfBirth: "2001-05-10",
      },
    });
  });

  it("rejects invalid profile updates", async () => {
    const response = await PATCH(
      patchRequest({ email: "not-an-email" }),
    );

    expect(response.status).toBe(400);
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("updates user and profile data in one transaction", async () => {
    const response = await PATCH(
      patchRequest({
        firstName: "Hana",
        lastName: "Perera",
        email: "HANA.PERERA@EXAMPLE.COM",
        phone: "0712345678",
        country: "Sri Lanka",
        dateOfBirth: "2001-05-10",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.transactionUserUpdate).toHaveBeenCalledWith({
      where: { userId: "user-123" },
      data: expect.objectContaining({
        userName: "Hana Perera",
        userEmail: "hana.perera@example.com",
      }),
    });
    expect(mocks.transactionProfileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-123" },
        update: expect.objectContaining({
          phone: "0712345678",
          country: "Sri Lanka",
          dateOfBirth: new Date("2001-05-10T00:00:00.000Z"),
        }),
      }),
    );
    expect(body.account).toMatchObject({
      firstName: "Hana",
      lastName: "Perera",
      email: "hana.perera@example.com",
      phone: "0712345678",
    });
  });

  it("returns a conflict when the email is already used", async () => {
    mocks.transaction.mockRejectedValue({ code: "P2002" });

    const response = await PATCH(
      patchRequest({ email: "used@example.com" }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      message: "That email address is already in use.",
    });
  });

  it("soft-deletes the account, revokes sessions and removes twin files", async () => {
    mocks.twinFindMany.mockResolvedValue([
      { encryptedImagePath: "private/twin-1.bin" },
      { encryptedImagePath: "private/twin-2.bin" },
    ]);

    const response = await DELETE();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, cleanupPending: false });
    expect(mocks.userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-123" },
        data: expect.objectContaining({ status: "DELETED" }),
      }),
    );
    expect(mocks.sessionUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-123", revokedAt: null },
      }),
    );
    expect(mocks.twinUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-123", deletedAt: null },
        data: expect.objectContaining({ status: "DELETED" }),
      }),
    );
    expect(mocks.removeEncryptedTwin).toHaveBeenCalledTimes(2);
    expect(response.headers.get("set-cookie")).toContain(
      "tryvora_session=",
    );
  });

  it("reports pending cleanup when a twin file cannot be removed", async () => {
    mocks.twinFindMany.mockResolvedValue([
      { encryptedImagePath: "private/twin-1.bin" },
    ]);
    mocks.removeEncryptedTwin.mockRejectedValue(
      new Error("Temporary file-system failure"),
    );

    const response = await DELETE();

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      success: true,
      cleanupPending: true,
    });
  });
});
