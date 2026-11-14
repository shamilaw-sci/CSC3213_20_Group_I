import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

const schema = z.object({
  productId: z.string().uuid(),
  source: z.string().trim().max(100).optional(),
});

function isAllowedMerchantDestination(destinationUrl: string, merchantWebsite: string | null) {
  try {
    const destination = new URL(destinationUrl);
    if (!["http:", "https:"].includes(destination.protocol)) return false;
    if (!merchantWebsite) return false;

    const website = new URL(merchantWebsite);
    return destination.hostname === website.hostname || destination.hostname.endsWith(`.${website.hostname}`);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const access = await requireAuthenticatedUser(["CUSTOMER"]);
  if ("error" in access) {
    return NextResponse.json({ message: "Register or log in to continue to the merchant store." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ message: "Product is required for merchant redirect." }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: { productId: parsed.data.productId, status: "ACTIVE" },
    include: { merchant: true },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  if (!isAllowedMerchantDestination(product.merchantUrl, product.merchant.websiteUrl)) {
    return NextResponse.json({ message: "Merchant destination is not allowed." }, { status: 400 });
  }

  await prisma.merchantredirect.create({
    data: {
      merchantRedirectId: randomUUID(),
      userId: access.user.id,
      guestSessionId: null,
      productId: product.productId,
      merchantId: product.merchantId,
      destinationUrl: product.merchantUrl,
      source: parsed.data.source ?? "product_detail",
    },
  });

  return NextResponse.json({ redirectUrl: product.merchantUrl }, { status: 201 });
}
