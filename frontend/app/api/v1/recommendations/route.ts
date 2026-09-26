import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { loadInterestSignals } from "@/server/recommendations/load-interest-signals";
import { loadRecommendationProducts } from "@/server/recommendations/load-recommendation-products";
import { loadUserMeasurements } from "@/server/recommendations/load-user-measurements";
import { recommendProducts } from "@/server/recommendations/recommend-products";

export async function GET() {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;

  const [measurements, interestSignals, products] = await Promise.all([
    loadUserMeasurements(access.user.id),
    loadInterestSignals(access.user.id),
    loadRecommendationProducts(),
  ]);

  const ranked = recommendProducts(
    measurements,
    products.map((product) => product.candidate),
    interestSignals,
  );

  const productsById = new Map(products.map((product) => [product.id, product]));

  const recommendations = ranked.slice(0, 20).flatMap((recommendation) => {
    const product = productsById.get(recommendation.productId);
    if (!product) return [];

    return [{
      ...recommendation,
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        merchantName: product.merchantName,
        categoryName: product.categoryName,
        price: product.price,
        currency: product.currency,
      },
    }];
  });

  return NextResponse.json({
    recommendations,
    hasMeasurements: Object.values(measurements).some(
      (value) => typeof value === "number" && Number.isFinite(value),
    ),
    hasInterestHistory: interestSignals.length > 0,
  });
}