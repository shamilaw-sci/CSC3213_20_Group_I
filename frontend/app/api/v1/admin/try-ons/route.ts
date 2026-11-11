import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export async function GET(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const search = new URL(request.url).searchParams.get("search")?.trim().slice(0, 100) ?? "";
  const searchWhere = search ? { OR: [{ tryOnSessionId: { contains: search } }, { product: { productName: { contains: search } } }, { user: { is: { OR: [{ userName: { contains: search } }, { userEmail: { contains: search } }] } } }] } : {};
  const [sessions, pending, processing, completed, failed, cancelled] = await Promise.all([
    prisma.tryonsession.findMany({ where: searchWhere, orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { userName: true, userEmail: true } }, product: { select: { productName: true } } } }),
    prisma.tryonsession.count({ where: { status: "PENDING" } }),
    prisma.tryonsession.count({ where: { status: "PROCESSING" } }),
    prisma.tryonsession.count({ where: { status: "COMPLETED" } }),
    prisma.tryonsession.count({ where: { status: "FAILED" } }),
    prisma.tryonsession.count({ where: { status: "CANCELLED" } }),
  ]);
  return NextResponse.json({
    summary: { pending, processing, completed, failed, cancelled },
    tryOns: sessions.map((session) => ({ id: session.tryOnSessionId, customer: session.user ? { name: session.user.userName, email: session.user.userEmail } : { name: "Guest user", email: "No registered email" }, product: session.product.productName, status: session.status, errorMessage: session.errorMessage, createdAt: session.createdAt, startedAt: session.startedAt, completedAt: session.completedAt })),
  });
}
