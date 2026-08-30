/** WBS-2.6 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Protected Digital Twin image access API. */
import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { readEncryptedTwin } from "@/server/storage/digital-twin-storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ twinId: string }> }) {
  const access = await requireAuthenticatedUser(["CUSTOMER", "MERCHANT", "ADMIN"]);
  if ("error" in access) return access.error;
  const { twinId } = await params;
  const twin = await prisma.digitaltwin.findFirst({ where: { digitalTwinId: twinId, userId: access.user.id, status: "READY", deletedAt: null } });
  if (!twin) return NextResponse.json({ message: "Digital twin not found." }, { status: 404 });
  try {
    const image = await readEncryptedTwin(twin.encryptedImagePath);
    const isPng = image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    return new NextResponse(image, { headers: { "Content-Type": isPng ? "image/png" : "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return NextResponse.json({ message: "Digital-twin image is unavailable." }, { status: 500 });
  }
}
