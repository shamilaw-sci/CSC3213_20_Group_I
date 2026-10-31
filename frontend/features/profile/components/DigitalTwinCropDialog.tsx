"use client";

import { useRef, useState, type PointerEvent } from "react";
import { LoaderCircle, X } from "lucide-react";

import {
  getCropOutputSize,
  getCropRect,
  getMaxCropZoom,
  MIN_CROP_HEIGHT,
  MIN_CROP_WIDTH,
} from "../utils/digitalTwinCrop";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export type CropPhoto = {
  sourceUrl: string;
  fileName: string;
  width: number;
  height: number;
};

type DragStart = {
  pointerId: number;
  clientX: number;
  clientY: number;
  positionX: number;
  positionY: number;
  frameWidth: number;
  frameHeight: number;
};

interface DigitalTwinCropDialogProps {
  photo: CropPhoto;
  onCancel: () => void;
  onUpload: (file: File) => Promise<void>;
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
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
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Image cropping failed in this browser.")),
      "image/jpeg",
      0.85,
    );
  });
}

export default function DigitalTwinCropDialog({ photo, onCancel, onUpload }: DigitalTwinCropDialogProps) {
  const dragStartRef = useRef<DragStart | null>(null);
  const [positionX, setPositionX] = useState(0.5);
  const [positionY, setPositionY] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [working, setWorking] = useState<"idle" | "preparing" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);

  const maxZoom = getMaxCropZoom(photo.width, photo.height);
  const crop = getCropRect(photo.width, photo.height, zoom, positionX, positionY);
  const isWorking = working !== "idle";

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (isWorking) return;
    const frame = event.currentTarget.getBoundingClientRect();
    dragStartRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      positionX,
      positionY,
      frameWidth: frame.width,
      frameHeight: frame.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const availableX = photo.width - crop.width;
    const availableY = photo.height - crop.height;
    if (availableX > 0) {
      setPositionX(clamp(start.positionX - (event.clientX - start.clientX) * crop.width / start.frameWidth / availableX));
    }
    if (availableY > 0) {
      setPositionY(clamp(start.positionY - (event.clientY - start.clientY) * crop.height / start.frameHeight / availableY));
    }
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current?.pointerId === event.pointerId) dragStartRef.current = null;
  }

  async function uploadCroppedPhoto() {
    if (isWorking) return;
    setError(null);
    setWorking("preparing");
    try {
      const image = await loadImage(photo.sourceUrl);
      const output = getCropOutputSize(crop.width);
      const canvas = document.createElement("canvas");
      canvas.width = output.width;
      canvas.height = output.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image cropping is unavailable in this browser.");
      context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, output.width, output.height);
      const blob = await canvasToBlob(canvas);
      if (blob.size > MAX_FILE_SIZE) {
        throw new Error("The cropped photo is still over 5 MB. Please choose a smaller image.");
      }

      const baseName = photo.fileName.replace(/\.[^.]+$/, "") || "digital-twin";
      const croppedFile = new File([blob], `${baseName}-cropped.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      setWorking("uploading");
      await onUpload(croppedFile);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed. Please try again.");
      setWorking("idle");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="crop-photo-title">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="crop-photo-title" className="text-xl font-bold text-gray-900">Adjust your Digital Twin photo</h3>
            <p className="mt-1 text-sm text-gray-600">Drag to position your full body inside the portrait frame. Zoom only if your photo has enough pixels.</p>
          </div>
          <button type="button" disabled={isWorking} onClick={onCancel} aria-label="Cancel photo crop" className="rounded-full p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"><X size={20} /></button>
        </div>
        <div className="mt-5 flex flex-wrap items-start justify-center gap-6">
          <div
            className="relative aspect-[2/3] w-full max-w-[300px] touch-none overflow-hidden rounded-xl border-2 border-indigo-500 bg-gray-100 cursor-grab active:cursor-grabbing"
            role="img"
            aria-label="Adjustable Digital Twin photo crop preview"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <img
              src={photo.sourceUrl}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none select-none"
              style={{
                width: `${photo.width / crop.width * 100}%`,
                height: `${photo.height / crop.height * 100}%`,
                left: `${-crop.x / crop.width * 100}%`,
                top: `${-crop.y / crop.height * 100}%`,
              }}
            />
          </div>
          <div className="w-full max-w-xs space-y-5 text-sm text-gray-700">
            <div>
              <label htmlFor="twin-crop-zoom" className="flex justify-between font-semibold text-gray-900"><span>Zoom</span><span>{zoom.toFixed(1)}×</span></label>
              <input id="twin-crop-zoom" type="range" min="1" max={maxZoom} step="0.01" value={zoom} disabled={isWorking || maxZoom <= 1} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full accent-indigo-600 disabled:opacity-50" />
            </div>
            <div>
              <label htmlFor="twin-crop-horizontal" className="font-semibold text-gray-900">Horizontal position</label>
              <input id="twin-crop-horizontal" type="range" min="0" max="100" value={Math.round(positionX * 100)} disabled={isWorking || photo.width <= crop.width} onChange={(event) => setPositionX(Number(event.target.value) / 100)} className="mt-2 w-full accent-indigo-600 disabled:opacity-50" />
            </div>
            <div>
              <label htmlFor="twin-crop-vertical" className="font-semibold text-gray-900">Vertical position</label>
              <input id="twin-crop-vertical" type="range" min="0" max="100" value={Math.round(positionY * 100)} disabled={isWorking || photo.height <= crop.height} onChange={(event) => setPositionY(Number(event.target.value) / 100)} className="mt-2 w-full accent-indigo-600 disabled:opacity-50" />
            </div>
            <p>Source: {photo.width} × {photo.height} px</p>
            <p>Crop: {crop.width} × {crop.height} px. Minimum: {MIN_CROP_WIDTH} × {MIN_CROP_HEIGHT} px.</p>
            <p className="rounded-lg bg-indigo-50 p-3 text-indigo-900">Keep your head and feet visible. The preview shows the area that will be uploaded.</p>
          </div>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={isWorking} onClick={onCancel} className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50">Cancel</button>
          <button type="button" disabled={isWorking} onClick={() => void uploadCroppedPhoto()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-60">{isWorking && <LoaderCircle size={18} className="animate-spin" />}{working === "uploading" ? "Uploading…" : working === "preparing" ? "Preparing…" : "Use this crop"}</button>
        </div>
      </section>
    </div>
  );
}
