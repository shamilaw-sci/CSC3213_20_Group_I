import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("server-only", () => ({}));

import {
  digitalTwinStoragePath,
  readEncryptedTwin,
  removeEncryptedTwin,
  saveEncryptedTwin,
} from "../../../server/storage/digital-twin-storage";

describe("Digital Twin encrypted storage", () => {
  let testStorageRoot = "";

  beforeEach(async () => {
    testStorageRoot = await mkdtemp(
      path.join(tmpdir(), "tryvora-twin-storage-"),
    );

    vi.stubEnv(
      "DATA_ENCRYPTION_KEY",
      "a".repeat(64),
    );
    vi.stubEnv(
      "PRIVATE_STORAGE_ROOT",
      testStorageRoot,
    );
  });

  afterEach(async () => {
    if (testStorageRoot) {
      await rm(testStorageRoot, {
        recursive: true,
        force: true,
      });
    }

    vi.unstubAllEnvs();
  });

  it("encrypts image bytes before writing them", async () => {
    const originalImage = Buffer.from(
      "private-digital-twin-image-bytes",
    );

    const filePath = await saveEncryptedTwin(
      "twin-encrypted",
      originalImage,
    );

    expect(filePath).toBe(
      path.join(
        testStorageRoot,
        "digital-twins",
        "twin-encrypted.bin",
      ),
    );
    expect(digitalTwinStoragePath("twin-encrypted")).toBe(
      filePath,
    );

    const storedBytes = await readFile(filePath);

    expect(storedBytes.equals(originalImage)).toBe(false);
    expect(storedBytes.includes(originalImage)).toBe(false);

    const decryptedImage = await readEncryptedTwin(filePath);

    expect(decryptedImage.equals(originalImage)).toBe(true);
  });

  it("rejects an encrypted file that was modified", async () => {
    const filePath = await saveEncryptedTwin(
      "twin-tampered",
      Buffer.from("private-image"),
    );
    const storedBytes = await readFile(filePath);

    storedBytes[storedBytes.length - 1] ^= 0xff;
    await writeFile(filePath, storedBytes);

    await expect(
      readEncryptedTwin(filePath),
    ).rejects.toThrow();
  });

  it("rejects decryption with a different key", async () => {
    const filePath = await saveEncryptedTwin(
      "twin-wrong-key",
      Buffer.from("private-image"),
    );

    vi.stubEnv(
      "DATA_ENCRYPTION_KEY",
      "b".repeat(64),
    );

    await expect(
      readEncryptedTwin(filePath),
    ).rejects.toThrow();
  });

  it("removes an encrypted file idempotently", async () => {
    const filePath = await saveEncryptedTwin(
      "twin-delete",
      Buffer.from("private-image"),
    );

    await removeEncryptedTwin(filePath);

    await expect(readFile(filePath)).rejects.toMatchObject({
      code: "ENOENT",
    });
    await expect(
      removeEncryptedTwin(filePath),
    ).resolves.toBeUndefined();
  });
});
