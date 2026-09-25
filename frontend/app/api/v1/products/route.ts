import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

type DecimalLike = { toString: () => string };
type ProductRow = {
  productId: string;
  productName: string;
  description: string | null;
  price: DecimalLike;
  currency: string;
  primaryImageUrl: string | null;
  merchantUrl: string;
  merchant: { merchantId: string; storeName: string };
  category: { categoryId: string; name: string; slug: string };
  productvariant: {
    productVariantId: string;
    size: string | null;
    color: string | null;
    price: DecimalLike | null;
    stockQuantity: number | null;
  }[];
};

type ProductWhere = {
  status: "ACTIVE";
  OR?: { productName?: { contains: string }; description?: { contains: string } }[];
  category?: { slug: string };
  merchantId?: string;
  price?: { gte?: number; lte?: number };
};

function parsePositiveInt(value: string | null, fallback: number, maximum: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function parsePrice(value: string | null) {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
}

function productDto(product: ProductRow) {
  return {
    id: product.productId,
    name: product.productName,
    description: product.description,
    price: Number(product.price),
    currency: product.currency,
    image: product.primaryImageUrl,
    merchantUrl: product.merchantUrl,
    merchant: { id: product.merchant.merchantId, name: product.merchant.storeName },
    category: {
      id: product.category.categoryId,
      name: product.category.name,
      slug: product.category.slug,
    },
    variants: product.productvariant.map((variant) => ({
      id: variant.productVariantId,
      size: variant.size,
      color: variant.color,
      price: variant.price ? Number(variant.price) : null,
      stock: variant.stockQuantity,
    })),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parsePositiveInt(url.searchParams.get("page"), 1, 10_000);
  const pageSize = parsePositiveInt(url.searchParams.get("pageSize"), 24, 50);
  const query = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category")?.trim();
  const merchant = url.searchParams.get("merchant")?.trim();
  const minPrice = parsePrice(url.searchParams.get("minPrice"));
  const maxPrice = parsePrice(url.searchParams.get("maxPrice"));
  const sort = url.searchParams.get("sort");

  if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
    return NextResponse.json({ message: "Price filters must be positive numbers." }, { status: 400 });
  }

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return NextResponse.json({ message: "Minimum price cannot be greater than maximum price." }, { status: 400 });
  }

  const where: ProductWhere = { status: "ACTIVE" };
  if (query) where.OR = [{ productName: { contains: query } }, { description: { contains: query } }];
  if (category && category !== "all") where.category = { slug: category };
  if (merchant) where.merchantId = merchant;
  if (minPrice !== null || maxPrice !== null) {
    where.price = {
      ...(minPrice !== null ? { gte: minPrice } : {}),
      ...(maxPrice !== null ? { lte: maxPrice } : {}),
    };
  }

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { merchant: true, category: true, productvariant: true },
    }),
  ]);
  return NextResponse.json({ products: products.map(productDto), page, pageSize, total });
}
