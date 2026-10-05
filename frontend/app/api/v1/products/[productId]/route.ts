import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";

type DecimalLike = { toString: () => string };
type ProductDetailsRow = {
  productId: string;
  productName: string;
  description: string | null;
  price: DecimalLike;
  currency: string;
  primaryImageUrl: string | null;
  merchantUrl: string;
  merchant: {
    merchantId: string;
    storeName: string;
    merchantLogo: string | null;
    websiteUrl: string | null;
  };
  category: { categoryId: string; name: string; slug: string };
  productvariant: {
    productVariantId: string;
    sku: string;
    size: string | null;
    color: string | null;
    price: DecimalLike | null;
    stockQuantity: number | null;
  }[];
  productimage: {
    productImageId: string;
    imageUrl: string;
    altText: string | null;
    sortOrder: number;
  }[];
};

function productDetailsDto(product: ProductDetailsRow) {
  return {
    id: product.productId,
    name: product.productName,
    description: product.description,
    price: Number(product.price),
    currency: product.currency,
    image: product.primaryImageUrl,
    merchantUrl: product.merchantUrl,
    merchant: {
      id: product.merchant.merchantId,
      name: product.merchant.storeName,
      logo: product.merchant.merchantLogo,
      website: product.merchant.websiteUrl,
    },
    category: {
      id: product.category.categoryId,
      name: product.category.name,
      slug: product.category.slug,
    },
    images: product.productimage.map((image) => ({
      id: image.productImageId,
      url: image.imageUrl,
      alt: image.altText,
      sortOrder: image.sortOrder,
    })),
    variants: product.productvariant.map((variant) => ({
      id: variant.productVariantId,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: variant.price ? Number(variant.price) : null,
      stock: variant.stockQuantity,
    })),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const product = await prisma.product.findFirst({
    where: { productId, status: "ACTIVE" },
    include: {
      merchant: true,
      category: true,
      productvariant: true,
      productimage: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ product: productDetailsDto(product) });
}
