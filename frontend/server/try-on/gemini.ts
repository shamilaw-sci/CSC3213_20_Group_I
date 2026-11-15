import "server-only";

import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.1-flash-image";

export class GeminiTryOnError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "GeminiTryOnError";
  }
}

export async function generateTryOnImage(person: Buffer, garment: Buffer) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiTryOnError("Virtual Try-On is not configured. Set GEMINI_API_KEY.", 503);

  const prompt = [
    "Create one photorealistic virtual try-on image using the two reference images.",
    "Image 1 is the customer and is the identity reference. Keep the same person, face, hairstyle, skin tone, body proportions, pose, and background as closely as possible.",
    "Image 2 is the selected garment. Dress the person in this exact garment, preserving its original color, cut, pattern, sleeves, neckline, material, and other identifying details.",
    "Fit the garment naturally to the person's body and pose, with realistic fabric folds, lighting, and shadows.",
    "Do not change the person's identity or add accessories, text, logos, extra clothing, or other scene elements.",
    "Return an edited image, not a description or a collage.",
  ].join(" ");

  const client = new GoogleGenAI({ apiKey });
  let response;
  try {
    response = await client.models.generateContent({
      model: MODEL,
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: person.toString("base64") } },
          { inlineData: { mimeType: "image/jpeg", data: garment.toString("base64") } },
        ],
      }],
      config: { responseModalities: ["IMAGE", "TEXT"] },
    });
  } catch (error) {
    const rawDetail = error instanceof Error ? error.message : "Gemini request failed.";
    const detail = rawDetail.replaceAll(apiKey, "[redacted]").slice(0, 500);
    const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
      ? error.status
      : 502;
    const providerCode = typeof error === "object" && error !== null && "code" in error ? String(error.code).slice(0, 80) : "unknown";
    console.error("Gemini try-on request failed", { status, providerCode, detail });

    if (/free tier is not available for this project|project-unavailable|set up billing/i.test(detail)) {
      throw new GeminiTryOnError("Gemini image generation is not enabled for this project. Check the billing and model access for the Google AI project linked to GEMINI_API_KEY.", 503);
    }
    if (/free.?tier.*limit:\s*0|limit:\s*0.*free.?tier|free_tier_(input_token_count|requests)/i.test(detail)) {
      throw new GeminiTryOnError("This Gemini image model has no available Free Tier quota for this project. Check the project's Gemini API billing and quota.", 503);
    }
    if (status === 401 || status === 403) {
      throw new GeminiTryOnError("Gemini rejected the API key or this project does not have access to image generation. Check GEMINI_API_KEY and project access.", 503);
    }
    if (status === 429 || /RESOURCE_EXHAUSTED|rate.?limit|quota/i.test(detail)) {
      throw new GeminiTryOnError("Gemini quota or rate limit reached. Check the project's model quota and try again later.", 429);
    }
    if (status === 400) {
      throw new GeminiTryOnError("Gemini rejected the try-on request. Check the frontend server terminal for its diagnostic.", 502);
    }
    throw new GeminiTryOnError("Gemini image generation failed. Check the frontend server terminal for its diagnostic.", status >= 500 ? status : 502);
  }

  const output = response.candidates?.flatMap((candidate) => candidate.content?.parts ?? []).find((part) => part.inlineData?.data)?.inlineData;
  if (!output?.data || !["image/png", "image/jpeg", "image/webp"].includes(output.mimeType ?? "")) {
    const finishReason = response.candidates?.map((candidate) => candidate.finishReason).filter(Boolean).join(", ");
    if (finishReason) console.error("Gemini returned no try-on image", { finishReason });
    throw new GeminiTryOnError("Gemini did not return a supported fitting image. Check the frontend server terminal for its diagnostic.", 502);
  }
  return { buffer: Buffer.from(output.data, "base64"), mimeType: output.mimeType! };
}
