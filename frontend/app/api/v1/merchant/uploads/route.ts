import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireCurrentMerchant } from "@/server/merchant/current-merchant";

export const runtime = "nodejs";
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
export async function POST(request: Request) {
  const access = await requireCurrentMerchant(); if (!("merchant" in access)) return access.error;
  const form = await request.formData(); const image = form.get("image");
  if (!(image instanceof File) || !allowed.has(image.type) || image.size > 5 * 1024 * 1024) return NextResponse.json({ message: "Upload a JPG, PNG, or WebP image under 5 MB." }, { status: 400 });
  const extension = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
  const directory = path.join(process.cwd(), "public", "uploads", "products"); await mkdir(directory, { recursive: true });
  const filename = `${access.merchant!.merchantId}-${randomUUID()}.${extension}`; await writeFile(path.join(directory, filename), Buffer.from(await image.arrayBuffer()));
  return NextResponse.json({ imageUrl: `/uploads/products/${filename}` }, { status: 201 });
}
