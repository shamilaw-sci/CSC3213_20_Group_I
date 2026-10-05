import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
export async function GET() { const categories = await prisma.category.findMany({ orderBy: { name: "asc" } }); return NextResponse.json({ categories: categories.map((category) => ({ id: category.categoryId, name: category.name, slug: category.slug })) }); }
