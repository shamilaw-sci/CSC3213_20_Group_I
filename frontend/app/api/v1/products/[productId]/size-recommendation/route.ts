import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { fitRangesCmSchema, recommendSizeFromFitRanges, sortSizes } from "@/server/modules/products/size-normalization";

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
  const fitVariants = product.productvariant.map((variant) => {
    const metadata = typeof variant.metadata === "object" && variant.metadata ? variant.metadata : {};
    const parsed = fitRangesCmSchema.safeParse("fitRangesCm" in metadata ? metadata.fitRangesCm : null);
    return {
      size: variant.size,
      fitRangesCm: parsed.success ? parsed.data : null,
    };
  });
  const fitRecommendation = measurement
    ? recommendSizeFromFitRanges(
        {
          chestCm: measurement.chestCm ? Number(measurement.chestCm) : null,
          waistCm: measurement.waistCm ? Number(measurement.waistCm) : null,
          hipsCm: measurement.hipsCm ? Number(measurement.hipsCm) : null,
        },
        fitVariants,
      )
    : {
        recommendedSize: null,
        confidence: "unavailable" as const,
        reason: "No customer measurements are available.",
      };

  return NextResponse.json({
    recommendation: {
      productId,
      availableSizes,
      ...fitRecommendation,
    },
  });
}
