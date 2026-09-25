import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { recommendSize, sortSizes } from "@/server/modules/products/size-normalization";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;

  const { productId } = await params;
  const [product, profile] = await Promise.all([
    prisma.product.findFirst({
      where: { productId, status: "ACTIVE" },
      include: { productvariant: true },
    }),
    prisma.profile.findUnique({
      where: { userId: access.user.id },
      include: { measurement: true },
    }),
  ]);

  if (!product) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  const availableSizes = sortSizes(product.productvariant.map((variant) => variant.size));
  const measurement = profile?.measurement;
  const recommendedSize = measurement
    ? recommendSize(
        {
          chestCm: measurement.chestCm ? Number(measurement.chestCm) : null,
          waistCm: measurement.waistCm ? Number(measurement.waistCm) : null,
          hipsCm: measurement.hipsCm ? Number(measurement.hipsCm) : null,
        },
        availableSizes,
      )
    : null;

  return NextResponse.json({
    recommendation: {
      productId,
      availableSizes,
      recommendedSize,
    },
  });
}
