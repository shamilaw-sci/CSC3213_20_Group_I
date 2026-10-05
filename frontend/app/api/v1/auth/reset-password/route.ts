import { createHash } from "node:crypto";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/server/db/prisma";
import { enforceRateLimit } from "@/server/security/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(128)
    .regex(/[A-Z]/, "Password must contain an uppercase letter.")
    .regex(/[0-9]/, "Password must contain a number."),
});
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
class InvalidResetTokenError extends Error {}

function invalidTokenResponse() {
  return NextResponse.json({ message: "This reset link is invalid or has expired." }, { status: 400 });
}

export async function POST(request: Request) {
  const limit = enforceRateLimit(request, "reset-password", 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ message: "Too many requests. Try again later." }, {
      status: 429, headers: { "Retry-After": String(limit.retryAfter) },
    });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid reset request." }, { status: 400 });
  }
  const tokenHash = hash(parsed.data.token);
  const record = await prisma.passwordresettoken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiryDate <= new Date()) return invalidTokenResponse();

  // Hash outside the transaction so expensive work does not hold database locks.
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  try {
    await prisma.$transaction(async (tx) => {
      const now = new Date();
      // Recheck expiry and consumption in the write, not only in the earlier read.
      const claimed = await tx.passwordresettoken.updateMany({
        where: { passwordResetTokenId: record.passwordResetTokenId, tokenHash, usedAt: null, expiryDate: { gt: now } },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) throw new InvalidResetTokenError();

      const updated = await tx.user.updateMany({
        where: { userId: record.userId, status: "ACTIVE", deletedAt: null },
        data: { passwordHash, updatedAt: now },
      });
      if (updated.count !== 1) throw new InvalidResetTokenError();

      await tx.passwordresettoken.updateMany({
        where: { userId: record.userId, usedAt: null }, data: { usedAt: now },
      });
      await tx.session.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: now, updatedAt: now },
      });
    });
  } catch (error) {
    if (error instanceof InvalidResetTokenError) return invalidTokenResponse();
    throw error;
  }
  return NextResponse.json({ success: true });
}
