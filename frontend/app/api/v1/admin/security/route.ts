import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

type EventRecord = { timestamp: Date };

function beginningOfWeek(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  const day = value.getDay();
  value.setDate(value.getDate() - (day === 0 ? 6 : day - 1));
  return value;
}

function buildSecurityTrend(successful: EventRecord[], failed: EventRecord[], period: "weekly" | "monthly") {
  const count = period === "weekly" ? 8 : 6;
  const current = period === "weekly" ? beginningOfWeek(new Date()) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  return Array.from({ length: count }, (_, index) => {
    const offset = index - (count - 1);
    const start = new Date(current);
    if (period === "weekly") start.setDate(current.getDate() + offset * 7);
    else start.setMonth(current.getMonth() + offset);
    const end = new Date(start);
    if (period === "weekly") end.setDate(start.getDate() + 7);
    else end.setMonth(start.getMonth() + 1);
    return {
      label: period === "weekly"
        ? start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : start.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      successful: successful.filter((event) => event.timestamp >= start && event.timestamp < end).length,
      failed: failed.filter((event) => event.timestamp >= start && event.timestamp < end).length,
    };
  });
}

function metadataValue(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

export async function GET(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const searchTerm = new URL(request.url).searchParams.get("search")?.trim().slice(0, 100) ?? "";
  const sessionSearch = searchTerm ? { OR: [
    { sessionId: { contains: searchTerm } },
    { ipAddress: { contains: searchTerm } },
    { userAgent: { contains: searchTerm } },
    { user: { OR: [{ userName: { contains: searchTerm } }, { userEmail: { contains: searchTerm } }] } },
  ] } : {};
  const auditSearch = searchTerm ? { OR: [
    { action: { contains: searchTerm } },
    { entityType: { contains: searchTerm } },
    { entityId: { contains: searchTerm } },
    { user: { userName: { contains: searchTerm } } },
    { user: { userEmail: { contains: searchTerm } } },
  ] } : {};
  const failedSearch = !searchTerm || /failed|login/i.test(searchTerm)
    ? { action: "AUTH_LOGIN_FAILED" }
    : { action: "AUTH_LOGIN_FAILED", OR: [{ auditLogId: { contains: searchTerm } }, { ipAddress: { contains: searchTerm } }, { userAgent: { contains: searchTerm } }] };
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const stalledBefore = new Date(now.getTime() - 15 * 60 * 1000);
  const chartStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const weeklyChartStart = beginningOfWeek(now);
  weeklyChartStart.setDate(weeklyChartStart.getDate() - 7 * 7);
  const since = weeklyChartStart < chartStart ? weeklyChartStart : chartStart;

  const [loginHistory, activeSessions, failedAttempts, adminAuditLogs, successfulEvents, failedEvents, successful24h, failed24h, adminActions30d, failedTryOns, stalledTryOns, unresolvedFeedback, failedLogins30d, restrictedUsers] = await Promise.all([
    prisma.session.findMany({ where: sessionSearch, orderBy: { createdAt: "desc" }, take: searchTerm ? 100 : 50, include: { user: { select: { userName: true, userEmail: true, role: true } } } }),
    prisma.session.findMany({ where: { revokedAt: null, expiryDate: { gt: now }, ...sessionSearch }, orderBy: { createdAt: "desc" }, take: searchTerm ? 100 : 100, include: { user: { select: { userName: true, userEmail: true, role: true } } } }),
    prisma.auditlog.findMany({ where: failedSearch, orderBy: { timestamp: "desc" }, take: searchTerm ? 100 : 100 }),
    prisma.auditlog.findMany({ where: { adminId: { not: null }, ...auditSearch }, orderBy: { timestamp: "desc" }, take: searchTerm ? 100 : 100, include: { user: { select: { userName: true, userEmail: true } } } }),
    prisma.session.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.auditlog.findMany({ where: { action: "AUTH_LOGIN_FAILED", timestamp: { gte: since } }, select: { timestamp: true } }),
    prisma.session.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.auditlog.count({ where: { action: "AUTH_LOGIN_FAILED", timestamp: { gte: dayAgo } } }),
    prisma.auditlog.count({ where: { adminId: { not: null }, timestamp: { gte: monthAgo } } }),
    prisma.tryonsession.count({ where: { status: "FAILED", createdAt: { gte: monthAgo } } }),
    prisma.tryonsession.count({ where: { status: { in: ["PENDING", "PROCESSING"] }, createdAt: { gte: monthAgo, lt: stalledBefore } } }),
    prisma.feedback.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] }, createdAt: { gte: monthAgo } } }),
    prisma.auditlog.count({ where: { action: "AUTH_LOGIN_FAILED", timestamp: { gte: monthAgo } } }),
    prisma.user.count({ where: { status: "SUSPENDED", updatedAt: { gte: monthAgo }, deletedAt: null } }),
  ]);

  const serializeSession = (session: (typeof loginHistory)[number]) => ({
    id: session.sessionId,
    user: { name: session.user.userName, email: session.user.userEmail, role: session.user.role },
    type: session.type,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt,
    expiryDate: session.expiryDate,
    revokedAt: session.revokedAt,
    current: session.sessionId === access.session.sessionId,
  });

  const successful = successfulEvents.map((event) => ({ timestamp: event.createdAt }));
  const alerts = [
    ...(failedTryOns ? [{ id: "failed-tryons", severity: "HIGH" as const, title: `${failedTryOns} failed try-on${failedTryOns === 1 ? "" : "s"}`, detail: "Review processing errors and retry eligible sessions.", href: "/admin/try-ons" }] : []),
    ...(stalledTryOns ? [{ id: "stalled-tryons", severity: "HIGH" as const, title: `${stalledTryOns} stalled try-on${stalledTryOns === 1 ? "" : "s"}`, detail: "Pending or processing for more than 15 minutes.", href: "/admin/try-ons" }] : []),
    ...(unresolvedFeedback ? [{ id: "feedback", severity: "MEDIUM" as const, title: `${unresolvedFeedback} unresolved feedback item${unresolvedFeedback === 1 ? "" : "s"}`, detail: "Open or under review.", href: "/admin/feedback" }] : []),
    ...(failedLogins30d ? [{ id: "failed-logins", severity: "HIGH" as const, title: `${failedLogins30d} failed login attempt${failedLogins30d === 1 ? "" : "s"}`, detail: "Review authentication failures from the last 30 days.", href: "/admin/security#failed-logins" }] : []),
    ...(restrictedUsers ? [{ id: "restricted-users", severity: "LOW" as const, title: `${restrictedUsers} restricted customer${restrictedUsers === 1 ? "" : "s"}`, detail: "Review whether these accounts should remain restricted.", href: "/admin/users" }] : []),
  ];

  return NextResponse.json({
    summary: { activeSessions: activeSessions.length, successfulLogins24h: successful24h, failedAttempts24h: failed24h, adminActions30d },
    alerts,
    loginHistory: loginHistory.map(serializeSession),
    activeSessions: activeSessions.map(serializeSession),
    failedAttempts: failedAttempts.map((event) => ({
      id: event.auditLogId,
      email: metadataValue(event.metadata, "email") ?? "Unknown",
      reason: metadataValue(event.metadata, "reason") ?? "LOGIN_FAILED",
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: event.timestamp,
    })),
    adminAuditLogs: adminAuditLogs.map((event) => ({
      id: event.auditLogId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      timestamp: event.timestamp,
      admin: event.user ? { name: event.user.userName, email: event.user.userEmail } : null,
    })),
    chart: {
      weekly: buildSecurityTrend(successful, failedEvents, "weekly"),
      monthly: buildSecurityTrend(successful, failedEvents, "monthly"),
    },
  });
}
