import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export async function GET(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const search = new URL(request.url).searchParams.get("search")?.trim().slice(0, 100) ?? "";
  const [merchants, pending, active, suspended, rejected] = await Promise.all([
    prisma.merchant.findMany({ where: search ? { OR: [{ storeName: { contains: search } }, { email: { contains: search } }, { ownerName: { contains: search } }, { businessCategory: { contains: search } }] } : {}, orderBy: { updatedAt: "desc" }, take: 250, include: { user: { select: { userName: true, userEmail: true } }, subscription: { select: { plan: true, status: true } }, _count: { select: { product: true, merchantredirect: true } } } }),
    prisma.merchant.count({ where: { status: "PENDING" } }),
    prisma.merchant.count({ where: { status: "ACTIVE" } }),
    prisma.merchant.count({ where: { status: "SUSPENDED" } }),
    prisma.merchant.count({ where: { status: "REJECTED" } }),
  ]);
  const standard = merchants.filter((merchant) => merchant.subscription?.plan === "STANDARD").length;
  const pro = merchants.filter((merchant) => merchant.subscription?.plan === "PRO").length;
  const freeTrial = merchants.length - standard - pro;
  return NextResponse.json({
    summary: { pending, active, suspended, rejected, total: pending + active + suspended + rejected, freeTrial, standard, pro },
    merchants: merchants.map((merchant) => ({ id: merchant.merchantId, storeName: merchant.storeName, email: merchant.email, ownerName: merchant.ownerName, phone: merchant.phone, address: merchant.address, businessCategory: merchant.businessCategory, websiteUrl: merchant.websiteUrl, storeDescription: merchant.storeDescription, logo: merchant.merchantLogo, status: merchant.status, products: merchant._count.product, redirects: merchant._count.merchantredirect, account: merchant.user ? { name: merchant.user.userName, email: merchant.user.userEmail } : null, subscription: merchant.subscription ? { plan: merchant.subscription.plan, status: merchant.subscription.status } : { plan: "FREE" as const, status: "DEMO_ACTIVE" as const }, createdAt: merchant.createdAt, updatedAt: merchant.updatedAt })),
  });
}
