import { NextResponse } from "next/server";
import { z } from "zod";

import { syncMerchantJsonFeed } from "@/server/integrations/merchants/json-feed";
import { requireCurrentMerchant } from "@/server/merchant/current-merchant";

const schema = z.object({
  feedUrl: z.string().url().max(2048),
});

export async function POST(request: Request) {
  const access = await requireCurrentMerchant();
  if (!("merchant" in access)) return access.error;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "A valid feed URL is required." }, { status: 400 });
  }

  const result = await syncMerchantJsonFeed(access.merchant, parsed.data.feedUrl);
  return NextResponse.json({ sync: result });
}
