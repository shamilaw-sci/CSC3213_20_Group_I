import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

function productDto(product: any) { return { id: product.productId, name: product.productName, description: product.description, price: Number(product.price), currency: product.currency, image: product.primaryImageUrl, merchantUrl: product.merchantUrl, merchant: { id: product.merchant.merchantId, name: product.merchant.storeName }, category: { id: product.category.categoryId, name: product.category.name, slug: product.category.slug }, variants: product.productvariant.map((variant: any) => ({ id: variant.productVariantId, size: variant.size, color: variant.color, price: variant.price ? Number(variant.price) : null, stock: variant.stockQuantity })) }; }

export async function GET(request: Request) {
  const url = new URL(request.url); const page = Math.max(1, Number(url.searchParams.get("page") ?? 1)); const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 24))); const query = url.searchParams.get("q")?.trim(); const category = url.searchParams.get("category"); const merchant = url.searchParams.get("merchant"); const minPrice = Number(url.searchParams.get("minPrice")); const maxPrice = Number(url.searchParams.get("maxPrice")); const sort = url.searchParams.get("sort");
  const where: any = { status: "ACTIVE", ...(query ? { OR: [{ productName: { contains: query } }, { description: { contains: query } }] } : {}), ...(category ? { category: { slug: category } } : {}), ...(merchant ? { merchantId: merchant } : {}), ...((Number.isFinite(minPrice) || Number.isFinite(maxPrice)) ? { price: { ...(Number.isFinite(minPrice) ? { gte: minPrice } : {}), ...(Number.isFinite(maxPrice) ? { lte: maxPrice } : {}) } } : {}) };
  const orderBy: any = sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };
  const [total, products] = await Promise.all([prisma.product.count({ where }), prisma.product.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize, include: { merchant: true, category: true, productvariant: true } })]);
  return NextResponse.json({ products: products.map(productDto), page, pageSize, total });
}
