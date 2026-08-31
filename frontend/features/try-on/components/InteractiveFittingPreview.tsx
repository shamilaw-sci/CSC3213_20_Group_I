"use client";

import { Ruler, Sparkles } from "lucide-react";
import { useId } from "react";

import type { Measurements } from "@/features/profile/types/profile";
import type { TryOnProduct } from "../types/tryon";

const sizeScale: Record<string, number> = { XS: 0.84, S: 0.91, M: 1, L: 1.08, XL: 1.16, XXL: 1.25 };
const chart: Record<string, { chest: number; waist: number; hips: number }> = {
  XS: { chest: 84, waist: 66, hips: 90 }, S: { chest: 90, waist: 72, hips: 96 }, M: { chest: 96, waist: 78, hips: 102 },
  L: { chest: 102, waist: 84, hips: 108 }, XL: { chest: 108, waist: 90, hips: 114 }, XXL: { chest: 116, waist: 98, hips: 122 },
};

export function fitPercentage(measurements: Measurements, size: string) {
  const garment = chart[size];
  if (!garment || !measurements.chest || !measurements.waist || !measurements.hips) return null;
  const expectedEase = [garment.chest - measurements.chest - 10, garment.waist - measurements.waist - 7, garment.hips - measurements.hips - 10];
  const penalty = expectedEase.reduce((total, ease) => total + Math.min(28, Math.abs(ease) * 2), 0);
  return Math.max(0, Math.min(100, Math.round(100 - penalty / 2)));
}

export default function InteractiveFittingPreview({ product, measurements, size }: { product: TryOnProduct; measurements: Measurements; size: string }) {
  const patternId = useId().replace(/:/g, "");
  const score = fitPercentage(measurements, size);
  const scale = sizeScale[size] ?? 1;
  const skin = measurements.skinColor || "#dfbeaa";
  const shoulder = Math.min(56, Math.max(34, measurements.shoulder || 42));
  const shoulderHalf = shoulder * 1.35 * scale / 2;
  const chestHalf = Math.min(45, Math.max(27, (measurements.chest || 92) * 0.25 * scale));
  const waistHalf = Math.min(40, Math.max(22, (measurements.waist || 76) * 0.32 * scale));
  const hipsHalf = Math.min(47, Math.max(27, (measurements.hips || 98) * 0.32 * scale));
  const isDress = product.category === "Dresses";
  const isBottom = product.category === "Bottoms";
  const garmentPath = isDress
    ? `M ${110 - shoulderHalf} 88 Q ${110 - chestHalf} 120 ${110 - waistHalf} 155 L ${110 - hipsHalf - 18} 286 L ${110 + hipsHalf + 18} 286 L ${110 + waistHalf} 155 Q ${110 + chestHalf} 120 ${110 + shoulderHalf} 88 Z`
    : isBottom
      ? `M ${110 - hipsHalf} 172 L ${110 - hipsHalf - 4} 304 L 105 304 L 110 210 L 115 304 L ${110 + hipsHalf + 4} 304 L ${110 + hipsHalf} 172 Z`
      : `M ${110 - shoulderHalf} 88 Q ${110 - chestHalf} 120 ${110 - waistHalf} 164 L ${110 - hipsHalf} 205 L ${110 + hipsHalf} 205 L ${110 + waistHalf} 164 Q ${110 + chestHalf} 120 ${110 + shoulderHalf} 88 Z`;
  const fitTone = score === null ? "text-slate-600 bg-slate-100" : score >= 85 ? "text-emerald-700 bg-emerald-50" : score >= 65 ? "text-amber-700 bg-amber-50" : "text-rose-700 bg-rose-50";

  return <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-4 shadow-inner sm:p-6"><div className="mb-4 flex items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold text-indigo-700"><Sparkles size={17} /> Live fitting preview</p><p className="mt-1 text-xs text-slate-500">Illustrated size and garment placement guide</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm">Size {size}</span></div><div className="relative mx-auto flex max-w-sm items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_#ddd6fe,_#f8fafc_55%,_#eef2ff)] py-3"><svg viewBox="0 0 220 330" className="h-[390px] max-h-[55vh] w-full max-w-[290px]" role="img" aria-label={`${product.title} shown as a size ${size} illustrated fitting preview`}><defs><pattern id={patternId} width="1" height="1" patternContentUnits="objectBoundingBox"><image href={product.image} width="1" height="1" preserveAspectRatio="xMidYMid slice" /></pattern></defs><ellipse cx="110" cy="314" rx="60" ry="8" fill="#c7d2fe" opacity=".6"/><circle cx="110" cy="47" r="22" fill={skin}/><path d={`M ${110 - shoulderHalf} 88 Q ${110 - chestHalf} 118 ${110 - waistHalf} 165 Q ${110 - hipsHalf} 190 ${110 - hipsHalf} 205 L ${110 + hipsHalf} 205 Q ${110 + hipsHalf} 190 ${110 + waistHalf} 165 Q ${110 + chestHalf} 118 ${110 + shoulderHalf} 88 Z`} fill={skin} stroke="#9ca3af" strokeWidth="1.2"/><path d={`M ${110 - hipsHalf / 2} 204 L ${110 - hipsHalf / 2 - 8} 304`} stroke={skin} strokeWidth="18" strokeLinecap="round"/><path d={`M ${110 + hipsHalf / 2} 204 L ${110 + hipsHalf / 2 + 8} 304`} stroke={skin} strokeWidth="18" strokeLinecap="round"/><path d={`M ${110 - shoulderHalf} 92 Q ${110 - shoulderHalf - 17} 150 ${110 - shoulderHalf - 10} 195`} stroke={skin} strokeWidth="11" strokeLinecap="round" fill="none"/><path d={`M ${110 + shoulderHalf} 92 Q ${110 + shoulderHalf + 17} 150 ${110 + shoulderHalf + 10} 195`} stroke={skin} strokeWidth="11" strokeLinecap="round" fill="none"/><path d={garmentPath} fill={`url(#${patternId})`} stroke="#4338ca" strokeWidth="2" opacity=".96"/><path d={garmentPath} fill="#4f46e5" opacity=".13"/><path d={`M ${110 - waistHalf} 155 Q 110 162 ${110 + waistHalf} 155`} fill="none" stroke="white" strokeOpacity=".7" strokeWidth="1.5"/></svg></div><div className={`mt-4 rounded-xl px-4 py-3 ${fitTone}`}>{score === null ? <p className="flex items-center gap-2 text-sm font-semibold"><Ruler size={17} /> Add chest, waist, and hip measurements to see fit compatibility.</p> : <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold">{score >= 85 ? "Great match" : score >= 65 ? "Check the size guide" : "May be tight or loose"}</p><p className="mt-0.5 text-xs">Estimate based on your saved measurements and a generic size chart.</p></div><strong className="text-2xl">{score}%</strong></div>}</div></section>;
}
