import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { createPasswordResetMailer } from "@/server/auth/reset-email";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
export async function POST(request: Request) {
  const limit = enforceRateLimit(request, "forgot-password", 5, 15 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "If an account exists, reset instructions will be sent." });
  let sendResetEmail: ReturnType<typeof createPasswordResetMailer>;
  try {
    // Check deployment configuration before looking up the account.
    sendResetEmail = createPasswordResetMailer();
  } catch {
    console.error("Password-reset mail configuration is unavailable.");
    return NextResponse.json({ message: "Password reset is temporarily unavailable. Please try again later." }, { status: 503 });
  }
  const user = await prisma.user.findUnique({ where: { userEmail: parsed.data.email } });
  if (user && user.status === "ACTIVE" && !user.deletedAt) {
    const token = randomBytes(32).toString("base64url"); const now = new Date();
    const passwordResetTokenId = randomUUID();
    await prisma.$transaction(async (tx) => {
      await tx.passwordresettoken.updateMany({ where: { userId: user.userId, usedAt: null }, data: { usedAt: now } });
      await tx.passwordresettoken.create({ data: { passwordResetTokenId, userId: user.userId, tokenHash: hash(token), expiryDate: new Date(Date.now() + 60 * 60 * 1000) } });
    });
    try {
      await sendResetEmail(user.userEmail, token);
    } catch {
      // Do not expose account existence, SMTP details, addresses, or tokens.
      console.error("Password-reset email delivery failed.");
      await prisma.passwordresettoken.updateMany({ where: { passwordResetTokenId, usedAt: null }, data: { usedAt: new Date() } });
    }
  }
  return NextResponse.json({ message: "If an account exists, reset instructions will be sent." });
}
