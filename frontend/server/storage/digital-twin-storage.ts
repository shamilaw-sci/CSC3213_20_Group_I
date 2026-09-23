/** WBS-2.6 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Encrypted private Digital Twin storage. */
import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

function encryptionKey() {
  const configured = process.env.DATA_ENCRYPTION_KEY;
  if (!configured) throw new Error("DATA_ENCRYPTION_KEY is missing.");
  const key = /^[a-f0-9]{64}$/i.test(configured) ? Buffer.from(configured, "hex") : Buffer.from(configured, "base64");
  if (key.length !== 32) throw new Error("DATA_ENCRYPTION_KEY must be a 32-byte Base64 or 64-character hexadecimal value.");
  return key;
}

function storageDirectory() {
  return path.resolve(process.env.PRIVATE_STORAGE_ROOT || path.join(process.cwd(), "private-storage"), "digital-twins");
}

export function digitalTwinStoragePath(
  twinId: string,
) {
  return path.join(
    storageDirectory(),
    `${twinId}.bin`,
  );
}

export async function saveEncryptedTwin(twinId: string, image: Buffer) {
  const directory = storageDirectory();
  await mkdir(directory, { recursive: true });
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(image), cipher.final()]);
  const payload = Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
  const filePath = digitalTwinStoragePath(twinId);
  await writeFile(filePath, payload, { flag: "wx" });
  return filePath;
}

export async function readEncryptedTwin(filePath: string) {
  const payload = await readFile(filePath);
  if (payload.length < 29) throw new Error("Stored digital-twin image is invalid.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), payload.subarray(0, 12));
  decipher.setAuthTag(payload.subarray(12, 28));
  return Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]);
}

export async function removeEncryptedTwin(filePath: string) {
  await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}
