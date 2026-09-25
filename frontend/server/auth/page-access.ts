import "server-only";

import { redirect } from "next/navigation";

import { getCurrentSession } from "@/server/auth/session";

export async function requireAdminPageUser() {
  const current = await getCurrentSession();
  if (!current) redirect("/login");
  if (current.user.role !== "ADMIN") redirect("/");
  return current.user;
}
