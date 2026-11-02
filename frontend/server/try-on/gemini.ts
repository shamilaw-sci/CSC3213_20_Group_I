import "server-only";

const MODEL = "gemini-2.5-flash-image";

export async function generateTryOnImage(person: Buffer, garment: Buffer, garmentMimeType: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Virtual Try-On is not configured. Set GEMINI_API_KEY.");
  const prompt = "Create a photorealistic virtual try-on image. The first image is the customer's identity and body reference; preserve their face, hair, skin tone, body shape, pose, and background. The second image is the selected garment; dress the customer in this garment, faithfully preserving its design, color, pattern, and details. Show a natural, realistic fit. Do not add text, logos, accessories, or other clothing changes.";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: person.toString("base64") } },
        { inlineData: { mimeType: garmentMimeType, data: garment.toString("base64") } },
      ] }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    }),
    signal: AbortSignal.timeout(120_000),
  });
  const payload = await response.json().catch(() => null) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }>;
  } | null;
  if (!response.ok) throw new Error(payload?.error?.message || "Gemini could not generate the fitting image.");
  const output = payload?.candidates?.flatMap((candidate) => candidate.content?.parts ?? []).find((part) => part.inlineData?.data)?.inlineData;
  if (!output?.data || !["image/png", "image/jpeg", "image/webp"].includes(output.mimeType ?? "")) throw new Error("Gemini did not return a supported fitting image.");
  return { buffer: Buffer.from(output.data, "base64"), mimeType: output.mimeType! };
}
