/** WBS-2.4 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Photo validation and upload/replace controls. */
"use client";

import { useRef, useState } from "react";
import { ImageUp, LoaderCircle, Trash2, Upload } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PIXELS = 24_000_000;
const MAX_WIDTH = 3000;
const MAX_HEIGHT = 4000;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);

interface UploadBoxProps {
  onUpload: (file: File) => void | Promise<void>;
  preview?: string | null;
  onDeleteRequest?: () => void;
}

function loadImage(sourceUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read the selected image."));
    image.src = sourceUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image resizing failed.")), "image/jpeg", 0.85);
  });
}

/** Reads a bounded image, then creates one smaller JPEG for the browser preview. */
async function preparePreviewImage(file: File) {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(sourceUrl);
    const pixels = image.naturalWidth * image.naturalHeight;

    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error("The selected image has invalid dimensions.");
    }
    if (pixels > MAX_PIXELS) {
      throw new Error("Image is too large. Please upload an image below 24 megapixels.");
    }

    const scale = Math.min(1, MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image resizing is unavailable in this browser.");

    context.drawImage(image, 0, 0, width, height);
    const resized = await canvasToBlob(canvas);
    const baseName = file.name.replace(/\.[^.]+$/, "") || "digital-twin";
    return new File([resized], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export default function UploadBox({ onUpload, preview, onDeleteRequest }: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "preparing" | "uploading">("idle");
  const isWorking = uploadState !== "idle";

  async function handleFile(file?: File) {
    if (!file || isWorking) return;
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Please upload a PNG or JPEG image.");
      return;
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setError(null);
    setUploadState("preparing");
    try {
      const preparedFile = await preparePreviewImage(file);
      setUploadState("uploading");
      await onUpload(preparedFile);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed. Please try again.");
    } finally {
      setUploadState("idle");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      {preview ? (
        <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
          <img src={preview} alt="Digital twin upload preview" className="h-full max-w-full object-contain" />
        </div>
      ) : (
        <button type="button" disabled={isWorking} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void handleFile(event.dataTransfer.files?.[0]); }} className="flex h-72 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 transition hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60">
          {isWorking ? <LoaderCircle size={55} className="mb-5 animate-spin text-indigo-600" /> : <Upload size={55} className="mb-5 text-indigo-600" />}
          <p className="text-lg font-semibold text-gray-800">{uploadState === "preparing" ? "Preparing image…" : uploadState === "uploading" ? "Uploading photo…" : "Drag & drop or click to upload"}</p>
          <p className="mt-1 text-gray-500">PNG or JPEG · maximum 5 MB</p>
          <p className="mt-3 text-xs text-gray-400">The selected image is checked before upload.</p>
        </button>
      )}
      {preview && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" disabled={isWorking} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-60">
            {isWorking ? <LoaderCircle size={18} className="animate-spin" /> : <ImageUp size={18} />}
            {uploadState === "preparing" ? "Preparing photo…" : uploadState === "uploading" ? "Replacing photo…" : "Replace Photo"}
          </button>
          {onDeleteRequest && <button type="button" disabled={isWorking} onClick={onDeleteRequest} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"><Trash2 size={18} /> Delete Photo</button>}
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
    </div>
  );
}
