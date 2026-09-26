import "server-only";

import { NextResponse } from "next/server";

import type { merchantModel } from "@/app/generated/prisma/models";
import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

type CurrentMerchantResult =
  | { error: NextResponse }
  | {
      merchant: merchantModel;
    };

export async function requireCurrentMerchant(): Promise<CurrentMerchantResult> {
  const access = await requireAuthenticatedUser();

  if ("error" in access) {
    return access;
  }

  const merchant = await prisma.merchant.findUnique({
    where: { userId: access.user.id },
  });

  if (!merchant) {
    return {
      error: NextResponse.json(
        { message: "Create a merchant profile before managing catalog products." },
        { status: 404 },
      ),
    };
  }

  return { merchant };
}
