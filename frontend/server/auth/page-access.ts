import "server-only";

import { redirect } from "next/navigation";

import { getCurrentSession } from "@/server/auth/session";

export async function requireAdminPageUser(returnTo = "/admin") {
  const current = await getCurrentSession();
  if (!current) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  if (current.user.role !== "ADMIN") redirect("/");
  return current.user;
}
