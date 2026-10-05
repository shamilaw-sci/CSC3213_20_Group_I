import { randomUUID } from "node:crypto"; import { NextResponse } from "next/server"; import { z } from "zod"; import { requireAuthenticatedUser } from "@/server/auth/authorization"; import { prisma } from "@/server/db/prisma";
const schema = z.object({ productId: z.string().uuid(), productVariantId: z.string().uuid().optional(), size: z.string().max(50).optional(), fitPercentage: z.number().min(0).max(100).optional() });
export async function GET() {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;

  const sessions = await prisma.tryonsession.findMany({
    where: { userId: access.user.id, status: "COMPLETED", tryonresult: { isNot: null } },
    orderBy: { createdAt: "desc" },
    include: { product: true, productvariant: true, tryonresult: true },
  });

  return NextResponse.json({
    tryOns: sessions.map((session) => ({
      id: session.tryOnSessionId,
      status: session.status,
      createdAt: session.createdAt,
      product: {
        id: session.product.productId,
        name: session.product.productName,
        image: session.product.primaryImageUrl,
      },
      size: session.productvariant?.size ?? (session.requestMetadata as { size?: string } | null)?.size ?? null,
      fitPercentage: (session.tryonresult?.metadata as { fitPercentage?: number } | null)?.fitPercentage ?? null,
    })),
  });
}
export async function POST(request: Request) { const access = await requireAuthenticatedUser(); if ("error" in access) return access.error; const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ message: "Invalid try-on request." }, { status: 400 }); const input = parsed.data; const product = await prisma.product.findFirst({ where: { productId: input.productId, status: "ACTIVE" } }); if (!product) return NextResponse.json({ message: "Product not found." }, { status: 404 }); const twin = await prisma.digitaltwin.findFirst({ where: { userId: access.user.id, status: "READY", deletedAt: null }, orderBy: { createdAt: "desc" } }); const now = new Date(); const sessionId = randomUUID(); const session = await prisma.$transaction(async (tx) => { const created = await tx.tryonsession.create({ data: { tryOnSessionId: sessionId, userId: access.user.id, digitalTwinId: twin?.digitalTwinId, productId: product.productId, productVariantId: input.productVariantId, status: "COMPLETED", requestMetadata: { size: input.size ?? null }, startedAt: now, completedAt: now, updatedAt: now } }); await tx.tryonresult.create({ data: { tryOnResultId: randomUUID(), tryOnSessionId: created.tryOnSessionId, resultImagePath: "virtual://interactive-fit-preview", metadata: { fitPercentage: input.fitPercentage ?? null, renderer: "interactive-svg" } } }); return created; }); return NextResponse.json({ tryOn: { id: session.tryOnSessionId, status: session.status, createdAt: session.createdAt } }, { status: 201 }); }
