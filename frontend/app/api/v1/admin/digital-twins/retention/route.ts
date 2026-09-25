import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { purgeExpiredDigitalTwins } from "@/server/storage/digital-twin-retention";

export const runtime = "nodejs";

export async function POST() {
  const access = await requireAuthenticatedUser(["ADMIN"]);

  if ("error" in access) {
    return access.error;
  }

  try {
    const cleanup = await purgeExpiredDigitalTwins();

    return NextResponse.json(
      {
        message:
          cleanup.failed > 0
            ? "Retention cleanup completed with some failures."
            : "Retention cleanup completed successfully.",
        cleanup,
      },
      {
        status: cleanup.failed > 0 ? 207 : 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "Digital Twin retention cleanup could not be completed.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
