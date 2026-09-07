import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const [users, products, merchants, twins] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.product.count(),
    prisma.merchant.count(),
    prisma.digitaltwin.count({ where: { deletedAt: null } }),
  ]);
  return NextResponse.json({ users, products, merchants, twins });
}
