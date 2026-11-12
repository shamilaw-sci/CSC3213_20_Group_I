import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export async function GET(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;

  const search = new URL(request.url).searchParams.get("search")?.trim().slice(0, 100) ?? "";

  const [products, merchants, categories, draft, active, outOfStock, archived] = await Promise.all([
    prisma.product.findMany({ where: search ? { OR: [{ productName: { contains: search } }, { description: { contains: search } }, { category: { name: { contains: search } } }, { merchant: { storeName: { contains: search } } }] } : {}, orderBy: { updatedAt: "desc" }, take: 250, include: { merchant: { select: { merchantId: true, storeName: true } }, category: { select: { name: true } }, _count: { select: { productvariant: true, tryonsession: true } } } }),
    prisma.merchant.findMany({ orderBy: { storeName: "asc" }, select: { merchantId: true, storeName: true, status: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "OUT_OF_STOCK" } }),
    prisma.product.count({ where: { status: "ARCHIVED" } }),
  ]);

  return NextResponse.json({
    summary: { draft, active, outOfStock, archived, total: draft + active + outOfStock + archived },
    products: products.map((product) => ({ id: product.productId, merchantId: product.merchantId, merchant: product.merchant.storeName, category: product.category.name, name: product.productName, description: product.description, price: Number(product.price), currency: product.currency, imageUrl: product.primaryImageUrl, merchantUrl: product.merchantUrl, status: product.status, variants: product._count.productvariant, tryOns: product._count.tryonsession, updatedAt: product.updatedAt })),
    merchants: merchants.map((merchant) => ({ id: merchant.merchantId, name: merchant.storeName, status: merchant.status })),
    categories: categories.map((category) => category.name),
  });
}
