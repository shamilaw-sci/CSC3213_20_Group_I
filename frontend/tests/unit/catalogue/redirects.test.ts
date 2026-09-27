import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentGuestSession: vi.fn(),
  getCurrentSession: vi.fn(),
  productFindFirst: vi.fn(),
  merchantRedirectCreate: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/server/auth/guest", () => ({
  getCurrentGuestSession: mocks.getCurrentGuestSession,
}));

vi.mock("@/server/auth/session", () => ({
  getCurrentSession: mocks.getCurrentSession,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    product: {
      findFirst: mocks.productFindFirst,
    },
    merchantredirect: {
      create: mocks.merchantRedirectCreate,
    },
  },
}));

import { POST } from "../../../app/api/v1/redirects/route";

const ACTIVE_PRODUCT = {
  productId: "11111111-1111-4111-8111-111111111111",
  merchantId: "22222222-2222-4222-8222-222222222222",
  merchantUrl: "https://merchant.example.com/products/dress-1",
  merchant: {
    websiteUrl: "https://merchant.example.com",
  },
};

function redirectRequest(body: unknown) {
  return new Request("http://localhost/api/v1/redirects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Merchant redirect tracking API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.productFindFirst.mockResolvedValue(ACTIVE_PRODUCT);
    mocks.merchantRedirectCreate.mockResolvedValue({});
    mocks.getCurrentSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mocks.getCurrentGuestSession.mockResolvedValue({
      guestSessionId: "guest-123",
    });
  });

  it("records an authenticated redirect and returns the merchant URL", async () => {
    const response = await POST(
      redirectRequest({
        productId: ACTIVE_PRODUCT.productId,
        source: "product_detail",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      redirectUrl: ACTIVE_PRODUCT.merchantUrl,
    });
    expect(mocks.productFindFirst).toHaveBeenCalledWith({
      where: { productId: ACTIVE_PRODUCT.productId, status: "ACTIVE" },
      include: { merchant: true },
    });
    expect(mocks.merchantRedirectCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-123",
        guestSessionId: null,
        productId: ACTIVE_PRODUCT.productId,
        merchantId: ACTIVE_PRODUCT.merchantId,
        destinationUrl: ACTIVE_PRODUCT.merchantUrl,
        source: "product_detail",
      }),
    });
  });

  it("falls back to a guest session when no user is signed in", async () => {
    mocks.getCurrentSession.mockResolvedValue(null);

    const response = await POST(
      redirectRequest({
        productId: ACTIVE_PRODUCT.productId,
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.merchantRedirectCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: undefined,
        guestSessionId: "guest-123",
        source: "product_detail",
      }),
    });
  });

  it("rejects missing products and unsafe merchant URLs", async () => {
    mocks.productFindFirst.mockResolvedValueOnce(null);
    const missing = await POST(
      redirectRequest({
        productId: ACTIVE_PRODUCT.productId,
      }),
    );
    expect(missing.status).toBe(404);
    expect(mocks.merchantRedirectCreate).not.toHaveBeenCalled();

    mocks.productFindFirst.mockResolvedValueOnce({
      ...ACTIVE_PRODUCT,
      merchantUrl: "javascript:alert(1)",
    });
    const unsafeProtocol = await POST(
      redirectRequest({
        productId: ACTIVE_PRODUCT.productId,
      }),
    );
    expect(unsafeProtocol.status).toBe(400);

    mocks.productFindFirst.mockResolvedValueOnce({
      ...ACTIVE_PRODUCT,
      merchantUrl: "https://attacker.example.net/products/dress-1",
    });
    const wrongHost = await POST(
      redirectRequest({
        productId: ACTIVE_PRODUCT.productId,
      }),
    );
    expect(wrongHost.status).toBe(400);

    mocks.productFindFirst.mockResolvedValueOnce({
      ...ACTIVE_PRODUCT,
      merchant: { websiteUrl: null },
    });
    const missingMerchantWebsite = await POST(
      redirectRequest({
        productId: ACTIVE_PRODUCT.productId,
      }),
    );
    expect(missingMerchantWebsite.status).toBe(400);
  });

  it("validates the request body before reading products", async () => {
    const response = await POST(redirectRequest({ productId: "not-a-uuid" }));

    expect(response.status).toBe(400);
    expect(mocks.productFindFirst).not.toHaveBeenCalled();
  });
});
