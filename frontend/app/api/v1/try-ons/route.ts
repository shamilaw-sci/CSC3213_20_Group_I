import { randomBytes, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { readEncryptedTwin } from "@/server/storage/digital-twin-storage";
import { generateTryOnImage } from "@/server/try-on/gemini";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const runtime = "nodejs";

const schema = z.object({
  productId: z.string().uuid(),
  productVariantId: z.string().uuid().optional(),
  size: z.string().max(50).optional(),
  fitPercentage: z.number().min(0).max(100).optional(),
});

function metadataValue(metadata: unknown, key: "size" | "fitPercentage") {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" || typeof value === "number" ? value : null;
}

export async function GET() {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;

  const sessions = await prisma.tryonsession.findMany({
    where: { userId: access.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { product: true, productvariant: true, tryonresult: true },
  });

  return NextResponse.json({
    tryOns: sessions.map((session) => ({
      id: session.tryOnSessionId,
      status: session.status,
      createdAt: session.createdAt,
      imageUrl: session.tryonresult && !session.tryonresult.resultImagePath.startsWith("virtual://") ? `/api/v1/try-ons/${session.tryOnSessionId}/image` : null,
      generated: session.tryonresult?.metadata && typeof session.tryonresult.metadata === "object" && (session.tryonresult.metadata as Record<string, unknown>).renderer === "gemini",
      product: {
        id: session.product.productId,
        name: session.product.productName,
        image: session.product.primaryImageUrl,
      },
      size: session.productvariant?.size ?? metadataValue(session.requestMetadata, "size"),
      fitPercentage: metadataValue(session.tryonresult?.metadata, "fitPercentage"),
    })),
  });
}

export async function POST(request: Request) {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Invalid try-on request." }, { status: 400 });

  const input = parsed.data;
  const product = await prisma.product.findFirst({ where: { productId: input.productId, status: "ACTIVE" } });
  if (!product) return NextResponse.json({ message: "Product not found." }, { status: 404 });

  const twin = await prisma.digitaltwin.findFirst({
    where: { userId: access.user.id, status: "READY", deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!twin) return NextResponse.json({ message: "Upload a Digital Twin photo before using AI Virtual Try-On." }, { status: 400 });

  let twinImage: Buffer;
  try { twinImage = await readEncryptedTwin(twin.encryptedImagePath); }
  catch { return NextResponse.json({ message: "Your Digital Twin image is unavailable. Please upload it again." }, { status: 500 }); }

  let garmentImage: Buffer;
  let garmentMimeType: string;
  try {
    if (!product.primaryImageUrl) return NextResponse.json({ message: "This product has no garment image available." }, { status: 400 });
    const imageUrl = new URL(product.primaryImageUrl);
    if (!["http:", "https:"].includes(imageUrl.protocol)) throw new Error("Unsupported image URL.");
    const host = imageUrl.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local") || host.startsWith("10.") || host.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
      if (imageUrl.origin !== new URL(process.env.APP_URL || "http://localhost:3000").origin) throw new Error("Unsupported image host.");
    }
    const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(15_000) });
    const contentType = imageResponse.headers.get("content-type")?.split(";")[0] ?? "";
    if (!imageResponse.ok || !["image/jpeg", "image/png", "image/webp"].includes(contentType)) throw new Error("Unavailable image.");
    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    if (bytes.length > 8 * 1024 * 1024) throw new Error("Image is too large.");
    garmentImage = bytes;
    garmentMimeType = contentType;
  } catch {
    return NextResponse.json({ message: "The garment image could not be loaded. Please try another product." }, { status: 400 });
  }

  let generated: { buffer: Buffer; mimeType: string };
  try { generated = await generateTryOnImage(twinImage, garmentImage, garmentMimeType); }
  catch (error) {
    const message = error instanceof Error ? error.message : "Gemini could not generate the fitting image.";
    return NextResponse.json({ message }, { status: 502 });
  }

  let resultImage: Buffer;
  try { resultImage = await sharp(generated.buffer, { failOn: "error", limitInputPixels: 40_000_000 }).rotate().resize({ width: 1600, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toBuffer(); }
  catch { return NextResponse.json({ message: "Gemini returned an invalid fitting image. Please try again." }, { status: 502 }); }
  const imageDirectory = path.resolve(process.env.PRIVATE_STORAGE_ROOT || path.join(process.cwd(), "private-storage"), "try-on-results");
  await mkdir(imageDirectory, { recursive: true });
  const imagePath = path.join(imageDirectory, `${randomBytes(24).toString("hex")}.jpg`);
  await writeFile(imagePath, resultImage, { flag: "wx", mode: 0o600 });
  const now = new Date();
  const sessionId = randomUUID();
  try {
  const session = await prisma.$transaction(async (tx) => {
    const created = await tx.tryonsession.create({
      data: {
        tryOnSessionId: sessionId,
        userId: access.user.id,
        digitalTwinId: twin?.digitalTwinId,
        productId: product.productId,
        productVariantId: input.productVariantId,
        status: "COMPLETED",
        requestMetadata: { size: input.size ?? null },
        startedAt: now,
        completedAt: now,
        updatedAt: now,
      },
    });
    await tx.tryonresult.create({
      data: {
        tryOnResultId: randomUUID(),
        tryOnSessionId: created.tryOnSessionId,
        resultImagePath: imagePath,
        metadata: { fitPercentage: input.fitPercentage ?? null, renderer: "gemini", mimeType: "image/jpeg" },
      },
    });
    return created;
  });

  return NextResponse.json({ tryOn: { id: session.tryOnSessionId, status: session.status, createdAt: session.createdAt, imageUrl: `/api/v1/try-ons/${session.tryOnSessionId}/image` } }, { status: 201 });
  } catch {
    await unlink(imagePath).catch(() => undefined);
    return NextResponse.json({ message: "Could not save the generated fitting result." }, { status: 500 });
  }
}
