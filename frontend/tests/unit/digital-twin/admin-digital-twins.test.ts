import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  groupBy: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/server/auth/authorization", () => ({
  requireAuthenticatedUser:
    mocks.requireAuthenticatedUser,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    digitaltwin: {
      findMany: mocks.findMany,
      count: mocks.count,
      groupBy: mocks.groupBy,
    },
    $transaction: mocks.transaction,
  },
}));

import { GET } from "../../../app/api/v1/admin/digital-twins/route";

describe("Admin Digital Twin monitoring API", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.requireAuthenticatedUser.mockResolvedValue({
      user: {
        id: "admin-123",
        role: "ADMIN",
      },
    });

    mocks.findMany.mockReturnValue("find-query");
    mocks.count.mockReturnValue("count-query");
    mocks.groupBy.mockReturnValue("group-query");
  });

  it("requires an administrator", async () => {
    const forbiddenResponse = new Response(
      JSON.stringify({
        message: "Forbidden",
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    mocks.requireAuthenticatedUser.mockResolvedValue({
      error: forbiddenResponse,
    });

    const response = await GET(
      new Request(
        "http://localhost/api/v1/admin/digital-twins",
      ),
    );

    expect(
      mocks.requireAuthenticatedUser,
    ).toHaveBeenCalledWith(["ADMIN"]);
    expect(response).toBe(forbiddenResponse);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects an invalid status filter", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/v1/admin/digital-twins?status=UNKNOWN",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      message:
        "Status must be PROCESSING, READY, FAILED, or DELETED.",
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects invalid pagination", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/v1/admin/digital-twins?page=0&limit=20",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      message:
        "Page and limit must be positive integers.",
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("returns filtered twins, totals and pagination", async () => {
    mocks.transaction.mockResolvedValue([
      [
        {
          digitalTwinId: "twin-123",
          status: "READY",
          processingError: null,
          createdAt: new Date(
            "2026-09-12T08:00:00.000Z",
          ),
          updatedAt: new Date(
            "2026-09-12T08:05:00.000Z",
          ),
          deletedAt: null,
          user: {
            userId: "user-123",
            userName: "Test User",
            userEmail: "test@example.com",
          },
        },
      ],
      21,
      [
        {
          status: "READY",
          _count: { _all: 18 },
        },
        {
          status: "FAILED",
          _count: { _all: 3 },
        },
      ],
    ]);

    const response = await GET(
      new Request(
        "http://localhost/api/v1/admin/digital-twins?status=READY&page=2&limit=10",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(
      mocks.requireAuthenticatedUser,
    ).toHaveBeenCalledWith(["ADMIN"]);

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "READY" },
        skip: 10,
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    );

    expect(mocks.count).toHaveBeenCalledWith({
      where: { status: "READY" },
    });

    expect(mocks.transaction).toHaveBeenCalledWith([
      "find-query",
      "count-query",
      "group-query",
    ]);

    expect(body).toEqual({
      twins: [
        {
          id: "twin-123",
          status: "READY",
          processingError: null,
          createdAt:
            "2026-09-12T08:00:00.000Z",
          updatedAt:
            "2026-09-12T08:05:00.000Z",
          deletedAt: null,
          user: {
            id: "user-123",
            name: "Test User",
            email: "test@example.com",
          },
        },
      ],
      summary: {
        PROCESSING: 0,
        READY: 18,
        FAILED: 3,
        DELETED: 0,
      },
      pagination: {
        page: 2,
        limit: 10,
        total: 21,
        totalPages: 3,
      },
    });

    expect(JSON.stringify(body)).not.toContain(
      "encryptedImagePath",
    );
    expect(JSON.stringify(body)).not.toContain(
      "previewImagePath",
    );
  });
});