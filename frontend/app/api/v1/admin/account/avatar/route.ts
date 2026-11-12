import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxAvatarBytes = 2 * 1024 * 1024;

function validOrigin(request: Request) {
  const allowedOrigin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  return request.headers.get("origin") === allowedOrigin;
}

export async function GET() {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const profile = await prisma.adminprofile.findUnique({
    where: { userId: access.user.id },
    select: { avatarData: true, avatarMimeType: true },
  });
  if (!profile?.avatarData || !profile.avatarMimeType) {
    return NextResponse.json({ message: "Profile picture not found." }, { status: 404 });
  }
  return new Response(profile.avatarData, {
    headers: {
      "Content-Type": profile.avatarMimeType,
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  if (!validOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const form = await request.formData();
  const image = form.get("image");
  if (!(image instanceof File) || !allowedTypes.has(image.type)) {
    return NextResponse.json({ message: "Choose a JPG, PNG, or WebP image." }, { status: 400 });
  }
  if (image.size === 0 || image.size > maxAvatarBytes) {
    return NextResponse.json({ message: "Profile picture must be smaller than 2 MB." }, { status: 400 });
  }
  const now = new Date();
  const avatarData = new Uint8Array(await image.arrayBuffer());
  await prisma.$transaction(async (tx) => {
    await tx.adminprofile.upsert({
      where: { userId: access.user.id },
      create: {
        adminProfileId: randomUUID(), userId: access.user.id,
        designation: "Administrator", avatarData,
        avatarMimeType: image.type, updatedAt: now,
      },
      update: { avatarData, avatarMimeType: image.type, updatedAt: now },
    });
    await tx.auditlog.create({
      data: { auditLogId: randomUUID(), adminId: access.user.id, action: "ADMIN_AVATAR_UPDATED", entityType: "user", entityId: access.user.id },
    });
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  if (!validOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const now = new Date();
  await prisma.$transaction([
    prisma.adminprofile.updateMany({
      where: { userId: access.user.id },
      data: { avatarData: null, avatarMimeType: null, updatedAt: now },
    }),
    prisma.auditlog.create({
      data: { auditLogId: randomUUID(), adminId: access.user.id, action: "ADMIN_AVATAR_REMOVED", entityType: "user", entityId: access.user.id },
    }),
  ]);
  return NextResponse.json({ success: true });
}
