import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  productCount: vi.fn(),
  productFindMany: vi.fn(),
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
    const response = await GET(adminRequest("?page=2&pageSize=10&status=DRAFT&q=dress"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.productCount).toHaveBeenCalledWith({
      where: expect.objectContaining({
        status: "DRAFT",
        OR: expect.any(Array),
      }),
    });
    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        orderBy: { updatedAt: "desc" },
        include: {
          merchant: true,
          category: true,
          _count: { select: { productvariant: true } },
        },
      }),
    );
    expect(body).toEqual({
      products: [
        {
          id: "product-1",
          name: "Evening Dress",
          status: "DRAFT",
          price: 120,
          currency: "LKR",
          image: "https://cdn.example.test/dress.jpg",
          createdAt: "2026-09-01T10:00:00.000Z",
          updatedAt: "2026-09-02T10:00:00.000Z",
          merchant: {
            id: "merchant-1",
            name: "Colombo Fashion",
            email: "merchant@example.test",
          },
          category: {
            id: "category-1",
            name: "Dresses",
            slug: "dresses",
          },
          variantCount: 3,
        },
      ],
      page: 2,
      pageSize: 10,
      total: 1,
    });
  });

  it("rejects invalid status filters", async () => {
    const response = await GET(adminRequest("?status=PENDING"));

    expect(response.status).toBe(400);
    expect(mocks.productCount).not.toHaveBeenCalled();
    expect(mocks.productFindMany).not.toHaveBeenCalled();
  });
});
