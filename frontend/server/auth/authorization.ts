import "server-only";

import { NextResponse } from "next/server";

import { getCurrentSession } from "@/server/auth/session";

export type UserRole = "CUSTOMER" | "MERCHANT" | "ADMIN";

export async function requireAuthenticatedUser(allowedRoles?: readonly UserRole[]) {
  const current = await getCurrentSession();
  if (!current) return { error: NextResponse.json({ message: "Authentication is required." }, { status: 401 }) } as const;
  if (allowedRoles && !allowedRoles.includes(current.user.role)) {
    return { error: NextResponse.json({ message: "You do not have permission to perform this action." }, { status: 403 }) } as const;
  }
  return { user: current.user, session: current.session } as const;
}
