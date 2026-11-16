import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/server/auth/guest", () => ({ getCurrentGuestSession: vi.fn().mockResolvedValue(null) }));
vi.mock("@/server/auth/session", () => ({ getCurrentSession: vi.fn().mockResolvedValue(null) }));
vi.mock("@/server/images/digital-twin-image", () => ({ processDigitalTwinImage: vi.fn(), DigitalTwinImageError: class extends Error {} }));
vi.mock("@/server/storage/digital-twin-storage", () => ({ readEncryptedTwin: vi.fn() }));
vi.mock("@/server/security/rate-limit", () => ({ enforceRateLimit: vi.fn(() => ({ allowed: true })) }));
vi.mock("@/server/try-on/fashn", () => ({ generateTryOnImage: vi.fn(), FashnTryOnError: class extends Error {} }));

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  sessions: vi.fn(),
  ownedSession: vi.fn(),
  deleteSession: vi.fn(),
  unlinkFeedback: vi.fn(),
  transaction: vi.fn(),
  product: vi.fn(),
  twin: vi.fn(),
  createSession: vi.fn(),
  createResult: vi.fn(),
}));

vi.mock("@/server/auth/authorization", () => ({
  requireAuthenticatedUser: mocks.auth,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    tryonsession: { findMany: mocks.sessions },
    product: { findFirst: mocks.product },
    digitaltwin: { findFirst: mocks.twin },
    $transaction: mocks.transaction,
  },
}));

import { GET, POST } from "../../../app/api/v1/try-ons/route";
import { DELETE } from "../../../app/api/v1/try-ons/[tryOnId]/route";

const tryOnId = "8af5e032-f920-4d3b-b1cc-318026a8e22a";
const productId = "cfcb78c9-fc06-4c19-a006-df905d2e01d7";

describe("Try-On History API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "customer-1" } });
    mocks.transaction.mockImplementation((callback) => callback({
      tryonsession: {
        findFirst: mocks.ownedSession,
        delete: mocks.deleteSession,
        create: mocks.createSession,
      },
      feedback: { updateMany: mocks.unlinkFeedback },
      tryonresult: { create: mocks.createResult },
    }));
  });

  it("requires authentication before listing private history", async () => {
    const denied = new Response("Sign in", { status: 401 });
    mocks.auth.mockResolvedValue({ error: denied });

    expect(await GET()).toBe(denied);
    expect(mocks.sessions).not.toHaveBeenCalled();
  });

  it("returns only the current user's completed saved results", async () => {
    mocks.sessions.mockResolvedValue([{
      tryOnSessionId: tryOnId,
      status: "COMPLETED",
      createdAt: new Date("2026-08-10T10:00:00Z"),
      product: { productId, productName: "Blue dress", primaryImageUrl: "/dress.jpg" },
      productvariant: null,
      requestMetadata: { size: "M" },
      tryonresult: { metadata: { fitPercentage: 85 }, resultImagePath: "virtual://interactive-fit-preview" },
    }]);

    const response = await GET();
    const body = await response.json();

    expect(mocks.sessions).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: "customer-1", status: "COMPLETED", tryonresult: { isNot: null } },
      orderBy: { createdAt: "desc" },
    }));
    expect(body.tryOns).toEqual([expect.objectContaining({
      id: tryOnId,
      product: { id: productId, name: "Blue dress", image: "/dress.jpg" },
      size: "M",
      fitPercentage: 85,
    })]);
    expect(JSON.stringify(body)).not.toContain("resultImagePath");
  });

  it("uses the existing POST to persist a saved illustrative result", async () => {
    mocks.product.mockResolvedValue({ productId });
    mocks.twin.mockResolvedValue(null);
    mocks.createSession.mockImplementation(async ({ data }) => ({
      tryOnSessionId: data.tryOnSessionId,
      status: data.status,
      createdAt: new Date("2026-08-10T10:00:00Z"),
    }));
    mocks.createResult.mockResolvedValue({});

    const response = await POST(new Request("http://localhost/api/v1/try-ons", {
      method: "POST",
      body: JSON.stringify({ productId, size: "M", fitPercentage: 85 }),
    }));

    expect(response.status).toBe(201);
    expect(mocks.createSession).toHaveBeenCalledWith({ data: expect.objectContaining({
      userId: "customer-1",
      productId,
      status: "COMPLETED",
      requestMetadata: { size: "M" },
    }) });
    expect(mocks.createResult).toHaveBeenCalledWith({ data: expect.objectContaining({
      resultImagePath: "virtual://interactive-fit-preview",
      metadata: { fitPercentage: 85, renderer: "interactive-svg" },
    }) });
  });

  it("requires authentication before deleting", async () => {
    const denied = new Response("Sign in", { status: 401 });
    mocks.auth.mockResolvedValue({ error: denied });

    expect(await DELETE(new Request("http://localhost"), { params: Promise.resolve({ tryOnId }) })).toBe(denied);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("cannot delete another user's Try-On", async () => {
    mocks.ownedSession.mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ tryOnId }) });

    expect(response.status).toBe(404);
    expect(mocks.ownedSession).toHaveBeenCalledWith({
      where: { tryOnSessionId: tryOnId, userId: "customer-1" },
      select: { tryOnSessionId: true },
    });
    expect(mocks.deleteSession).not.toHaveBeenCalled();
    expect(mocks.unlinkFeedback).not.toHaveBeenCalled();
  });

  it("deletes only the owned session while preserving linked feedback", async () => {
    mocks.ownedSession.mockResolvedValue({ tryOnSessionId: tryOnId });
    mocks.unlinkFeedback.mockResolvedValue({ count: 1 });
    mocks.deleteSession.mockResolvedValue({ tryOnSessionId: tryOnId });

    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ tryOnId }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: true });
    expect(mocks.unlinkFeedback).toHaveBeenCalledWith({
      where: { tryOnSessionId: tryOnId },
      data: { tryOnSessionId: null },
    });
    expect(mocks.deleteSession).toHaveBeenCalledWith({ where: { tryOnSessionId: tryOnId } });
  });
});
