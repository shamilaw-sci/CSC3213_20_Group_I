import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export async function GET(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });
  const term = query.slice(0, 100);

  const [users, guests, products, merchants, feedback, twins, tryOns, sessions, auditLogs, failedLogins] = await Promise.all([
    prisma.user.findMany({ where: { deletedAt: null, OR: [{ userName: { contains: term } }, { userEmail: { contains: term } }] }, select: { userId: true, userName: true, userEmail: true, role: true }, take: 6 }),
    prisma.guestsession.findMany({ where: term.toLowerCase().includes("guest") ? { convertedAt: null } : { convertedAt: null, guestSessionId: { contains: term } }, select: { guestSessionId: true, restrictedAt: true }, take: 6 }),
    prisma.product.findMany({ where: { OR: [{ productName: { contains: term } }, { description: { contains: term } }, { category: { name: { contains: term } } }] }, select: { productId: true, productName: true, status: true, merchant: { select: { storeName: true } }, category: { select: { name: true } } }, take: 6 }),
    prisma.merchant.findMany({ where: { OR: [{ storeName: { contains: term } }, { email: { contains: term } }, { ownerName: { contains: term } }] }, select: { merchantId: true, storeName: true, email: true, status: true }, take: 6 }),
    prisma.feedback.findMany({ where: { OR: [{ subject: { contains: term } }, { message: { contains: term } }, { user_feedback_userIdTouser: { is: { OR: [{ userName: { contains: term } }, { userEmail: { contains: term } }] } } }] }, select: { feedbackId: true, subject: true, type: true, status: true }, take: 6 }),
    prisma.digitaltwin.findMany({ where: { deletedAt: null, user: { OR: [{ userName: { contains: term } }, { userEmail: { contains: term } }] } }, select: { digitalTwinId: true, status: true, user: { select: { userName: true, userEmail: true } } }, take: 6 }),
    prisma.tryonsession.findMany({ where: { OR: [{ product: { productName: { contains: term } } }, { user: { OR: [{ userName: { contains: term } }, { userEmail: { contains: term } }] } }, { tryOnSessionId: { contains: term } }] }, select: { tryOnSessionId: true, status: true, product: { select: { productName: true } }, user: { select: { userName: true, userEmail: true } } }, take: 6 }),
    prisma.session.findMany({ where: { OR: [{ sessionId: { contains: term } }, { ipAddress: { contains: term } }, { userAgent: { contains: term } }, { user: { OR: [{ userName: { contains: term } }, { userEmail: { contains: term } }] } }] }, select: { sessionId: true, type: true, revokedAt: true, user: { select: { userName: true, userEmail: true, role: true } } }, take: 6 }),
    prisma.auditlog.findMany({ where: { adminId: { not: null }, OR: [{ action: { contains: term } }, { entityType: { contains: term } }, { entityId: { contains: term } }, { ipAddress: { contains: term } }, { userAgent: { contains: term } }, { user: { userName: { contains: term } } }, { user: { userEmail: { contains: term } } }] }, select: { auditLogId: true, action: true, entityType: true, entityId: true, user: { select: { userName: true, userEmail: true } } }, take: 6 }),
    prisma.auditlog.findMany({ where: /failed|login/i.test(term) ? { action: "AUTH_LOGIN_FAILED" } : { action: "AUTH_LOGIN_FAILED", OR: [{ auditLogId: { contains: term } }, { ipAddress: { contains: term } }, { userAgent: { contains: term } }] }, select: { auditLogId: true, action: true, ipAddress: true, timestamp: true }, take: 6 }),
  ]);

  const results = [
    ...users.map((user) => ({ id: user.userId, category: "User", label: user.userName, detail: `${user.userEmail} · ${user.role}`, href: "/admin/users" })),
    ...guests.map((guest) => ({ id: guest.guestSessionId, category: "Guest user", label: "Guest user", detail: `Session ${guest.guestSessionId.slice(0, 8)} · ${guest.restrictedAt ? "restricted" : "active"}`, href: "/admin/users" })),
    ...products.map((product) => ({ id: product.productId, category: "Product", label: product.productName, detail: `${product.category.name} · ${product.merchant.storeName} · ${product.status.toLowerCase().replaceAll("_", " ")}`, href: "/admin/catalog" })),
    ...merchants.map((merchant) => ({ id: merchant.merchantId, category: "Merchant", label: merchant.storeName, detail: `${merchant.email} · ${merchant.status.toLowerCase()}`, href: "/admin/merchants" })),
    ...feedback.map((item) => ({ id: item.feedbackId, category: "Feedback", label: item.subject || `${item.type.toLowerCase()} feedback`, detail: item.status.toLowerCase().replaceAll("_", " "), href: "/admin/feedback" })),
    ...twins.map((twin) => ({ id: twin.digitalTwinId, category: "Digital twin", label: twin.user.userName, detail: `${twin.user.userEmail} · ${twin.status.toLowerCase()}`, href: "/admin/twins" })),
    ...tryOns.map((tryOn) => ({ id: tryOn.tryOnSessionId, category: "Try-on", label: tryOn.product.productName, detail: `${tryOn.user?.userName ?? "Guest user"} · ${tryOn.status.toLowerCase()}`, href: "/admin/try-ons" })),
    ...sessions.map((session) => ({ id: session.sessionId, category: "Security session", label: session.user.userName, detail: `${session.user.userEmail} · ${session.type.toLowerCase()}${session.revokedAt ? " · revoked" : ""}`, href: "/admin/security" })),
    ...auditLogs.map((event) => ({ id: event.auditLogId, category: "Audit log", label: event.action.toLowerCase().replaceAll("_", " "), detail: `${event.entityType ?? "Security event"}${event.entityId ? ` · ${event.entityId}` : ""}${event.user ? ` · ${event.user.userName}` : ""}`, href: "/admin/security" })),
    ...failedLogins.map((event) => ({ id: event.auditLogId, category: "Failed login", label: "Failed login attempt", detail: `${event.ipAddress ?? "IP not recorded"} · ${event.timestamp.toLocaleString()}`, href: "/admin/security" })),
  ];

  return NextResponse.json({ results });
}
