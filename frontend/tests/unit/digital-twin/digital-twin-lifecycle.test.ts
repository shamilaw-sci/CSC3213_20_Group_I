import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  profileFindUnique: vi.fn(),
  createTwin: vi.fn(),
  updateTwin: vi.fn(),
  transaction: vi.fn(),
  transactionFindMany: vi.fn(),
  transactionUpdateMany: vi.fn(),
  transactionUpdate: vi.fn(),
  processImage: vi.fn(),
  storagePath: vi.fn(),
  saveEncryptedTwin: vi.fn(),
  removeEncryptedTwin: vi.fn(),
  createSignedUrl: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/server/auth/authorization", () => ({
  requireAuthenticatedUser:
    mocks.requireAuthenticatedUser,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    profile: {
      findUnique: mocks.profileFindUnique,
    },
    digitaltwin: {
      create: mocks.createTwin,
      update: mocks.updateTwin,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/server/images/digital-twin-image", () => {
  class DigitalTwinImageError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "DigitalTwinImageError";
    }
  }

  return {
    DigitalTwinImageError,
    processDigitalTwinImage: mocks.processImage,
  };
});

vi.mock("@/server/storage/digital-twin-storage", () => ({
  digitalTwinStoragePath: mocks.storagePath,
  saveEncryptedTwin: mocks.saveEncryptedTwin,
  removeEncryptedTwin: mocks.removeEncryptedTwin,
}));

vi.mock("@/server/storage/digital-twin-signed-url", () => ({
  createSignedDigitalTwinImageUrl:
    mocks.createSignedUrl,
}));

import { POST } from "../../../app/api/v1/digital-twins/current/route";
import { DigitalTwinImageError } from "@/server/images/digital-twin-image";

const PROCESSED_IMAGE = Buffer.from("processed-image");

function uploadRequest() {
  const formData = new FormData();
  formData.set(
    "image",
    new File(
      [new Uint8Array([0xff, 0xd8, 0xff, 0x00])],
      "digital-twin.jpg",
      { type: "image/jpeg" },
    ),
  );

  return new Request(
    "http://localhost/api/v1/digital-twins/current",
    {
      method: "POST",
      body: formData,
    },
  );
}

describe("Digital Twin upload lifecycle", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.DATA_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    process.env.DIGITAL_TWIN_URL_SIGNING_SECRET = "test-digital-twin-signing-secret-012345678901";

    mocks.requireAuthenticatedUser.mockResolvedValue({
      user: {
        id: "user-123",
        role: "CUSTOMER",
      },
    });
    mocks.profileFindUnique.mockResolvedValue({
      profileId: "profile-123",
      measurement: null,
    });
    mocks.storagePath.mockImplementation(
      (twinId: string) => `private/${twinId}.bin`,
    );
    mocks.processImage.mockResolvedValue({
      buffer: PROCESSED_IMAGE,
      contentType: "image/jpeg",
      width: 800,
      height: 1200,
      size: PROCESSED_IMAGE.length,
    });
    mocks.saveEncryptedTwin.mockResolvedValue(
      "private/twin.bin",
    );
    mocks.createTwin.mockResolvedValue({});
    mocks.updateTwin.mockResolvedValue({});
    mocks.transactionFindMany.mockResolvedValue([]);
    mocks.transactionUpdateMany.mockResolvedValue({
      count: 0,
    });
    mocks.transactionUpdate.mockImplementation(
      ({ where }: { where: { digitalTwinId: string } }) => ({
        digitalTwinId: where.digitalTwinId,
        status: "READY",
        createdAt: new Date(
          "2026-09-12T10:00:00.000Z",
        ),
      }),
    );
    mocks.transaction.mockImplementation(
      async (
        callback: (transactionClient: unknown) => unknown,
      ) =>
        callback({
          digitaltwin: {
            findMany: mocks.transactionFindMany,
            updateMany: mocks.transactionUpdateMany,
            update: mocks.transactionUpdate,
          },
        }),
    );
    mocks.removeEncryptedTwin.mockResolvedValue(undefined);
    mocks.createSignedUrl.mockReturnValue(
      "/api/signed-digital-twin-image",
    );
  });

  it("moves a successful upload from PROCESSING to READY", async () => {
    const response = await POST(uploadRequest());
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(mocks.createTwin).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-123",
        status: "PROCESSING",
        processingError: null,
      }),
    });

    const processingRecord =
      mocks.createTwin.mock.calls[0][0].data;

    expect(mocks.processImage).toHaveBeenCalledTimes(1);
    expect(mocks.saveEncryptedTwin).toHaveBeenCalledWith(
      processingRecord.digitalTwinId,
      PROCESSED_IMAGE,
    );
    expect(mocks.transactionUpdate).toHaveBeenCalledWith({
      where: {
        digitalTwinId: processingRecord.digitalTwinId,
      },
      data: expect.objectContaining({
        status: "READY",
        processingError: null,
      }),
    });
    expect(body).toMatchObject({
      twin: {
        id: processingRecord.digitalTwinId,
        status: "READY",
        imageUrl: "/api/signed-digital-twin-image",
      },
      cleanupPending: false,
    });
  });

  it("records a validation failure as FAILED", async () => {
    mocks.processImage.mockRejectedValue(
      new DigitalTwinImageError(
        "Image dimensions are too small.",
      ),
    );

    const response = await POST(uploadRequest());
    const body = await response.json();
    const processingRecord =
      mocks.createTwin.mock.calls[0][0].data;

    expect(response.status).toBe(400);
    expect(body).toEqual({
      message: "Image dimensions are too small.",
    });
    expect(mocks.updateTwin).toHaveBeenCalledWith({
      where: {
        digitalTwinId: processingRecord.digitalTwinId,
      },
      data: expect.objectContaining({
        status: "FAILED",
        processingError:
          "Image dimensions are too small.",
      }),
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.removeEncryptedTwin).toHaveBeenCalledWith(
      processingRecord.encryptedImagePath,
    );
  });

  it("records an unexpected storage failure safely", async () => {
    mocks.saveEncryptedTwin.mockRejectedValue(
      new Error("Sensitive internal storage error"),
    );

    const response = await POST(uploadRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      message: "Digital Twin image processing failed.",
    });
    expect(JSON.stringify(body)).not.toContain(
      "Sensitive internal storage error",
    );
    expect(mocks.updateTwin).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "FAILED",
          processingError:
            "Digital Twin image processing failed.",
        }),
      }),
    );
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("keeps a successful new twin when old-file cleanup fails", async () => {
    mocks.transactionFindMany.mockResolvedValue([
      {
        encryptedImagePath: "private/old-twin.bin",
        previewImagePath: null,
      },
    ]);
    mocks.removeEncryptedTwin.mockRejectedValue(
      new Error("Temporary cleanup failure"),
    );

    const response = await POST(uploadRequest());
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.cleanupPending).toBe(true);
    expect(body.twin.status).toBe("READY");
    expect(mocks.updateTwin).not.toHaveBeenCalled();
  });
});
