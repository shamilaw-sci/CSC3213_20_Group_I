import { NextResponse } from "next/server";

import { requireCurrentMerchant } from "@/server/merchant/current-merchant";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const access = await requireCurrentMerchant();
  if (!("merchant" in access)) return access.error;

  const merchantId = access.merchant.merchantId;
  const [products, redirects] = await Promise.all([
    prisma.product.findMany({
      where: { merchantId },
      select: {
        status: true,
        productvariant: { select: { stockQuantity: true } },
      },
    }),
    prisma.merchantredirect.groupBy({
      by: ["productId"],
      where: { merchantId },
      _count: { merchantRedirectId: true },
    }),
  ]);

  const statusCounts = products.reduce<Record<string, number>>((counts, product) => {
    counts[product.status] = (counts[product.status] ?? 0) + 1;
    return counts;
  }, {});
  const totalStock = products.reduce(
    (sum, product) => sum + product.productvariant.reduce((stock, variant) => stock + (variant.stockQuantity ?? 0), 0),
    0,
  );
  const totalRedirects = redirects.reduce((sum, item) => sum + item._count.merchantRedirectId, 0);

  return NextResponse.json({
    analytics: {
      totalProducts: products.length,
      statusCounts,
      totalStock,
      totalRedirects,
      redirectedProducts: redirects.length,
    },
  });
}
