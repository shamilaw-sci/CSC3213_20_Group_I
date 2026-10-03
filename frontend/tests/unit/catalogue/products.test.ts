import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  productCount: vi.fn(),
  productFindMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    product: {
      count: mocks.productCount,
      findMany: mocks.productFindMany,
    },
  },
}));

import { GET } from "../../../app/api/v1/products/route";

const PRODUCT = {
  productId: "product-1",
  productName: "Elegant Evening Dress",
  description: "Formal demo dress",
  price: { toString: () => "129.99" },
  currency: "USD",
  primaryImageUrl: "https://cdn.example.test/dress.jpg",
  merchantUrl: "https://merchant.example.test/dress",
  merchant: { merchantId: "merchant-1", storeName: "Fashion Hub" },
  category: { categoryId: "category-1", name: "Dresses", slug: "dresses" },
  productvariant: [
    {
      productVariantId: "variant-1",
      size: "M",
      color: "Black",
      price: null,
      stockQuantity: 8,
    },
  ],
};

function request(search = "") {
  return new Request(`http://localhost/api/v1/products${search}`);
}

describe("Products catalogue API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.productCount.mockResolvedValue(1);
    mocks.productFindMany.mockResolvedValue([PRODUCT]);
  });

  it("applies search, category, merchant, variant, price, sort and pagination filters", async () => {
    const response = await GET(request("?q=dress&category=dresses&merchant=merchant-1&minPrice=100&maxPrice=200&size=M&color=Black&inStock=true&sort=name_asc&page=2&pageSize=12"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.productCount).toHaveBeenCalledWith({
      where: {
        status: "ACTIVE",
        OR: [
          { productName: { contains: "dress" } },
          { description: { contains: "dress" } },
          { merchant: { storeName: { contains: "dress" } } },
        ],
        category: { slug: "dresses" },
        merchantId: "merchant-1",
        price: { gte: 100, lte: 200 },
        productvariant: {
          some: {
            size: { equals: "M" },
            color: { contains: "Black" },
            stockQuantity: { gt: 0 },
          },
        },
      },
    });
    expect(mocks.productFindMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { productName: "asc" },
      skip: 12,
      take: 12,
      include: { merchant: true, category: true, productvariant: true },
    }));
    expect(body.products[0]).toEqual({
      id: "product-1",
      name: "Elegant Evening Dress",
      description: "Formal demo dress",
      price: 129.99,
      currency: "USD",
      image: "https://cdn.example.test/dress.jpg",
      merchantUrl: "https://merchant.example.test/dress",
      merchant: { id: "merchant-1", name: "Fashion Hub" },
      category: { id: "category-1", name: "Dresses", slug: "dresses" },
      variants: [{ id: "variant-1", size: "M", color: "Black", price: null, stock: 8 }],
    });
    expect(body.page).toBe(2);
    expect(body.pageSize).toBe(12);
    expect(body.total).toBe(1);
  });

  it("rejects invalid price filters before querying", async () => {
    const invalidNumber = await GET(request("?minPrice=free"));
    expect(invalidNumber.status).toBe(400);

    const invalidRange = await GET(request("?minPrice=200&maxPrice=100"));
    expect(invalidRange.status).toBe(400);

    expect(mocks.productCount).not.toHaveBeenCalled();
    expect(mocks.productFindMany).not.toHaveBeenCalled();
  });
});
