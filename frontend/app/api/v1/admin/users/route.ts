import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;

  const [accounts, guestSessions] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { digitaltwin: true } } },
    }),
    prisma.guestsession.findMany({
      where: { convertedAt: null },
      include: { _count: { select: { tryonsession: true } } },
    }),
  ]);

  const registered = accounts.map((user) => ({
    id: user.userId,
    kind: "REGISTERED" as const,
    name: user.userName,
    email: user.userEmail,
    accountType: user.role === "CUSTOMER" ? "REGISTERED_USER" as const : user.role,
    status: user.status === "ACTIVE" ? "ACTIVE" as const : "RESTRICTED" as const,
    createdAt: user.createdAt,
    lastActivityAt: user.lastLoginAt,
    twinsCreated: user._count.digitaltwin,
    tryOns: null,
    restrictable: user.role === "CUSTOMER",
  }));

  const guests = guestSessions.map((guest) => ({
    id: guest.guestSessionId,
    kind: "GUEST" as const,
    name: "Guest user",
    email: "No registered email",
    accountType: "GUEST_USER" as const,
    status: guest.restrictedAt ? "RESTRICTED" as const : "ACTIVE" as const,
    createdAt: guest.createdAt,
    lastActivityAt: guest.lastUsedAt,
    twinsCreated: null,
    tryOns: guest._count.tryonsession,
    restrictable: true,
  }));

  const users = [...registered, ...guests].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  return NextResponse.json({ users });
}
