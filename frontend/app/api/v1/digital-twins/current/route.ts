/** WBS-2.4/2.6 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Digital Twin upload, read and deletion API. */
import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { removeEncryptedTwin, saveEncryptedTwin } from "@/server/storage/digital-twin-storage";

import {
  DigitalTwinImageError,
  processDigitalTwinImage,
} from "@/server/images/digital-twin-image";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const supportedTypes = new Set(["image/jpeg", "image/png"]);

function twinResponse(twin: { digitalTwinId: string; status: string; createdAt: Date }) {
  return { id: twin.digitalTwinId, status: twin.status, createdAt: twin.createdAt, imageUrl: `/api/v1/digital-twins/${twin.digitalTwinId}/image` };
}

export async function GET() {
  const access = await requireAuthenticatedUser(["CUSTOMER", "MERCHANT", "ADMIN"]);
  if ("error" in access) return access.error;
  const twin = await prisma.digitaltwin.findFirst({ where: { userId: access.user.id, status: "READY", deletedAt: null }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ twin: twin ? twinResponse(twin) : null });
}

export async function POST(request: Request) {
  const access = await requireAuthenticatedUser(["CUSTOMER", "MERCHANT", "ADMIN"]);
  if ("error" in access) return access.error;
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("image");
  if (!(file instanceof File)) return NextResponse.json({ message: "Provide an image file using the image field." }, { status: 400 });
  if (!supportedTypes.has(file.type)) return NextResponse.json({ message: "Only PNG and JPEG images are supported." }, { status: 400 });
  if (!file.size || file.size > MAX_FILE_SIZE) return NextResponse.json({ message: "Image size must be no larger than 5 MB." }, { status: 400 });

  const profile = await prisma.profile.findUnique({ where: { userId: access.user.id }, include: { measurement: true } });
  if (!profile) return NextResponse.json({ message: "Create a profile before uploading a digital twin." }, { status: 409 });
  const image = Buffer.from(await file.arrayBuffer());
  const isJpeg = image.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  const isPng = image
    .subarray(0, 8)
    .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

  if (!isJpeg && !isPng) {
    return NextResponse.json(
      { message: "The uploaded file is not a valid PNG or JPEG image." },
      { status: 400 },
    );
  }

  let processedImage;

  try {
    processedImage = await processDigitalTwinImage(image);
  } catch (error) {
    if (error instanceof DigitalTwinImageError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 },
      );
    }

    throw error;
  }

  const twinId = randomUUID();
  const filePath = await saveEncryptedTwin(
    twinId,
    processedImage.buffer,
  );

  const snapshot = profile.measurement ? { height: profile.measurement.heightCm?.toString(), weight: profile.measurement.weightKg?.toString(), chest: profile.measurement.chestCm?.toString(), waist: profile.measurement.waistCm?.toString(), hips: profile.measurement.hipsCm?.toString(), shoulder: profile.measurement.shoulderCm?.toString() } : null;
  const now = new Date();

  try {
    const twin = await prisma.$transaction(async (tx) => {
      const previousTwins = await tx.digitaltwin.findMany({ where: { userId: access.user.id, status: "READY", deletedAt: null } });
      await tx.digitaltwin.updateMany({ where: { userId: access.user.id, status: "READY", deletedAt: null }, data: { status: "DELETED", deletedAt: now, updatedAt: now } });
      const created = await tx.digitaltwin.create({ data: { digitalTwinId: twinId, userId: access.user.id, encryptedImagePath: filePath, measurementsSnapshot: snapshot ?? undefined, status: "READY", updatedAt: now } });
      return { created, previousTwins };
    });
    await Promise.all(twin.previousTwins.map((previous) => removeEncryptedTwin(previous.encryptedImagePath)));
    return NextResponse.json({ twin: twinResponse(twin.created) }, { status: 201 });
  } catch (error) {
    await removeEncryptedTwin(filePath);
    throw error;
  }
}

export async function DELETE() {
  const access = await requireAuthenticatedUser(["CUSTOMER", "MERCHANT", "ADMIN"]);
  if ("error" in access) return access.error;
  const twin = await prisma.digitaltwin.findFirst({ where: { userId: access.user.id, status: "READY", deletedAt: null }, orderBy: { createdAt: "desc" } });
  if (!twin) return NextResponse.json({ success: true });
  const now = new Date();
  await prisma.digitaltwin.update({ where: { digitalTwinId: twin.digitalTwinId }, data: { status: "DELETED", deletedAt: now, updatedAt: now } });
  await removeEncryptedTwin(twin.encryptedImagePath);
  return NextResponse.json({ success: true });
}
