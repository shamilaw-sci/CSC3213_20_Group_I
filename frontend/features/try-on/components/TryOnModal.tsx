"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Ruler, ShoppingBag, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useProfile } from "@/features/profile/hooks/useProfile";
import { useTryOn } from "../hooks/useTryOn";
import InteractiveFittingPreview, { fitPercentage } from "./InteractiveFittingPreview";

const illustrativeSizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function TryOnModal() {
  const { state, closeTryOn } = useTryOn();
  const { profile, changeTab } = useProfile();
  const [size, setSize] = useState("M");
  const [savedPreview, setSavedPreview] = useState<{
    productId: string | number;
    size: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [signInRequired, setSignInRequired] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const product = state.selectedProduct;

  if (!state.isOpen || !product) return null;

  const sizeOptions = product.availableSizes ?? illustrativeSizes;
  const selectedSize = sizeOptions.includes(size) ? size : (sizeOptions[0] ?? null);
  const hasListedSizes = product.availableSizes !== undefined;
  const score = selectedSize ? fitPercentage(profile.measurements, selectedSize) : null;
  const price = product.currency
    ? `${product.currency} ${product.price.toFixed(2)}`
    : `$${product.price.toFixed(2)}`;
  const isSaved = savedPreview?.productId === product.id && savedPreview.size === selectedSize;

  useEffect(() => {
    setGeneratedImage(null);
    setGenerateError("");
    setSavedPreview(null);
    setSignInRequired(false);
  }, [product?.id]);

  async function generatePreview() {
    if (!product || !selectedSize || generating) return;
    setGenerating(true);
    setGenerateError("");
    try {
      const response = await fetch("/api/v1/try-ons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, size: selectedSize, ...(score === null ? {} : { fitPercentage: score }) }) });
      const body = await response.json().catch(() => ({})) as { message?: string; tryOn?: { id: string } };
      if (response.status === 401) { setSignInRequired(true); throw new Error("Log in to generate a personalized try-on."); }
      if (!response.ok || !body.tryOn?.id) throw new Error(body.message || "Could not generate your try-on. Please try again.");
      setGeneratedImage(`/api/v1/try-ons/${body.tryOn.id}/image`);
      setSavedPreview({ productId: product.id, size: selectedSize });
    } catch (error) { setGenerateError(error instanceof Error ? error.message : "Could not generate your try-on."); }
    finally { setGenerating(false); }
  }

  async function savePreview() {
    if (!product || !selectedSize || saving) return;
    setSaveError("");
    setSignInRequired(false);

    if (typeof product.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id)) {
      setSaveError("Only catalogue products can be saved to Try-On History. Choose a product from Explore.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/v1/try-ons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          ...(score === null ? {} : { fitPercentage: score }),
        }),
      });
      if (response.status === 401) {
        setSignInRequired(true);
        throw new Error("Log in to save this fitting preview.");
      }
      if (!response.ok) throw new Error("Could not save this fitting preview. Please try again.");
      setSavedPreview({ productId: product.id, size: selectedSize });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save this fitting preview.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="try-on-title"
      onClick={closeTryOn}
    >
      <section
        className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              TryVora fitting room
            </p>
            <h2 id="try-on-title" className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
              Try on {product.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeTryOn}
            aria-label="Close fitting room"
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <X size={23} />
          </button>
        </header>

        <div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_.85fr] sm:p-7">
          {generatedImage ? (
            <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-slate-50 p-4 shadow-inner sm:p-6"><div className="mb-4"><p className="flex items-center gap-2 text-sm font-bold text-indigo-700"><Sparkles size={17} /> Your AI Virtual Try-On</p><p className="mt-1 text-xs text-slate-500">Generated from your Digital Twin and this garment.</p></div><div className="relative mx-auto aspect-[2/3] max-h-[65vh] max-w-md overflow-hidden rounded-2xl bg-white"><Image src={generatedImage} alt={`${product.title} worn in your AI try-on`} fill unoptimized className="object-contain" /></div></section>
          ) : selectedSize ? (
            <InteractiveFittingPreview
              product={product}
              measurements={profile.measurements}
              size={selectedSize}
            />
          ) : (
            <section className="flex min-h-72 items-center justify-center rounded-3xl border border-indigo-100 bg-indigo-50 p-6 text-center">
              <div>
                <p className="font-bold text-indigo-950">Size-based preview unavailable</p>
                <p className="mt-2 text-sm text-indigo-900">
                  This merchant has not listed an in-stock size for this product yet.
                </p>
              </div>
            </section>
          )}

          <aside className="space-y-5">
            <section className="tv-card p-4">
              <div className="flex gap-4">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={80}
                  height={96}
                  unoptimized
                  className="h-24 w-20 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    {product.store}
                  </p>
                  <h3 className="mt-1 font-bold text-slate-900">{product.title}</h3>
                  <p className="mt-2 text-lg font-black text-indigo-700">{price}</p>
                </div>
              </div>
            </section>

            <section className="tv-card p-4">
              {sizeOptions.length === 0 ? (
                <>
                  <h3 className="font-bold text-slate-900">No sizes listed</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    This product has no in-stock sizes listed. A size-based try-on preview
                    or fit estimate is not available yet.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {hasListedSizes ? "Choose an in-stock size" : "Preview a size"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {hasListedSizes
                          ? "Only listed sizes are shown. Preview updates immediately."
                          : "Illustrative sizes only; merchant stock was not checked."}
                      </p>
                    </div>
                    {score !== null && (
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
                        {score}% fit
                      </span>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {sizeOptions.map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setSize(item)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                          item === selectedSize
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                            : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex gap-3">
                <Ruler className="shrink-0 text-indigo-700" size={20} />
                <div>
                  <h3 className="font-bold text-indigo-950">Make the result more personal</h3>
                  <p className="mt-1 text-sm leading-5 text-indigo-900">
                    {profile.digitalTwin.image
                      ? "Your reference photo is ready. Generate a realistic preview of this garment on you."
                      : "Add your body image and measurements for a more personal fitting guide."}
                  </p>
                  <Link
                    href="/profile"
                    onClick={() => { closeTryOn(); changeTab("measurements"); }}
                    className="mt-3 inline-block text-sm font-bold text-indigo-700 underline underline-offset-2"
                  >
                    Open profile measurements
                  </Link>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={() => void generatePreview()}
              disabled={selectedSize === null || generating || !profile.digitalTwin.image}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:opacity-60"
            >
              <Sparkles size={18} /> {generating ? "Generating your try-on..." : generatedImage ? "Generate again" : "Generate AI try-on"}
            </button>
            {!profile.digitalTwin.image && <p className="text-sm text-slate-500">Add your Digital Twin photo to generate a personalized try-on.</p>}
            {generateError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800">{generateError} {signInRequired && <Link href="/login" onClick={closeTryOn} className="underline">Log in</Link>}</p>}
            {generatedImage && <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} /> Your generated result is saved in <Link href="/profile/try-on-history" onClick={closeTryOn} className="underline">Try-On History</Link>.</p>}
            {/* Legacy save button retained until AI generation succeeds. */}
            {!generatedImage && <button
              type="button"
              onClick={() => void savePreview()}
              disabled={selectedSize === null || saving || isSaved}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:opacity-60"
            >
              <Sparkles size={18} /> {saving ? "Saving..." : isSaved ? "Preview saved" : "Save this fitting preview"}
            </button>}
            {isSaved && !generatedImage && (
              <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                <CheckCircle2 size={18} /> Size {selectedSize} illustrative fitting guide saved. <Link href="/profile/try-on-history" onClick={closeTryOn} className="underline">View history</Link>
              </p>
            )}
            {saveError && (
              <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800">
                {saveError} {signInRequired && <Link href="/login" onClick={closeTryOn} className="underline">Log in</Link>}
              </p>
            )}
            <button
              type="button"
              onClick={closeTryOn}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:border-indigo-500 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <ShoppingBag size={18} /> Continue shopping
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}
