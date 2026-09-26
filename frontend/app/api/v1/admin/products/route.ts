import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
type ProductRow = {
  productId: string;
  productName: string;
  status: ProductStatus;
  price: { toString: () => string };
  currency: string;
  primaryImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  merchant: { merchantId: string; storeName: string; email: string };
  category: { categoryId: string; name: string; slug: string };
  _count: { productvariant: number };
};

function parsePositiveInt(value: string | null, fallback: number, maximum: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function productDto(product: ProductRow) {
  return {
    id: product.productId,
    name: product.productName,
    status: product.status,
    price: Number(product.price),
    currency: product.currency,
    image: product.primaryImageUrl,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    merchant: {
      id: product.merchant.merchantId,
      name: product.merchant.storeName,
      email: product.merchant.email,
    },
    category: {
      id: product.category.categoryId,
      name: product.category.name,
      slug: product.category.slug,
    },
    variantCount: product._count.productvariant,
  };
}

export async function GET(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;

  const url = new URL(request.url);
  const page = parsePositiveInt(url.searchParams.get("page"), 1, 10_000);
  const pageSize = parsePositiveInt(url.searchParams.get("pageSize"), 25, 100);
  const status = url.searchParams.get("status") as ProductStatus | null;
  const query = url.searchParams.get("q")?.trim();

  if (status && !["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"].includes(status)) {
    return NextResponse.json({ message: "Invalid product status." }, { status: 400 });
  }

  const where = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { productName: { contains: query } },
            { merchant: { storeName: { contains: query } } },
            { category: { name: { contains: query } } },
          ],
        }
      : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        merchant: true,
        category: true,
        _count: { select: { productvariant: true } },
      },
    }),
  ]);

  return NextResponse.json({
    products: products.map(productDto),
    page,
    pageSize,
    total,
  });
}
