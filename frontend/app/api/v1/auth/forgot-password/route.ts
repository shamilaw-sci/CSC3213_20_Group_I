import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { enforceRateLimit } from "@/server/security/rate-limit";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
export async function POST(request: Request) {
  const limit = enforceRateLimit(request, "forgot-password", 5, 15 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "If an account exists, reset instructions will be sent." });
  const user = await prisma.user.findUnique({ where: { userEmail: parsed.data.email } });
  if (user && user.status === "ACTIVE" && !user.deletedAt) {
    const token = randomBytes(32).toString("base64url"); const now = new Date();
    await prisma.passwordresettoken.updateMany({ where: { userId: user.userId, usedAt: null }, data: { usedAt: now } });
    await prisma.passwordresettoken.create({ data: { passwordResetTokenId: randomUUID(), userId: user.userId, tokenHash: hash(token), expiryDate: new Date(Date.now() + 60 * 60 * 1000) } });
    if (process.env.NODE_ENV !== "production") console.info(`TryVora local password-reset token for ${user.userEmail}: ${token}`);
    // Production delivery belongs here: send the token in a one-time HTTPS reset link via an email provider.
  }
  return NextResponse.json({ message: "If an account exists, reset instructions will be sent." });
}
