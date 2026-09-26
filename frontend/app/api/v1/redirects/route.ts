import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentGuestSession } from "@/server/auth/guest";
import { getCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

const schema = z.object({
  productId: z.string().uuid(),
  source: z.string().trim().max(100).optional(),
});

function isAllowedMerchantDestination(destinationUrl: string, merchantWebsite: string | null) {
  try {
    const destination = new URL(destinationUrl);
    if (!["http:", "https:"].includes(destination.protocol)) return false;
    if (!merchantWebsite) return true;

    const website = new URL(merchantWebsite);
    return destination.hostname === website.hostname || destination.hostname.endsWith(`.${website.hostname}`);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
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

  const [session, guest] = await Promise.all([getCurrentSession(), getCurrentGuestSession()]);

  await prisma.merchantredirect.create({
    data: {
      merchantRedirectId: randomUUID(),
      userId: session?.user.id,
      guestSessionId: session ? null : guest?.guestSessionId,
      productId: product.productId,
      merchantId: product.merchantId,
      destinationUrl: product.merchantUrl,
      source: parsed.data.source ?? "product_detail",
    },
  });

  return NextResponse.json({ redirectUrl: product.merchantUrl }, { status: 201 });
}
