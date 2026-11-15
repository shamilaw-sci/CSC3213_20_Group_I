import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ tryOnId: string }> }) {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;
  const { tryOnId } = await context.params;
  if (!z.string().uuid().safeParse(tryOnId).success) return NextResponse.json({ message: "Invalid try-on ID." }, { status: 400 });
  const result = await prisma.tryonresult.findFirst({ where: { tryonsession: { tryOnSessionId: tryOnId, userId: access.user.id } }, select: { resultImagePath: true } });
  if (!result || result.resultImagePath.startsWith("virtual://")) return NextResponse.json({ message: "Try-On image not found." }, { status: 404 });
  try {
    const image = await readFile(result.resultImagePath);
    return new NextResponse(image, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return NextResponse.json({ message: "Try-On image is unavailable." }, { status: 404 });
  }
}
