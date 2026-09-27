import { randomUUID } from "node:crypto";
import type * as runtime from "@prisma/client/runtime/client";

import { prisma } from "@/server/db/prisma";

type AuditMetadata = runtime.InputJsonValue | null | undefined;

export async function writeAuditLog(
  adminId: string | null | undefined,
  action: string,
  entityType?: string | null,
  entityId?: string | null,
  metadata?: AuditMetadata,
) {
  return prisma.auditlog.create({
    data: {
      auditLogId: randomUUID(),
      adminId: adminId ?? null,
      action,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
      metadata: metadata ?? undefined,
    },
  });
}
