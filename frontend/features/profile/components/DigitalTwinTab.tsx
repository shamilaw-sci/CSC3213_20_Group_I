/** WBS-2.4 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Digital Twin photo management UI. */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Lightbulb, LoaderCircle, Shirt, Sparkles, X } from "lucide-react";

import { useTryOn } from "@/features/try-on/hooks/useTryOn";
import { useProfile } from "../hooks/useProfile";
import PhotoGuidelines from "./PhotoGuidelines";
import UploadBox from "./UploadBox";

export default function DigitalTwinTab() {
  const { profile, uploadImage, removeImage } = useProfile();
  const tryOn = useTryOn();
  const { openTryOn } = tryOn;
  const guidelinesRef = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  useEffect(() => {
    async function loadTwin() {
      try {
        const response = await fetch("/api/v1/digital-twins/current", { cache: "no-store" });
        if (!response.ok) {
          setError("Could not load your Digital Twin photo. Please try again.");
          return;
        }
        const result = await response.json() as { twin?: { imageUrl: string } | null };
        if (result.twin) uploadImage(result.twin.imageUrl);
      } catch {
        setError("Could not load your Digital Twin photo. Please try again.");
      }
    }
    void loadTwin();
  // Load the saved twin once; uploadImage is a context action recreated on renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!guidelinesOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !guidelinesRef.current?.contains(event.target)) {
        setGuidelinesOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setGuidelinesOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [guidelinesOpen]);

  async function handleUpload(file: File) {
    setError("");
    const formData = new FormData();
    formData.set("image", file);
    const response = await fetch("/api/v1/digital-twins/current", { method: "POST", body: formData });
    const result = await response.json().catch(() => ({})) as { message?: string; twin?: { imageUrl: string } };
    if (!response.ok || !result.twin) throw new Error(result.message ?? "Could not save your digital twin.");
    uploadImage(result.twin.imageUrl);
  }

  async function handleRemove() {
    setError("");
    setIsDeleting(true);
    try {
      const response = await fetch("/api/v1/digital-twins/current", { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { message?: string };
        setError(result.message ?? "Could not delete your Digital Twin photo.");
        return;
      }
      removeImage();
      setDeleteDialogOpen(false);
    } catch {
      setError("Could not delete your Digital Twin photo. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const selectedOutfit = tryOn.state?.selectedProduct ?? null;
  const hasAvailableSize = selectedOutfit?.availableSizes === undefined
    || selectedOutfit.availableSizes.length > 0;
  const canGenerate = Boolean(selectedOutfit && profile.digitalTwin.image && hasAvailableSize);

  return (
    <div className="space-y-5">
      <div><h2 className="text-3xl font-bold text-gray-900">Digital Twin</h2><p className="mt-2 text-gray-500">Manage your full-body photo, then choose an outfit in Explore for an illustrative fitting preview.</p></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Choose an outfit in Explore</h3>
          <div className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 text-center">
            {selectedOutfit ? <>
              <div className="relative aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-2xl bg-gray-100">
                <Image src={selectedOutfit.image} alt={selectedOutfit.title} fill unoptimized className="object-cover" sizes="220px" />
              </div>
              <div className="mt-3 flex items-center gap-2"><p className="text-lg font-bold text-gray-900">{selectedOutfit.title}</p><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">Outfit Added</span></div>
              <Link href="/explore" className="mt-3 text-sm font-semibold text-indigo-700 hover:underline">Change Outfit</Link>
            </> : <>
              <Shirt size={42} className="text-indigo-600" aria-hidden="true" />
              <p className="mt-3 max-w-sm font-semibold text-gray-900">Browse Explore and choose a dress using its Try On action. Your selected dress will appear here.</p>
              <Link href="/explore" className="mt-5 rounded-xl border border-indigo-600 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Browse Explore</Link>
            </>}
          </div>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Your Photo</h3>
            <div ref={guidelinesRef} className="relative">
              <button type="button" aria-label="Photo guidelines" aria-expanded={guidelinesOpen} aria-controls="digital-twin-photo-guidelines" onClick={() => setGuidelinesOpen((open) => !open)} className="rounded-full border border-indigo-100 bg-indigo-50 p-2 text-indigo-700 shadow-sm transition hover:bg-indigo-100 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <Lightbulb size={20} />
              </button>
              {guidelinesOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="photo-guidelines-title" onClick={() => setGuidelinesOpen(false)}><div id="digital-twin-photo-guidelines" onClick={(event) => event.stopPropagation()}><PhotoGuidelines modal /><button type="button" onClick={() => setGuidelinesOpen(false)} aria-label="Close photo guidelines" className="absolute right-6 top-6 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:bg-white focus-visible:outline-2 focus-visible:outline-indigo-600"><X size={20} /></button><button type="button" onClick={() => setGuidelinesOpen(false)} className="mx-auto mt-4 block rounded-lg bg-pink-500 px-6 py-2.5 font-semibold text-white shadow hover:bg-pink-600 focus-visible:outline-2 focus-visible:outline-pink-500">Got it</button></div></div>}
            </div>
          </div>
          <UploadBox onUpload={handleUpload} preview={profile.digitalTwin.image} onDeleteRequest={() => setDeleteDialogOpen(true)} />
          {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          {!profile.digitalTwin.image && <p className="mt-4 text-sm text-gray-500">Upload requirements: PNG or JPEG · Maximum 5 MB · At least 400 × 600 pixels</p>}
        </section>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
        <button type="button" disabled={!canGenerate} onClick={() => { if (selectedOutfit && canGenerate) openTryOn(selectedOutfit); }} className="inline-flex w-full max-w-lg items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:opacity-70">
          <Sparkles size={20} /> Generate My Look
        </button>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-twin-title">
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 id="delete-twin-title" className="text-xl font-bold text-gray-900">Delete Digital Twin photo?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">Are you sure you want to delete your Digital Twin photo? This action cannot be undone.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={isDeleting} onClick={() => setDeleteDialogOpen(false)} className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-800">Cancel</button><button type="button" disabled={isDeleting} onClick={() => void handleRemove()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{isDeleting && <LoaderCircle size={17} className="animate-spin" />} Delete</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
