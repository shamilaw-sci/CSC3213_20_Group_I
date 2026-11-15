import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";
import sharp from "sharp";

import { getCurrentGuestSession } from "@/server/auth/guest";
import { getCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { processDigitalTwinImage, DigitalTwinImageError } from "@/server/images/digital-twin-image";
import { readEncryptedTwin } from "@/server/storage/digital-twin-storage";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { generateTryOnImage, FashnTryOnError } from "@/server/try-on/fashn";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_GARMENT_SIZE = 8 * 1024 * 1024;
const MAX_GUEST_PHOTO_SIZE = 5 * 1024 * 1024;
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

function fashnCategory(slug: string, name: string): "tops" | "bottoms" | "one-pieces" {
  const category = `${slug} ${name}`.toLowerCase().replaceAll("_", "-");
  if (/\b(dress|dresses|gown|gowns|jumpsuit|jumpsuits|romper|rompers|playsuit|playsuits|one-pieces?)\b/.test(category)) {
    return "one-pieces";
  }
  if (/\b(bottoms?|pants|trousers|jeans|skirts?|shorts|leggings)\b/.test(category)) {
    return "bottoms";
  }
  return "tops";
}

function parseGuestForm(formData: FormData) {
  const fit = formData.get("fitPercentage");
  return schema.safeParse({
    productId: formData.get("productId"),
    productVariantId: formData.get("productVariantId") || undefined,
    size: formData.get("size") || undefined,
    fitPercentage: fit ? Number(fit) : undefined,
  });
}

async function normalizeGarmentImage(bytes: Buffer) {
  try {
    const image = sharp(bytes, { failOn: "error", limitInputPixels: 40_000_000 });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height || !["jpeg", "png", "webp"].includes(metadata.format ?? "") || (metadata.pages ?? 1) > 1) {
      throw new Error("Unsupported garment image.");
    }
    return await image.rotate().resize({ width: 1600, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  } catch {
    throw new Error("The garment image is not a valid supported image.");
  }
}

export async function GET() {
  const access = await getCurrentSession();
  if (!access || access.user.role !== "CUSTOMER") {
    return NextResponse.json({ message: "Authentication is required." }, { status: 401 });
  }

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
      generated: session.tryonresult?.metadata && typeof session.tryonresult.metadata === "object" && ["gemini", "fashn-vton-1.5"].includes(String((session.tryonresult.metadata as Record<string, unknown>).renderer ?? "")),
      product: { id: session.product.productId, name: session.product.productName, image: session.product.primaryImageUrl },
      size: session.productvariant?.size ?? metadataValue(session.requestMetadata, "size"),
      fitPercentage: metadataValue(session.tryonresult?.metadata, "fitPercentage"),
    })),
  });
}

export async function POST(request: Request) {
  const [current, guest] = await Promise.all([getCurrentSession(), getCurrentGuestSession()]);
  if (current && current.user.role !== "CUSTOMER") {
    return NextResponse.json({ message: "Only customer accounts can use Virtual Try-On." }, { status: 403 });
  }
  const isGuest = !current && Boolean(guest);
  if (!current && !guest) return NextResponse.json({ message: "Register or start a guest session to use Virtual Try-On." }, { status: 401 });

  const limit = enforceRateLimit(request, "try-on-generate", 8, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ message: "Too many try-on requests. Please try again shortly." }, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  let input: z.infer<typeof schema>;
  let personImage: Buffer;
  let digitalTwinId: string | undefined;
  if (isGuest) {
    const formData = await request.formData().catch(() => null);
    if (!formData) return NextResponse.json({ message: "Provide the try-on photo as a multipart image upload." }, { status: 400 });
    const parsed = parseGuestForm(formData);
    if (!parsed.success) return NextResponse.json({ message: "Invalid try-on request." }, { status: 400 });
    input = parsed.data;
    const file = formData.get("image");
    if (!(file instanceof File)) return NextResponse.json({ message: "Choose a photo for your guest try-on." }, { status: 400 });
    if (!["image/jpeg", "image/png"].includes(file.type)) return NextResponse.json({ message: "Only JPEG and PNG photos are supported." }, { status: 400 });
    if (!file.size || file.size > MAX_GUEST_PHOTO_SIZE) return NextResponse.json({ message: "Your photo must be no larger than 5 MB." }, { status: 400 });
    try {
      const processed = await processDigitalTwinImage(Buffer.from(await file.arrayBuffer()));
      personImage = processed.buffer;
    } catch (error) {
      const message = error instanceof DigitalTwinImageError ? error.message : "The uploaded photo could not be processed.";
      return NextResponse.json({ message }, { status: 400 });
    }
  } else {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "Invalid try-on request." }, { status: 400 });
    input = parsed.data;
    const twin = await prisma.digitaltwin.findFirst({
      where: { userId: current!.user.id, status: "READY", deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!twin) return NextResponse.json({ message: "Create your Digital Twin photo before using Virtual Try-On." }, { status: 400 });
    digitalTwinId = twin.digitalTwinId;
    try {
      personImage = await readEncryptedTwin(twin.encryptedImagePath);
    } catch {
      return NextResponse.json({ message: "Your Digital Twin image is unavailable. Please upload it again." }, { status: 500 });
    }
  }

  const product = await prisma.product.findFirst({
    where: { productId: input.productId, status: "ACTIVE" },
    include: {
      category: { select: { slug: true, name: true } },
      productvariant: { select: { productVariantId: true, size: true, stockQuantity: true } },
    },
  });
  if (!product) return NextResponse.json({ message: "Product not found." }, { status: 404 });
  const variants = product.productvariant ?? [];
  const selectedVariant = input.productVariantId
    ? variants.find((variant) => variant.productVariantId === input.productVariantId)
    : variants.find((variant) => (variant.size ?? "One size") === (input.size ?? "One size") && (variant.stockQuantity ?? 0) > 0);
  if (!selectedVariant) return NextResponse.json({ message: "Choose a size that is listed for this product and currently in stock." }, { status: 400 });
  if ((selectedVariant.stockQuantity ?? 0) <= 0) return NextResponse.json({ message: "That size is now out of stock. Choose another available size." }, { status: 409 });
  if (input.size && (selectedVariant.size ?? "One size") !== input.size) {
    return NextResponse.json({ message: "The selected size does not match this product variant." }, { status: 400 });
  }
  input.productVariantId = selectedVariant.productVariantId;
  input.size = selectedVariant.size ?? "One size";

  let garmentImage: Buffer;
  try {
    if (!product.primaryImageUrl) return NextResponse.json({ message: "This product has no garment image available." }, { status: 400 });
    const appOrigin = new URL(process.env.APP_URL || "http://localhost:3000");
    const imageUrl = new URL(product.primaryImageUrl, appOrigin);
    if (!["http:", "https:"].includes(imageUrl.protocol)) throw new Error("Unsupported image URL.");
    const host = imageUrl.hostname.toLowerCase();
    const privateHost = host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local") || host.startsWith("10.") || host.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
    if (privateHost && imageUrl.origin !== appOrigin.origin) throw new Error("Unsupported image host.");
    const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(15_000) });
    const contentType = imageResponse.headers.get("content-type")?.split(";")[0] ?? "";
    const declaredSize = Number(imageResponse.headers.get("content-length") ?? 0);
    if (!imageResponse.ok || !["image/jpeg", "image/png", "image/webp"].includes(contentType)) throw new Error("Unavailable image.");
    if (declaredSize > MAX_GARMENT_SIZE) throw new Error("Image is too large.");
    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    if (bytes.length > MAX_GARMENT_SIZE) throw new Error("Image is too large.");
    garmentImage = await normalizeGarmentImage(bytes);
  } catch {
    return NextResponse.json({ message: "The garment image could not be loaded or validated. Please try another product." }, { status: 400 });
  }

  let generated: { buffer: Buffer; mimeType: string };
  const generationStartedAt = Date.now();
  try {
    generated = await generateTryOnImage(personImage, garmentImage, fashnCategory(product.category.slug, product.category.name));
  } catch (error) {
    const status = error instanceof FashnTryOnError ? error.status : 502;
    const message = error instanceof FashnTryOnError ? error.message : "FASHN could not generate the fitting image. Please try again.";
    return NextResponse.json({ message }, { status });
  }

  let resultImage: Buffer;
  try {
    resultImage = await sharp(generated.buffer, { failOn: "error", limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 1600, height: 2400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
  } catch {
    return NextResponse.json({ message: "FASHN returned an invalid fitting image. Please try again." }, { status: 502 });
  }

  if (isGuest) {
    return new NextResponse(new Uint8Array(resultImage), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  }

  const imageDirectory = path.resolve(process.env.PRIVATE_STORAGE_ROOT || path.join(process.cwd(), "private-storage"), "try-on-results");
  await mkdir(imageDirectory, { recursive: true });
  const imagePath = path.join(imageDirectory, `${randomBytes(24).toString("hex")}.jpg`);
  try {
    await writeFile(imagePath, resultImage, { flag: "wx", mode: 0o600 });
  } catch {
    return NextResponse.json({ message: "Could not save the generated fitting result." }, { status: 500 });
  }

  const now = new Date();
  const sessionId = randomUUID();
  try {
    const session = await prisma.$transaction(async (tx) => {
      const created = await tx.tryonsession.create({
        data: {
          tryOnSessionId: sessionId,
          userId: current!.user.id,
          digitalTwinId,
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
          processingMs: Date.now() - generationStartedAt,
          metadata: { fitPercentage: input.fitPercentage ?? null, renderer: "fashn-vton-1.5", mimeType: "image/jpeg" },
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
