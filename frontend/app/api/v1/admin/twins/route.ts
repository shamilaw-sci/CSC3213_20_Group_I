import { stat } from "node:fs/promises";

import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;

  const [totalTwinsCreated, twins] = await Promise.all([
    prisma.digitaltwin.count(),
    prisma.digitaltwin.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { userName: true, userEmail: true } } },
    }),
  ]);

  const storedPaths = Array.from(new Set(twins.flatMap((twin) => [twin.encryptedImagePath, twin.previewImagePath].filter((value): value is string => Boolean(value)))));
  const fileSizes = await Promise.all(storedPaths.map(async (filePath) => stat(filePath).then((file) => file.size).catch(() => null)));
  const availableSizes = fileSizes.filter((size): size is number => size !== null);

  return NextResponse.json({
    metrics: {
      totalTwinsCreated,
      totalImagesUploaded: availableSizes.length,
      storageBytes: availableSizes.reduce((total, size) => total + size, 0),
    },
    twins: twins.map((twin) => ({
      id: twin.digitalTwinId,
      name: twin.user.userName,
      email: twin.user.userEmail,
      role: "Registered User",
      status: twin.status,
      createdAt: twin.createdAt,
      imageUrl: `/api/v1/admin/twins/${twin.digitalTwinId}/image`,
    })),
  });
}
