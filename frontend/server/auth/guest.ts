import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/server/db/prisma";

export const GUEST_COOKIE_NAME = "tryvora_guest";
export const GUEST_MAX_AGE = 7 * 24 * 60 * 60;

export function hashGuestToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getCurrentGuestSession() {
  const token = (await cookies()).get(GUEST_COOKIE_NAME)?.value;
  if (!token || token.length > 200) return null;
  const guest = await prisma.guestsession.findUnique({ where: { tokenHash: hashGuestToken(token) } });
  if (!guest || guest.convertedAt || guest.expiryDate <= new Date()) return null;
  return guest;
}

// Call only with the user ID from a verified authenticated session.
export async function convertGuestSession(userId: string) {
  const guest = await getCurrentGuestSession();
  if (!guest) return false;

  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const claimed = await tx.guestsession.updateMany({
      where: { guestSessionId: guest.guestSessionId, convertedAt: null, expiryDate: { gt: now } },
      data: { convertedAt: now, convertedUserId: userId, updatedAt: now },
    });
    if (claimed.count !== 1) return false;

    // Do not overwrite records that already belong to a registered account.
    const where = { guestSessionId: guest.guestSessionId, userId: null };
    await tx.comparison.updateMany({ where, data: { userId, guestSessionId: null, updatedAt: now } });
    await tx.feedback.updateMany({ where, data: { userId, guestSessionId: null, updatedAt: now } });
    await tx.tryonsession.updateMany({ where, data: { userId, guestSessionId: null, updatedAt: now } });
    await tx.merchantredirect.updateMany({ where, data: { userId, guestSessionId: null } });
    return true;
  });
}
