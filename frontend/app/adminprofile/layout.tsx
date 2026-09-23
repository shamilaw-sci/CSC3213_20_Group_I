import type { ReactNode } from "react";

import { requireAdminPageUser } from "@/server/auth/page-access";

export default async function AdminProfileLayout({ children }: { children: ReactNode }) {
  await requireAdminPageUser();
  return <>{children}</>;
}
