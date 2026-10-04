import { redirect } from "next/navigation";

import { getCurrentSession } from "@/server/auth/session";

export default async function AdminProfileLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentSession();
  if (!current || current.user.role !== "ADMIN") redirect("/login");
  return children;
}
