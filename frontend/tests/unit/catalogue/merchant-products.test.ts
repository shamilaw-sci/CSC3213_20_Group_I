import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireCurrentMerchant: vi.fn(),
  categoryFindUnique: vi.fn(),
  productCreate: vi.fn(),
  productFindMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/server/modules/products/size-normalization", async () => import("../../../server/modules/products/size-normalization"));

vi.mock("@/server/merchant/current-merchant", () => ({
  requireCurrentMerchant: mocks.requireCurrentMerchant,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    category: { findUnique: mocks.categoryFindUnique },
    product: {
      create: mocks.productCreate,
      findMany: mocks.productFindMany,
    },
  },
}));

import { GET, POST } from "../../../app/api/v1/merchant/products/route";

const merchantAccess = {
  merchant: { merchantId: "merchant-1", status: "ACTIVE" },
};

const fitRangesCm = {
  chest: { min: 89, max: 96 },
  waist: { min: 73, max: 80 },
};

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/v1/merchant/products", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Merchant products API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireCurrentMerchant.mockResolvedValue(merchantAccess);
    mocks.categoryFindUnique.mockResolvedValue({ categoryId: "11111111-1111-4111-8111-111111111111" });
    mocks.productCreate.mockResolvedValue({
      productId: "product-1",
      status: "DRAFT",
      productvariant: [{ productVariantId: "variant-1", metadata: { fitRangesCm } }],
    });
    mocks.productFindMany.mockResolvedValue([
      {
        productId: "product-1",
        productName: "Demo Dress",
        description: null,
        status: "DRAFT",
        price: { toString: () => "120" },
        currency: "USD",
        primaryImageUrl: "https://cdn.example.test/dress.jpg",
        merchantUrl: "https://merchant.example.test/dress",
        categoryId: "11111111-1111-4111-8111-111111111111",
        category: { name: "Dresses" },
        productvariant: [{ productVariantId: "variant-1", sku: "demo-m", size: "M", color: null, price: null, stockQuantity: 4, metadata: { fitRangesCm } }],
      },
    ]);
  });

  it("requires an active merchant", async () => {
    const error = Response.json({ message: "Not approved" }, { status: 403 });
    mocks.requireCurrentMerchant.mockResolvedValue({ error });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(mocks.productFindMany).not.toHaveBeenCalled();
    expect(mocks.requireCurrentMerchant).toHaveBeenCalledWith({ allowedStatuses: ["ACTIVE"] });
  });

  it("returns saved fit ranges with merchant products", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.products[0].variants[0].fitRangesCm).toEqual(fitRangesCm);
  });

  it("validates and saves variant fit ranges during product creation", async () => {
    const response = await POST(jsonRequest({
      categoryId: "11111111-1111-4111-8111-111111111111",
      productName: "Demo Dress",
      price: 120,
      currency: "USD",
      merchantUrl: "https://merchant.example.test/dress",
      variants: [{ sku: "demo-m", size: "M", stockQuantity: 4, fitRangesCm }],
    }));

    expect(response.status).toBe(201);
    expect(mocks.productCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        merchantId: "merchant-1",
        productvariant: {
          create: [expect.objectContaining({
            sku: "demo-m",
            metadata: { fitRangesCm },
          })],
        },
      }),
    }));
  });

  it("rejects invalid fit ranges", async () => {
    const response = await POST(jsonRequest({
      categoryId: "11111111-1111-4111-8111-111111111111",
      productName: "Demo Dress",
      price: 120,
      merchantUrl: "https://merchant.example.test/dress",
      variants: [{ sku: "demo-m", size: "M", fitRangesCm: { chest: { min: 96, max: 89 } } }],
    }));

    expect(response.status).toBe(400);
    expect(mocks.productCreate).not.toHaveBeenCalled();
  });
});

