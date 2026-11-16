import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({ where: { status: "ACTIVE" }, orderBy: { storeName: "asc" }, include: { _count: { select: { product: { where: { status: "ACTIVE" } } } } } });
    return NextResponse.json({ merchants: merchants.map((merchant) => ({ id: merchant.merchantId, name: merchant.storeName, logo: merchant.merchantLogo, website: merchant.websiteUrl, productCount: merchant._count.product })) });
  } catch (error) {
    console.error("Failed to load merchants", error);
    return NextResponse.json({ message: "Merchant data is temporarily unavailable." }, { status: 503 });
  }
}
