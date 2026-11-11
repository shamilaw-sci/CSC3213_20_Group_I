import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export async function GET(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const search = new URL(request.url).searchParams.get("search")?.trim().slice(0, 100) ?? "";
  const searchWhere = search ? { OR: [{ subject: { contains: search } }, { message: { contains: search } }, { user_feedback_userIdTouser: { is: { OR: [{ userName: { contains: search } }, { userEmail: { contains: search } }] } } }] } : {};
  const [items, open, inReview, resolved, closed] = await Promise.all([
    prisma.feedback.findMany({ where: searchWhere, orderBy: { createdAt: "desc" }, take: 100, include: { user_feedback_userIdTouser: { select: { userName: true, userEmail: true } }, user_feedback_resolvedByIdTouser: { select: { userName: true } } } }),
    prisma.feedback.count({ where: { status: "OPEN" } }),
    prisma.feedback.count({ where: { status: "IN_REVIEW" } }),
    prisma.feedback.count({ where: { status: "RESOLVED" } }),
    prisma.feedback.count({ where: { status: "CLOSED" } }),
  ]);
  return NextResponse.json({
    summary: { open, inReview, resolved, closed },
    feedback: items.map((item) => ({ id: item.feedbackId, customer: item.user_feedback_userIdTouser ? { name: item.user_feedback_userIdTouser.userName, email: item.user_feedback_userIdTouser.userEmail } : { name: "Guest user", email: "No registered email" }, type: item.type, status: item.status, rating: item.rating, subject: item.subject, message: item.message, resolutionNotes: item.resolutionNotes, createdAt: item.createdAt, resolvedAt: item.resolvedAt, resolvedBy: item.user_feedback_resolvedByIdTouser?.userName ?? null })),
  });
}
