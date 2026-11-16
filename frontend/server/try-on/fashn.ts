import "server-only";

import { Client, handle_file } from "@gradio/client";

const SPACE = "fashn-ai/fashn-vton-1.5";
const SPACE_IMAGE_ORIGIN = "https://fashn-ai-fashn-vton-1-5.hf.space";
const API_NAME = "/try_on";
const REQUEST_TIMEOUT_MS = 240_000;
const MAX_RESULT_BYTES = 20 * 1024 * 1024;

export class FashnTryOnError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "FashnTryOnError";
  }
}

function outputImageUrl(output: unknown) {
  if (typeof output === "string" && output.startsWith("data:image/")) return output;
  if (!output || typeof output !== "object") return null;

  const file = output as { url?: unknown; path?: unknown };
  if (typeof file.url === "string") {
    try {
      const url = new URL(file.url, SPACE_IMAGE_ORIGIN);
      if (url.origin === SPACE_IMAGE_ORIGIN) return url.toString();
    } catch {
      return null;
    }
  }

  if (typeof file.path === "string" && file.path.length > 0) {
    const path = file.path.startsWith("/") ? file.path : `/${file.path}`;
    return new URL(`/gradio_api/file=${path}`, SPACE_IMAGE_ORIGIN).toString();
  }

  return null;
}

async function readImageOutput(output: unknown, token: string, signal: AbortSignal) {
  if (typeof output === "string" &&  output.startsWith("data:image/")) {
   const match = output.match(/^data:(image\/(?:png|jpeg|webp));base64,([\s\S]+)$/);
    if (!match) throw new FashnTryOnError("FASHN returned an unsupported image format.", 502);
    return { buffer: Buffer.from(match[2], "base64"), mimeType: match[1] };
  }

  const url = outputImageUrl(output);
  if (!url) throw new FashnTryOnError("FASHN did not return a try-on image. Please try again.", 502);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  if (!response.ok) throw new FashnTryOnError("Could not download the generated try-on image from Hugging Face.", 502);

  const mimeType = response.headers.get("content-type")?.split(";")[0] ?? "";
  if (!["image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
    throw new FashnTryOnError("FASHN returned an unsupported image format.", 502);
  }
  const declaredSize = Number(response.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_RESULT_BYTES) throw new FashnTryOnError("FASHN returned an image that is too large.", 502);

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length || buffer.length > MAX_RESULT_BYTES) {
    throw new FashnTryOnError("FASHN returned an invalid try-on image.", 502);
  }
  return { buffer, mimeType };
}

export async function generateTryOnImage(
  person: Buffer,
  garment: Buffer,
  category: "tops" | "bottoms" | "one-pieces",
) {
  const token = process.env.HF_TOKEN?.trim();
  if (!token) throw new FashnTryOnError("Virtual Try-On is not configured. Add HF_TOKEN to frontend/.env.local and restart the server.", 503);
  if (!token.startsWith("hf_")) throw new FashnTryOnError("HF_TOKEN is not a valid Hugging Face token.", 503);

  let client: Client | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const controller = new AbortController();

  try {
    const generation = (async () => {
      const connected = await Client.connect(SPACE, { token: token as `hf_${string}`, record_history: false });
      client = connected;
      const api = await connected.view_api();
      const endpoint = api.named_endpoints[API_NAME];
      const expectedParameters = [
        "person_image",
        "garment_image",
        "category",
        "garment_photo_type",
        "num_timesteps",
        "guidance_scale",
        "seed",
        "segmentation_free",
      ];
      if (
        !endpoint ||
        endpoint.parameters.map((parameter) => parameter.parameter_name).join(",") !== expectedParameters.join(",") ||
        endpoint.returns.length !== 1
      ) {
        throw new FashnTryOnError("The FASHN Space API changed and is not compatible with this integration.", 502);
      }

      const result = await connected.predict(API_NAME, [
        handle_file(person),
        handle_file(garment),
        category,
        "model",
        50,
        1.5,
        42,
        true,
      ]);
      if (!Array.isArray(result.data) || result.data.length !== 1 || !result.data[0]) {
        throw new FashnTryOnError("FASHN could not generate a try-on image. Please try again.", 502);
      }

      return await readImageOutput(result.data[0], token, controller.signal);
    })();

    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new FashnTryOnError("Virtual Try-On timed out while waiting for the FASHN Space. Please try again shortly.", 504));
      }, REQUEST_TIMEOUT_MS);
    });

    return await Promise.race([generation, timeout]);
  } catch (error) {
    if (error instanceof FashnTryOnError) throw error;
    const detail = error instanceof Error ? error.message.toLowerCase() : "";
    if (/401|403|not authorized|invalid.*token/.test(detail)) {
      throw new FashnTryOnError("Hugging Face rejected HF_TOKEN or access to the FASHN Space.", 503);
    }
    if (/429|rate.?limit|too many requests/.test(detail)) {
      throw new FashnTryOnError("The FASHN Space is busy or rate-limited. Please try again shortly.", 429);
    }
    if (/timeout|timed out|abort/.test(detail)) {
      throw new FashnTryOnError("Virtual Try-On timed out while waiting for the FASHN Space. Please try again shortly.", 504);
    }
    throw new FashnTryOnError("FASHN could not generate the fitting image. Please try again shortly.", 502);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    controller.abort();
    client?.close();
  }
}
