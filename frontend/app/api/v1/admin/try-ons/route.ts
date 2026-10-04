import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const [sessions, pending, processing, completed, failed, cancelled] = await Promise.all([
    prisma.tryonsession.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { userName: true, userEmail: true } }, product: { select: { productName: true } } } }),
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
