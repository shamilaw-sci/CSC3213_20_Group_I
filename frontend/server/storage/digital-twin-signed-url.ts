import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

const DEFAULT_TTL_SECONDS = 15 * 60;
const MAX_TTL_SECONDS = 60 * 60;

interface CreateSignedUrlOptions {
  digitalTwinId: string;
  userId: string;
  ttlSeconds?: number;
  now?: number;
}

interface VerifySignedUrlOptions {
  digitalTwinId: string;
  userId: string;
  expires: string | null;
  signature: string | null;
  now?: number;
}

function signingSecret() {
  const secret =
    process.env.DIGITAL_TWIN_URL_SIGNING_SECRET;

  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(
      "DIGITAL_TWIN_URL_SIGNING_SECRET must contain at least 32 bytes.",
    );
  }

  return secret;
}

function signaturePayload(
  digitalTwinId: string,
  userId: string,
  expiresAt: number,
) {
  return `v1:${digitalTwinId}:${userId}:${expiresAt}`;
}

function createSignature(
  digitalTwinId: string,
  userId: string,
  expiresAt: number,
) {
  return createHmac("sha256", signingSecret())
    .update(
      signaturePayload(
        digitalTwinId,
        userId,
        expiresAt,
      ),
    )
    .digest("hex");
}

export function createSignedDigitalTwinImageUrl({
  digitalTwinId,
  userId,
  ttlSeconds = DEFAULT_TTL_SECONDS,
  now = Date.now(),
}: CreateSignedUrlOptions) {
  if (
    !Number.isInteger(ttlSeconds) ||
    ttlSeconds < 60 ||
    ttlSeconds > MAX_TTL_SECONDS
  ) {
    throw new Error(
      "Signed URL lifetime must be between 60 and 3600 seconds.",
    );
  }

  const expiresAt =
    Math.floor(now / 1000) + ttlSeconds;

  const signature = createSignature(
    digitalTwinId,
    userId,
    expiresAt,
  );

  const query = new URLSearchParams({
    expires: String(expiresAt),
    signature,
  });

  return (
    `/api/v1/digital-twins/` +
    `${encodeURIComponent(digitalTwinId)}/image?${query}`
  );
}

export function verifySignedDigitalTwinImageUrl({
  digitalTwinId,
  userId,
  expires,
  signature,
  now = Date.now(),
}: VerifySignedUrlOptions) {
  if (
    !expires ||
    !signature ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expiresAt = Number(expires);
  const currentTime = Math.floor(now / 1000);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt < currentTime ||
    expiresAt > currentTime + MAX_TTL_SECONDS
  ) {
    return false;
  }

  const expectedSignature = createSignature(
    digitalTwinId,
    userId,
    expiresAt,
  );

  return timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(signature, "hex"),
  );
}