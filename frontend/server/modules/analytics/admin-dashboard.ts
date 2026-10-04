import "server-only";

import { prisma } from "@/server/db/prisma";

type EventRecord = { createdAt: Date };
type EventGroups = Record<string, EventRecord[]>;
type TrendPoint = { label: string; [key: string]: string | number };

export type DashboardRange = "7d" | "30d" | "6m";

export function dashboardRangeStart(range: DashboardRange) {
  const start = new Date();
  if (range === "7d") start.setDate(start.getDate() - 7);
  else if (range === "30d") start.setDate(start.getDate() - 30);
  else start.setMonth(start.getMonth() - 6);
  return start;
}

function beginningOfWeek(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  const day = value.getDay();
  value.setDate(value.getDate() - (day === 0 ? 6 : day - 1));
  return value;
}

function beginningOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function beginningOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function buildTrend(groups: EventGroups, unit: "day" | "week" | "month", count: number): TrendPoint[] {
  const current = unit === "day" ? beginningOfDay(new Date()) : unit === "week" ? beginningOfWeek(new Date()) : beginningOfMonth(new Date());

  return Array.from({ length: count }, (_, index) => {
    const offset = index - (count - 1);
    const start = new Date(current);
    if (unit === "day") start.setDate(current.getDate() + offset);
    else if (unit === "week") start.setDate(current.getDate() + offset * 7);
    else start.setMonth(current.getMonth() + offset);

    const end = new Date(start);
    if (unit === "day") end.setDate(start.getDate() + 1);
    else if (unit === "week") end.setDate(start.getDate() + 7);
    else end.setMonth(start.getMonth() + 1);

    const point: TrendPoint = {
      label: unit === "month"
        ? start.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
        : start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };

    for (const [key, records] of Object.entries(groups)) {
      point[key] = records.filter((record) => record.createdAt >= start && record.createdAt < end).length;
    }
    return point;
  });
}

function periods(groups: EventGroups) {
  return {
    weekly: buildTrend(groups, "day", 7),
    monthly: buildTrend(groups, "day", 30),
    threeMonths: buildTrend(groups, "week", 13),
    sixMonths: buildTrend(groups, "month", 6),
  };
}

export async function getAdminDashboardAnalytics() {
  const since = beginningOfMonth(new Date());
  since.setMonth(since.getMonth() - 5);

  const [registeredLogins, guestSessions, users, digitalTwins, tryOns, redirects] = await Promise.all([
    prisma.session.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.guestsession.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: since }, deletedAt: null }, select: { createdAt: true } }),
    prisma.digitaltwin.findMany({ where: { createdAt: { gte: since }, deletedAt: null }, select: { createdAt: true } }),
    prisma.tryonsession.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.merchantredirect.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  return {
    loginActivity: periods({ registered: registeredLogins, guests: guestSessions }),
    userGrowth: periods({ count: users }),
    digitalTwinGrowth: periods({ count: digitalTwins }),
    tryOnActivity: periods({ count: tryOns }),
    redirects: periods({ count: redirects }),
  };
}

export async function getAdminDashboardOverview(rangeStart: Date) {
  const [users, twins, tryOns, newUsers, recentTwins, recentTryOns, recentFeedback, recentAdminActions] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: rangeStart }, deletedAt: null } }),
    prisma.digitaltwin.count({ where: { createdAt: { gte: rangeStart } } }),
    prisma.tryonsession.count({ where: { createdAt: { gte: rangeStart } } }),
    prisma.user.findMany({ where: { createdAt: { gte: rangeStart }, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 6, select: { userId: true, userName: true, role: true, createdAt: true } }),
    prisma.digitaltwin.findMany({ where: { createdAt: { gte: rangeStart } }, orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { userName: true } } } }),
    prisma.tryonsession.findMany({ where: { createdAt: { gte: rangeStart } }, orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { userName: true } }, product: { select: { productName: true } } } }),
    prisma.feedback.findMany({ where: { createdAt: { gte: rangeStart } }, orderBy: { createdAt: "desc" }, take: 6, include: { user_feedback_userIdTouser: { select: { userName: true } } } }),
    prisma.auditlog.findMany({ where: { adminId: { not: null }, timestamp: { gte: rangeStart } }, orderBy: { timestamp: "desc" }, take: 6, include: { user: { select: { userName: true } } } }),
  ]);

  const activity = [
    ...newUsers.map((user) => ({ id: `user-${user.userId}`, type: "USER", title: `${user.userName} joined`, detail: user.role === "CUSTOMER" ? "Registered customer account" : `${user.role.toLowerCase()} account`, timestamp: user.createdAt, href: "/admin/users" })),
    ...recentTwins.map((twin) => ({ id: `twin-${twin.digitalTwinId}`, type: "TWIN", title: "Digital twin created", detail: twin.user.userName, timestamp: twin.createdAt, href: "/admin/twins" })),
    ...recentTryOns.map((tryOn) => ({ id: `tryon-${tryOn.tryOnSessionId}`, type: "TRY_ON", title: `Try-on ${tryOn.status.toLowerCase()}`, detail: `${tryOn.user?.userName ?? "Guest user"} · ${tryOn.product.productName}`, timestamp: tryOn.createdAt, href: "/admin/try-ons" })),
    ...recentFeedback.map((item) => ({ id: `feedback-${item.feedbackId}`, type: "FEEDBACK", title: item.subject || `${item.type.toLowerCase().replaceAll("_", " ")} feedback`, detail: item.user_feedback_userIdTouser?.userName ?? "Guest user", timestamp: item.createdAt, href: "/admin/feedback" })),
    ...recentAdminActions.map((event) => ({ id: `audit-${event.auditLogId}`, type: "ADMIN", title: event.action.toLowerCase().replaceAll("_", " "), detail: event.user?.userName ?? "Administrator", timestamp: event.timestamp, href: "/admin/security" })),
  ].sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime()).slice(0, 12);

  return { totals: { users, twins, sessions: tryOns }, activity };
}
