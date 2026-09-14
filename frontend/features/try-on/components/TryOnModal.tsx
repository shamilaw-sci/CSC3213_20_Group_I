"use client";

import Link from "next/link";
import { CheckCircle2, Ruler, ShoppingBag, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { useProfile } from "@/features/profile/hooks/useProfile";
import { useTryOn } from "../hooks/useTryOn";
import InteractiveFittingPreview, { fitPercentage } from "./InteractiveFittingPreview";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function TryOnModal() {
  const { state, closeTryOn } = useTryOn();
  const { profile, changeTab } = useProfile();
  const [size, setSize] = useState("M");
  const [saved, setSaved] = useState(false);
  const product = state.selectedProduct;

  if (!state.isOpen || !product) return null;
  const score = fitPercentage(profile.measurements, size);

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="try-on-title" onClick={closeTryOn}><section className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">TryVora fitting room</p><h2 id="try-on-title" className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Try on {product.title}</h2></div><button type="button" onClick={closeTryOn} aria-label="Close fitting room" className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"><X size={23} /></button></header><div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_.85fr] sm:p-7"><InteractiveFittingPreview product={product} measurements={profile.measurements} size={size} /><aside className="space-y-5"><section className="tv-card p-4"><div className="flex gap-4"><img src={product.image} alt={product.title} className="h-24 w-20 rounded-xl object-cover" /><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{product.store}</p><h3 className="mt-1 font-bold text-slate-900">{product.title}</h3><p className="mt-2 text-lg font-black text-indigo-700">${product.price.toFixed(2)}</p></div></div></section><section className="tv-card p-4"><div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-900">Choose your size</h3><p className="mt-1 text-sm text-slate-500">Preview updates immediately.</p></div>{score !== null && <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">{score}% fit</span>}</div><div className="mt-4 grid grid-cols-3 gap-2">{sizes.map((item) => <button type="button" key={item} onClick={() => { setSize(item); setSaved(false); }} className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${item === size ? "border-indigo-600 bg-indigo-600 text-white shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"}`}>{item}</button>)}</div></section><section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4"><div className="flex gap-3"><Ruler className="shrink-0 text-indigo-700" size={20} /><div><h3 className="font-bold text-indigo-950">Make the result more personal</h3><p className="mt-1 text-sm leading-5 text-indigo-900">{profile.digitalTwin.image ? "Your reference photo is saved. Update body measurements to improve the fit estimate." : "Add your body image and measurements for a more personal fitting guide."}</p><Link href="/profile" onClick={() => { closeTryOn(); changeTab("measurements"); }} className="mt-3 inline-block text-sm font-bold text-indigo-700 underline underline-offset-2">Open profile measurements</Link></div></div></section><button type="button" onClick={() => setSaved(true)} className="tv-button flex w-full items-center justify-center gap-2 px-5 py-3.5"><Sparkles size={18} /> Save this fitting preview</button>{saved && <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} /> Size {size} preview saved for this session.</p>}<button type="button" onClick={closeTryOn} className="tv-button-secondary flex w-full items-center justify-center gap-2 px-5 py-3"><ShoppingBag size={18} /> Continue shopping</button></aside></div></section></div>;
}
