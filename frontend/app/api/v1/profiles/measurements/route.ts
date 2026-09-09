/** WBS-2.2 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Measurement persistence API. */
import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";

const numberOrNull = z.number().min(0).max(300).nullable();

const measurementSchema = z.object({
  height: numberOrNull,
  weight: numberOrNull,
  chest: numberOrNull,
  waist: numberOrNull,
  hips: numberOrNull,
  shoulder: numberOrNull,
  gender: z.enum(["Female", "Male", "Unisex"]).optional(),
});

function formatGender(
  gender: string | null,
): "Female" | "Male" | "Unisex" {
  if (gender === "Female" || gender === "Male") {
    return gender;
  }
  return "Unisex";
}

function formatMeasurement(measurement: { heightCm: { toString(): string } | null; weightKg: { toString(): string } | null; chestCm: { toString(): string } | null; waistCm: { toString(): string } | null; hipsCm: { toString(): string } | null; shoulderCm: { toString(): string } | null } | null) {
  const number = (value: { toString(): string } | null) => value ? Number(value.toString()) : 0;
  return { height: number(measurement?.heightCm ?? null), weight: number(measurement?.weightKg ?? null), chest: number(measurement?.chestCm ?? null), waist: number(measurement?.waistCm ?? null), hips: number(measurement?.hipsCm ?? null), shoulder: number(measurement?.shoulderCm ?? null) };
}

export async function GET() {
  const current = await getCurrentSession();
  if (!current) {
    return NextResponse.json(
      { message: "Authentication is required." },
      { status: 401 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: current.session.userId },
    include: { measurement: true },
  });

  if (!profile) {
    return NextResponse.json(
      { message: "Profile not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    measurements: {
      ...formatMeasurement(profile.measurement),
      gender: formatGender(profile.gender),
    },
  });
}

export async function PUT(request: Request) {
  const current = await getCurrentSession();
  if (!current) {
    return NextResponse.json(
      { message: "Authentication is required." },
      { status: 401 },
    );
  }

  const parsed = measurementSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.issues[0]?.message ?? "Invalid measurement values.",
      },
      { status: 400 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: current.session.userId },
  });

  if (!profile) {
    return NextResponse.json(
      { message: "Profile not found." },
      { status: 404 },
    );
  }

  const input = parsed.data;
  const now = new Date();
  const values = {
    heightCm: input.height,
    weightKg: input.weight,
    chestCm: input.chest,
    waistCm: input.waist,
    hipsCm: input.hips,
    shoulderCm: input.shoulder,
  };

  const [measurement] = await prisma.$transaction([
    prisma.measurement.upsert({
      where: { profileId: profile.profileId },
      create: {
        measurementId: randomUUID(),
        profileId: profile.profileId,
        ...values,
        updatedAt: now,
      },
      update: {
        ...values,
        updatedAt: now,
      },
    }),
    prisma.profile.update({
      where: { profileId: profile.profileId },
      data: {
        ...(input.gender ? { gender: input.gender } : {}),
        updatedAt: now,
      },
    }),
  ]);

  return NextResponse.json({
    measurements: {
      ...formatMeasurement(measurement),
      gender: formatGender(input.gender ?? profile.gender),
    },
  });
}
