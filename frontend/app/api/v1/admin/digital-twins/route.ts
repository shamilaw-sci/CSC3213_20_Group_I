import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";

const TWIN_STATUSES = [
  "PROCESSING",
  "READY",
  "FAILED",
  "DELETED",
] as const;

type TwinStatus = (typeof TWIN_STATUSES)[number];

function isTwinStatus(value: string): value is TwinStatus {
  return TWIN_STATUSES.includes(value as TwinStatus);
}

export async function GET(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);

  if ("error" in access) {
    return access.error;
  }

  const { searchParams } = new URL(request.url);
  const statusParameter = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? "1");
  const requestedLimit = Number(searchParams.get("limit") ?? "20");

  if (statusParameter && !isTwinStatus(statusParameter)) {
    return NextResponse.json(
      {
        message:
          "Status must be PROCESSING, READY, FAILED, or DELETED.",
      },
      { status: 400 },
    );
  }

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1
  ) {
    return NextResponse.json(
      { message: "Page and limit must be positive integers." },
      { status: 400 },
    );
  }

  const limit = Math.min(requestedLimit, 100);
  const where = statusParameter
    ? { status: statusParameter }
    : {};

  const [twins, total, groupedStatuses] = await prisma.$transaction([
    prisma.digitaltwin.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        digitalTwinId: true,
        status: true,
        processingError: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        user: {
          select: {
            userId: true,
            userName: true,
            userEmail: true,
          },
        },
      },
    }),
    prisma.digitaltwin.count({ where }),
    prisma.digitaltwin.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const summary: Record<TwinStatus, number> = {
    PROCESSING: 0,
    READY: 0,
    FAILED: 0,
    DELETED: 0,
  };

  for (const group of groupedStatuses) {
    summary[group.status] = group._count._all;
  }

  return NextResponse.json({
    twins: twins.map((twin) => ({
      id: twin.digitalTwinId,
      status: twin.status,
      processingError: twin.processingError,
      createdAt: twin.createdAt,
      updatedAt: twin.updatedAt,
      deletedAt: twin.deletedAt,
      user: {
        id: twin.user.userId,
        name: twin.user.userName,
        email: twin.user.userEmail,
      },
    })),
    summary,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}