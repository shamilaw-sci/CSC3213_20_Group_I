/** WBS-2.4 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Photo validation and upload/replace controls. */
"use client";

import { useEffect, useRef, useState } from "react";
import { ImageUp, LoaderCircle, Trash2, Upload } from "lucide-react";

import DigitalTwinCropDialog, { type CropPhoto } from "./DigitalTwinCropDialog";
import { MIN_CROP_HEIGHT, MIN_CROP_WIDTH } from "../utils/digitalTwinCrop";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PIXELS = 24_000_000;
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

export default function UploadBox({ onUpload, preview, onDeleteRequest }: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(false);
  const sourceUrlRef = useRef<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<CropPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "preparing">("idle");
  const isWorking = uploadState !== "idle";

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pendingPhoto) {
        URL.revokeObjectURL(pendingPhoto.sourceUrl);
        if (sourceUrlRef.current === pendingPhoto.sourceUrl) sourceUrlRef.current = null;
      }
    };
  }, [pendingPhoto]);

  async function handleFile(file?: File) {
    if (!file || isWorking || pendingPhoto) return;
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Please upload a PNG or JPEG image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setError("Image size must be less than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError(null);
    setUploadState("preparing");
    let sourceUrl: string | null = null;
    try {
      sourceUrl = URL.createObjectURL(file);
      sourceUrlRef.current = sourceUrl;
      const image = await loadImage(sourceUrl);
      if (!mountedRef.current) return;
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (!width || !height) throw new Error("The selected image has invalid dimensions.");
      if (width * height > MAX_PIXELS) {
        throw new Error("Image is too large. Please upload an image below 24 megapixels.");
      }
      if (width < MIN_CROP_WIDTH || height < MIN_CROP_HEIGHT) {
        throw new Error(`Image dimensions must be at least ${MIN_CROP_WIDTH} × ${MIN_CROP_HEIGHT} pixels. Cropping cannot enlarge a small photo.`);
      }

      setPendingPhoto({ sourceUrl, fileName: file.name, width, height });
      sourceUrl = null;
    } catch (reason) {
      if (mountedRef.current) {
        setError(reason instanceof Error ? reason.message : "Could not prepare this image.");
      }
    } finally {
      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
        if (sourceUrlRef.current === sourceUrl) sourceUrlRef.current = null;
      }
      if (mountedRef.current) {
        setUploadState("idle");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div>
      {preview ? (
        <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
          <img src={preview} alt="Digital twin upload preview" className="h-full max-w-full object-contain" />
        </div>
      ) : (
        <button type="button" disabled={isWorking || Boolean(pendingPhoto)} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void handleFile(event.dataTransfer.files?.[0]); }} className="flex h-72 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 transition hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60">
          {isWorking ? <LoaderCircle size={55} className="mb-5 animate-spin text-indigo-600" /> : <Upload size={55} className="mb-5 text-indigo-600" />}
          <p className="text-lg font-semibold text-gray-800">{isWorking ? "Preparing image…" : "Drag & drop or click to upload"}</p>
          <p className="mt-1 text-gray-500">PNG or JPEG · maximum 5 MB</p>
          <p className="mt-3 text-xs text-gray-400">Adjust the crop before the photo is uploaded.</p>
        </button>
      )}
      {preview && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" disabled={isWorking || Boolean(pendingPhoto)} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-60">
            {isWorking ? <LoaderCircle size={18} className="animate-spin" /> : <ImageUp size={18} />}
            {isWorking ? "Preparing photo…" : "Replace Photo"}
          </button>
          {onDeleteRequest && <button type="button" disabled={isWorking || Boolean(pendingPhoto)} onClick={onDeleteRequest} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"><Trash2 size={18} /> Delete Photo</button>}
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
      {pendingPhoto && (
        <DigitalTwinCropDialog
          photo={pendingPhoto}
          onCancel={() => { setPendingPhoto(null); setError(null); }}
          onUpload={async (file) => { await onUpload(file); setPendingPhoto(null); }}
        />
      )}
    </div>
  );
}
