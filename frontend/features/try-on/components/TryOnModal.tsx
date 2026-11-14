"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Ruler, ShoppingBag, Sparkles, UserRound, UserRoundPlus, X } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/context/AuthContext";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { validateImage } from "../utils/imageValidation";
import { savePendingTryOn } from "../utils/pendingTryOn";
import { useTryOn } from "../hooks/useTryOn";
import type { TryOnProduct } from "../types/tryon";
import InteractiveFittingPreview, { fitPercentage } from "./InteractiveFittingPreview";

const illustrativeSizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function TryOnModal() {
  const { state } = useTryOn();
  if (!state.isOpen || !state.selectedProduct) return null;
  return <TryOnModalView key={state.selectedProduct.id} product={state.selectedProduct} initialSize={state.selectedSize} />;
}

function TryOnModalView({ product, initialSize }: { product: TryOnProduct; initialSize?: string | null }) {
  const { closeTryOn, setSelectedSize, goToTwinSetup } = useTryOn();
  const { profile, profileLoadStatus, changeTab } = useProfile();
  const { user, isGuest, ready: authReady, startGuest } = useAuth();
  const router = useRouter();
  const [size, setSize] = useState(initialSize ?? "M");
  const [signInRequired, setSignInRequired] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [guestPhoto, setGuestPhoto] = useState<File | null>(null);
  const [guestPhotoUrl, setGuestPhotoUrl] = useState<string | null>(null);
  const [accessError, setAccessError] = useState("");
  const [guestPhotoError, setGuestPhotoError] = useState("");
  const [startingGuest, setStartingGuest] = useState(false);
  const [guestChoiceVisible, setGuestChoiceVisible] = useState(true);
  const sizeOptions = product?.availableSizes ?? illustrativeSizes;
  const selectedSize = product
    ? sizeOptions.includes(size) ? size : (sizeOptions[0] ?? null)
    : null;

  useEffect(() => () => {
    if (guestPhotoUrl) URL.revokeObjectURL(guestPhotoUrl);
  }, [guestPhotoUrl]);

  useEffect(() => () => {
    if (generatedImage?.startsWith("blob:")) URL.revokeObjectURL(generatedImage);
  }, [generatedImage]);

  const hasListedSizes = product.availableSizes !== undefined;
  const score = selectedSize ? fitPercentage(profile.measurements, selectedSize) : null;
  const price = product.currency
    ? `${product.currency} ${product.price.toFixed(2)}`
    : `$${product.price.toFixed(2)}`;

  async function generatePreview() {
    if (!product || !selectedSize || generating) return;
    setGenerating(true);
    setGenerateError("");
    try {
      let response: Response;
      if (isGuest && guestPhoto) {
        const formData = new FormData();
        formData.set("productId", String(product.id));
        formData.set("size", selectedSize);
        formData.set("image", guestPhoto);
        if (score !== null) formData.set("fitPercentage", String(score));
        response = await fetch("/api/v1/try-ons", { method: "POST", body: formData });
      } else {
        response = await fetch("/api/v1/try-ons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, size: selectedSize, ...(score === null ? {} : { fitPercentage: score }) }) });
      }
      if (response.status === 401) { setSignInRequired(true); throw new Error("Your session needs to be refreshed. Please choose Register or start a guest session again."); }
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message || "Could not generate your try-on. Please try again.");
      }
      if (isGuest) {
        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.startsWith("image/")) throw new Error("The guest try-on did not return an image. Please try again.");
        setGeneratedImage(URL.createObjectURL(await response.blob()));
      } else {
        const body = await response.json().catch(() => ({})) as { message?: string; tryOn?: { id: string } };
        if (!body.tryOn?.id) throw new Error(body.message || "Could not generate your try-on. Please try again.");
        setGeneratedImage(`/api/v1/try-ons/${body.tryOn.id}/image`);
      }
      setGuestPhoto(null);
      setGuestPhotoUrl(null);
    } catch (error) { setGenerateError(error instanceof Error ? error.message : "Could not generate your try-on."); }
    finally { setGenerating(false); }
  }

  async function continueAsGuest() {
    if (startingGuest) return;
    setStartingGuest(true);
    setAccessError("");
    try {
      if (!isGuest) await startGuest();
      setGuestChoiceVisible(false);
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Could not start a guest session.");
    } finally {
      setStartingGuest(false);
    }
  }

  function registerToResume() {
    if (!product) return;
    savePendingTryOn(product, selectedSize);
    const returnTo = "/profile?tab=digitalTwin";
    const guestReturnTo = `${window.location.pathname}${window.location.search}`;
    closeTryOn();
    router.push(`/register?returnTo=${encodeURIComponent(returnTo)}&guestReturnTo=${encodeURIComponent(guestReturnTo)}`);
  }

  function handleGuestPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const validation = validateImage(file);
    if (!validation.valid) {
      setGuestPhotoError(validation.error ?? "Choose a supported image.");
      return;
    }
    if (guestPhotoUrl) URL.revokeObjectURL(guestPhotoUrl);
    setGuestPhotoError("");
    setGuestPhoto(file);
    setGuestPhotoUrl(URL.createObjectURL(file));
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
            <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-slate-50 p-4 shadow-inner sm:p-6"><div className="mb-4"><p className="flex items-center gap-2 text-sm font-bold text-indigo-700"><Sparkles size={17} /> Your AI Virtual Try-On</p><p className="mt-1 text-xs text-slate-500">{isGuest ? "Generated from your uploaded photo and this garment." : "Generated from your Digital Twin and this garment."}</p></div><div className="relative mx-auto aspect-[2/3] max-h-[65vh] max-w-md overflow-hidden rounded-2xl bg-white"><Image src={generatedImage} alt={`${product.title} worn in your AI try-on`} fill unoptimized className="object-contain" /></div></section>
          ) : isGuest && guestPhotoUrl ? (
            <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-slate-50 p-4 shadow-inner sm:p-6"><div className="mb-4"><p className="text-sm font-bold text-indigo-700">Your photo for this guest try-on</p><p className="mt-1 text-xs text-slate-500">This photo will be used for this fitting session.</p></div><div className="relative mx-auto aspect-[2/3] max-h-[55vh] max-w-md overflow-hidden rounded-2xl bg-white"><Image src={guestPhotoUrl} alt="Your selected try-on photo" fill unoptimized className="object-contain" /></div><div className="mx-auto mt-4 flex max-w-md items-center justify-between gap-3"><button type="button" onClick={() => document.getElementById("guest-try-on-photo")?.click()} className="text-sm font-semibold text-indigo-700 underline">Choose a different photo</button><button type="button" onClick={() => { setGuestPhoto(null); setGuestPhotoUrl(null); setGuestPhotoError(""); setGuestChoiceVisible(true); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button></div><input id="guest-try-on-photo" type="file" accept="image/png,image/jpeg" onChange={handleGuestPhotoChange} className="sr-only" /></section>
          ) : isGuest && !guestChoiceVisible ? (
            <section className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-indigo-100 bg-indigo-50 p-6 text-center"><label className="flex min-h-56 w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-white p-6 font-semibold text-indigo-800 transition hover:border-indigo-500 hover:bg-indigo-50"><UserRound size={42} className="mb-4" aria-hidden="true" /><span className="text-lg">Add a photo to try this dress</span><span className="mt-2 text-sm font-normal text-slate-500">PNG or JPEG, up to 5 MB</span><input type="file" accept="image/png,image/jpeg" onChange={handleGuestPhotoChange} className="sr-only" /></label>{guestPhotoError && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{guestPhotoError}</p>}</section>
          ) : user && selectedSize ? (
            <InteractiveFittingPreview
              product={product}
              measurements={profile.measurements}
              size={selectedSize}
            />
          ) : !user && (!isGuest || guestChoiceVisible) && authReady ? (
            <section className="flex min-h-72 items-center justify-center rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
              <div className="grid w-full max-w-lg grid-cols-2 gap-4">
                <button type="button" onClick={() => void continueAsGuest()} disabled={startingGuest} className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-6 text-center font-bold text-indigo-900 shadow-sm transition hover:border-indigo-500 hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60">
                  <UserRound size={44} aria-hidden="true" />
                  <span>{startingGuest ? "Starting guest session..." : "Continue as a guest"}</span>
                </button>
                <button type="button" onClick={registerToResume} className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-6 text-center font-bold text-indigo-900 shadow-sm transition hover:border-indigo-500 hover:bg-indigo-50">
                  <UserRoundPlus size={44} aria-hidden="true" />
                  <span>Register</span>
                </button>
                {accessError && <p role="alert" className="col-span-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{accessError}</p>}
              </div>
            </section>
          ) : (
            <section className="flex min-h-72 items-center justify-center rounded-3xl border border-indigo-100 bg-indigo-50 p-6 text-center"><p role="status" className="font-semibold text-indigo-900">{!authReady ? "Checking your session..." : "Add a photo to continue as a guest."}</p></section>
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
                        onClick={() => { setSize(item); setSelectedSize(item); setGeneratedImage(null); setGenerateError(""); }}
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

            {(user || isGuest) && <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex gap-3">
                <Ruler className="shrink-0 text-indigo-700" size={20} />
                <div>
                  <h3 className="font-bold text-indigo-950">Make the result more personal</h3>
                  <p className="mt-1 text-sm leading-5 text-indigo-900">
                    {user
                      ? profile.digitalTwin.image
                        ? "Your Digital Twin photo is ready to use for this try-on."
                        : "Create your Digital Twin with a full-body photo, then return to this garment."
                      : isGuest
                        ? guestPhoto
                          ? "Your photo is ready for a one-time guest try-on."
                          : "Add a photo to try this garment as a guest."
                        : "Register to use a saved Digital Twin, or continue as a guest with a photo."}
                  </p>
                  {user && <Link
                    href="/profile?tab=digitalTwin"
                    onClick={() => { goToTwinSetup(); changeTab("digitalTwin"); }}
                    className="mt-3 inline-block text-sm font-bold text-indigo-700 underline underline-offset-2"
                  >
                    Open your Digital Twin
                  </Link>}
                </div>
              </div>
            </section>}

            {user && profileLoadStatus === "ready" && !profile.digitalTwin.image && <div className="space-y-2"><p className="text-sm text-slate-600">Upload a photo to create your Digital Twin, then return to this fitting room.</p><Link href="/profile?tab=digitalTwin" onClick={goToTwinSetup} className="block w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-center font-semibold text-white hover:bg-indigo-700">Create your Digital Twin</Link></div>}
            {(user && profile.digitalTwin.image || isGuest && guestPhoto) && <button
              type="button"
              onClick={() => void generatePreview()}
              disabled={selectedSize === null || generating || (user !== null && profileLoadStatus !== "ready")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:opacity-60"
            >
              <Sparkles size={18} /> {generating ? "Generating your try-on..." : generatedImage ? "Generate again" : "Try this on"}
            </button>}
            {generateError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800">{generateError} {signInRequired && <Link href="/login" onClick={closeTryOn} className="underline">Log in</Link>}</p>}
            {generatedImage && (isGuest ? <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} /> Guest results are temporary and aren’t saved to Try-On History.</p> : <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} /> Your generated result is saved in <Link href="/profile/try-on-history" onClick={closeTryOn} className="underline">Try-On History</Link>.</p>)}
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
