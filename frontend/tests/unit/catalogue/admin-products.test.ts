import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  productCount: vi.fn(),
  productFindMany: vi.fn(),
  merchantFindMany: vi.fn(),
  categoryFindMany: vi.fn(),
  draftCount: vi.fn(),
  activeCount: vi.fn(),
  outOfStockCount: vi.fn(),
  archivedCount: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/server/auth/authorization", () => ({
  requireAuthenticatedUser: mocks.requireAuthenticatedUser,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    product: {
      count: mocks.productCount,
      findMany: mocks.productFindMany,
    },
    merchant: { findMany: mocks.merchantFindMany },
    category: { findMany: mocks.categoryFindMany },
  },
}));

import { GET } from "../../../app/api/v1/admin/products/route";

const PRODUCT = {
  productId: "product-1",
  productName: "Evening Dress",
  status: "DRAFT",
  price: { toString: () => "120.00" },
  currency: "LKR",
  primaryImageUrl: "https://cdn.example.test/dress.jpg",
  createdAt: new Date("2026-09-01T10:00:00.000Z"),
  updatedAt: new Date("2026-09-02T10:00:00.000Z"),
  merchant: {
    merchantId: "merchant-1",
    storeName: "Colombo Fashion",
    email: "merchant@example.test",
  },
  category: {
    categoryId: "category-1",
    name: "Dresses",
    slug: "dresses",
  },
  _count: {
    productvariant: 3,
    tryonsession: 4,
  },
};

function adminRequest(search = "") {
  return new Request(`http://localhost/api/v1/admin/products${search}`);
}

describe("Admin products API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAuthenticatedUser.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    });
    mocks.productCount.mockResolvedValue(1);
    mocks.productFindMany.mockResolvedValue([PRODUCT]);
    mocks.merchantFindMany.mockResolvedValue([]);
    mocks.categoryFindMany.mockResolvedValue([]);
  });

  it("requires an admin before listing products", async () => {
    const error = Response.json({ message: "Forbidden" }, { status: 403 });
    mocks.requireAuthenticatedUser.mockResolvedValue({ error });

    const response = await GET(adminRequest());

    expect(response.status).toBe(403);
    expect(mocks.productCount).not.toHaveBeenCalled();
    expect(mocks.productFindMany).not.toHaveBeenCalled();
  });

  it("lists products with pagination and summary fields", async () => {
    const response = await GET(adminRequest("?search=dress"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.productCount).toHaveBeenCalledWith({ where: { status: "DRAFT" } });
    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 250,
        orderBy: { updatedAt: "desc" },
        include: {
          merchant: { select: { merchantId: true, storeName: true } },
          category: { select: { name: true } },
          _count: { select: { productvariant: true, tryonsession: true } },
        },
      }),
    );
    expect(body.products[0]).toMatchObject({ id: "product-1", name: "Evening Dress", merchant: "Colombo Fashion", category: "Dresses", variants: 3, tryOns: 4 });
    expect(body.summary).toEqual({ draft: 1, active: 1, outOfStock: 1, archived: 1, total: 4 });
  });

  it("ignores unsupported legacy status filters and returns the current catalogue shape", async () => {
    const response = await GET(adminRequest("?status=PENDING"));

    expect(response.status).toBe(200);
    expect(mocks.productFindMany).toHaveBeenCalled();
  });
});
