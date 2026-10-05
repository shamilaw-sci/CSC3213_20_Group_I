import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ tryOnId: string }> },
) {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;

  const { tryOnId } = await context.params;
  if (!z.string().uuid().safeParse(tryOnId).success) {
    return NextResponse.json({ message: "Invalid try-on ID." }, { status: 400 });
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const ownedSession = await tx.tryonsession.findFirst({
      where: { tryOnSessionId: tryOnId, userId: access.user.id },
      select: { tryOnSessionId: true },
    });
    if (!ownedSession) return false;

    // Keep feedback records, but unlink them before removing their session.
    await tx.feedback.updateMany({
      where: { tryOnSessionId: tryOnId },
      data: { tryOnSessionId: null },
    });
    await tx.tryonsession.delete({ where: { tryOnSessionId: tryOnId } });
    return true;
  });

  if (!deleted) {
    return NextResponse.json({ message: "Try-on not found." }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
