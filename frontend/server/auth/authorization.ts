import "server-only";

import { NextResponse } from "next/server";

import { getCurrentSession } from "@/server/auth/session";

export type UserRole = "CUSTOMER" | "MERCHANT" | "ADMIN";

type CurrentSession = NonNullable<
  Awaited<ReturnType<typeof getCurrentSession>>
>;

type AuthenticationResult =
  | { error: NextResponse }
  | {
      user: CurrentSession["user"];
      session: CurrentSession["session"];
    };

export async function requireAuthenticatedUser(
  allowedRoles?: readonly UserRole[],
): Promise<AuthenticationResult> {
  const current = await getCurrentSession();

  if (!current) {
    return {
      error: NextResponse.json(
        { message: "Authentication is required." },
        { status: 401 },
      ),
    };
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(current.user.role)
  ) {
    return {
      error: NextResponse.json(
        {
          message:
            "You do not have permission to perform this action.",
        },
        { status: 403 },
      ),
    };
  }

  return {
    user: current.user,
    session: current.session,
  };
}