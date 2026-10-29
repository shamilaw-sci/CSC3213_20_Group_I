/** WBS-2.4 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Digital Twin photo management UI. */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Lightbulb, LoaderCircle, Shirt, Sparkles, X } from "lucide-react";

import { useTryOn } from "@/features/try-on/hooks/useTryOn";
import type { TryOnProduct } from "@/features/try-on/types/tryon";
import { useProfile } from "../hooks/useProfile";
import PhotoGuidelines from "./PhotoGuidelines";
import UploadBox from "./UploadBox";

type CatalogueProduct = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  currency: string;
  merchant: { name: string };
  category: { name: string };
  variants: { size: string | null; stock: number | null }[];
};

type CatalogueResponse = {
  products?: CatalogueProduct[];
};

function toTryOnProduct(product: CatalogueProduct): TryOnProduct | null {
  if (!product.image) return null;
  const availableSizes = [...new Set(product.variants
    .filter((variant) => variant.size && (variant.stock ?? 0) > 0)
    .map((variant) => variant.size as string))];

  return {
    id: product.id,
    title: product.name,
    image: product.image,
    category: product.category.name,
    store: product.merchant.name,
    price: product.price,
    currency: product.currency,
    // No variants means the existing Try-On modal offers illustrative sizes.
    // Listed variants with no stock must not be presented as available.
    availableSizes: product.variants.length ? availableSizes : undefined,
  };
}

export default function DigitalTwinTab() {
  const { profile, uploadImage, removeImage } = useProfile();
  const { openTryOn } = useTryOn();
  const guidelinesRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [outfitPickerOpen, setOutfitPickerOpen] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<TryOnProduct | null>(null);
  const [outfits, setOutfits] = useState<TryOnProduct[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(true);
  const [outfitsError, setOutfitsError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [catalogueQuery, setCatalogueQuery] = useState("");
  const [catalogueAttempt, setCatalogueAttempt] = useState(0);

  useEffect(() => {
    async function loadTwin() {
      const response = await fetch("/api/v1/digital-twins/current", { cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json() as { twin: { imageUrl: string } | null };
      if (result.twin) uploadImage(result.twin.imageUrl);
    }
    void loadTwin();
  // Load the saved twin once; uploadImage is a context action recreated on renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOutfits() {
      try {
        const params = new URLSearchParams({ page: "1", pageSize: "24" });
        if (catalogueQuery) params.set("q", catalogueQuery);
        const response = await fetch(`/api/v1/products?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not load outfits.");
        const result = await response.json() as CatalogueResponse;
        if (controller.signal.aborted) return;
        setOutfits((result.products ?? []).flatMap((item) => {
          const mapped = toTryOnProduct(item);
          return mapped ? [mapped] : [];
        }));
        setOutfitsError("");
      } catch {
        if (!controller.signal.aborted) setOutfitsError("Could not load outfits. Please try again.");
      } finally {
        if (!controller.signal.aborted) setOutfitsLoading(false);
      }
    }

    void loadOutfits();
    return () => controller.abort();
  }, [catalogueQuery, catalogueAttempt]);

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
    setPreviewOpen(false);
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
      setPreviewOpen(false);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  const hasAvailableSize = selectedOutfit?.availableSizes === undefined
    || selectedOutfit.availableSizes.length > 0;
  const canGenerate = Boolean(selectedOutfit && profile.digitalTwin.image && hasAvailableSize);

  return (
    <div className="space-y-5">
      <div><h2 className="text-3xl font-bold text-gray-900">Your Digital Twin</h2><p className="mt-2 text-gray-500">Choose an outfit and use your saved full-body photo for an illustrative fitting preview.</p></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Choose Clothing</h3>
            <button type="button" onClick={() => setOutfitPickerOpen((open) => !open)} className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600">
              {selectedOutfit ? "Change Outfit" : "Choose Outfit"}
            </button>
          </div>

          {selectedOutfit ? (
            <div className="mt-4">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[250px] overflow-hidden rounded-2xl bg-gray-100">
                <Image src={selectedOutfit.image} alt={selectedOutfit.title} fill sizes="(min-width: 1024px) 250px, 80vw" unoptimized className="object-cover" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-indigo-600">{selectedOutfit.store} · {selectedOutfit.category}</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{selectedOutfit.title}</p>
              <p className="mt-1 font-semibold text-indigo-700">{selectedOutfit.currency ?? "USD"} {selectedOutfit.price.toFixed(2)}</p>
              {selectedOutfit.availableSizes?.length === 0 && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">This outfit has no in-stock sizes listed for a fitting preview.</p>}
            </div>
          ) : (
            <div className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center">
              <Shirt size={42} className="text-indigo-600" />
              <p className="mt-3 font-semibold text-gray-900">Select an outfit from the catalogue</p>
              <p className="mt-1 text-sm text-gray-600">Your chosen clothing will appear here.</p>
            </div>
          )}

          {outfitPickerOpen && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <form onSubmit={(event) => { event.preventDefault(); setOutfitsLoading(true); setCatalogueQuery(searchInput.trim()); setCatalogueAttempt((attempt) => attempt + 1); }} className="flex gap-2">
                <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} aria-label="Search catalogue outfits" placeholder="Search catalogue outfits" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600">Search</button>
              </form>
              {outfitsLoading ? <p role="status" className="mt-3 text-sm text-gray-600">Loading outfits…</p> : outfitsError ? (
                <div className="mt-3 text-sm text-rose-700"><p role="alert">{outfitsError}</p><button type="button" onClick={() => { setOutfitsLoading(true); setCatalogueAttempt((attempt) => attempt + 1); }} className="mt-1 font-semibold underline">Retry</button></div>
              ) : outfits.length ? (
                <div className="mt-3 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                  {outfits.map((outfit) => (
                    <button type="button" key={outfit.id} onClick={() => { setSelectedOutfit(outfit); setOutfitPickerOpen(false); }} className="rounded-xl border border-gray-200 p-2 text-left transition hover:border-indigo-400 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-100"><Image src={outfit.image} alt="" fill sizes="120px" unoptimized className="object-cover" /></div>
                      <span className="mt-2 block line-clamp-2 text-xs font-semibold text-gray-900">{outfit.title}</span>
                    </button>
                  ))}
                </div>
              ) : <p className="mt-3 text-sm text-gray-600">No outfits with images were found. Try another search or <Link href="/explore" className="font-semibold text-indigo-700 underline">browse Explore</Link>.</p>}
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Your Photo</h3>
            <div ref={guidelinesRef} className="relative">
              <button type="button" aria-label="Photo guidelines" aria-expanded={guidelinesOpen} aria-controls="digital-twin-photo-guidelines" onClick={() => setGuidelinesOpen((open) => !open)} className="rounded-full border border-indigo-100 bg-indigo-50 p-2 text-indigo-700 shadow-sm transition hover:bg-indigo-100 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <Lightbulb size={20} />
              </button>
              {guidelinesOpen && <div id="digital-twin-photo-guidelines" className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-3rem)] rounded-2xl border border-indigo-100 bg-white p-4 shadow-xl"><PhotoGuidelines compact /></div>}
            </div>
          </div>
          <UploadBox onUpload={handleUpload} preview={profile.digitalTwin.image} onDeleteRequest={() => setDeleteDialogOpen(true)} />
          {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          {profile.digitalTwin.image ? <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"><p className="flex items-center gap-2"><CheckCircle2 size={18} /> Photo uploaded successfully</p><p className="mt-2 flex items-center gap-2"><CheckCircle2 size={18} /> Digital Twin photo ready</p><button type="button" onClick={() => setPreviewOpen(true)} className="mt-4 font-semibold text-indigo-700 underline underline-offset-4">View photo preview</button></div> : <p className="mt-4 text-sm text-gray-500">Upload requirements: PNG or JPEG · Maximum 5 MB · At least 400 × 600 pixels</p>}
        </section>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
        <button type="button" disabled={!canGenerate} onClick={() => { if (selectedOutfit && canGenerate) openTryOn(selectedOutfit); }} className="inline-flex w-full max-w-lg items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:opacity-70">
          <Sparkles size={20} /> Generate Try-On
        </button>
        {!canGenerate && <p className="mt-2 text-sm text-indigo-950">{!selectedOutfit ? "Choose an outfit to continue." : !profile.digitalTwin.image ? "Upload a Digital Twin photo to continue." : "Choose an outfit with an available size."}</p>}
        <p className="mt-2 text-xs text-indigo-900">This opens the existing illustrative fitting guide; it does not generate a photo of you wearing the outfit.</p>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="twin-preview-title" onClick={() => setPreviewOpen(false)}>
          <section className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview" className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"><X size={19} /></button>
            <h3 id="twin-preview-title" className="text-xl font-bold text-gray-900">Digital Twin Photo Preview</h3>
            <p className="mt-1 text-sm text-gray-500">Your saved full-body photo.</p>
            <div className="mt-5 rounded-xl bg-gray-50 p-5"><img src={profile.digitalTwin.image ?? ""} alt="Uploaded full-body Digital Twin photo" className="mx-auto max-h-[65vh] w-auto max-w-full rounded-xl object-contain" /></div>
            <button type="button" onClick={() => setPreviewOpen(false)} className="mt-5 w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-900">Close</button>
          </section>
        </div>
      )}

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
