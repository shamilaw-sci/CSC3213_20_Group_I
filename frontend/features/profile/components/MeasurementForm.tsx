/** WBS-2.2/2.3 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Profile measurement persistence and avatar inputs. */
"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";

import { useProfile } from "../hooks/useProfile";
import Avatar from "./Avatar";
import { useTryOn } from "@/features/try-on/hooks/useTryOn";

const sizes = ["XS", "S", "M", "L", "XL"] as const;
const charts: Record<(typeof sizes)[number], { chest: number; waist: number; hips: number; shoulder: number }> = {
  XS: { chest: 84, waist: 66, hips: 90, shoulder: 40 }, S: { chest: 90, waist: 72, hips: 96, shoulder: 42 },
  M: { chest: 96, waist: 78, hips: 102, shoulder: 44 }, L: { chest: 102, waist: 84, hips: 108, shoulder: 46 },
  XL: { chest: 108, waist: 90, hips: 114, shoulder: 48 },
};
const fields = [
  ["height", "Height", 100, 250], ["weight", "Weight", 40, 140], ["chest", "Chest circumference", 1, 140],
  ["waist", "Waist circumference", 50, 130], ["hips", "Hip circumference", 65, 150], ["shoulder", "Shoulder width", 30, 65],
] as const;

function calculateFitScore(body: { chest: number; waist: number; hips: number; shoulder: number }, size: (typeof sizes)[number]) {
  const garment = charts[size];
  const differences = [garment.chest - body.chest - 10, garment.waist - body.waist - 7, garment.hips - body.hips - 10, garment.shoulder - body.shoulder];
  const penalties = differences.reduce((total, difference) => total + Math.min(25, Math.abs(difference) * 2), 0);
  return Math.max(0, Math.min(100, Math.round(100 - penalties / 2)));
}

export default function MeasurementForm() {
  const { profile, updateMeasurements, saveMeasurements } = useProfile();
  const [selectedSize, setSelectedSize] = useState<(typeof sizes)[number]>("M");
  const [scoreVisible, setScoreVisible] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const { state: tryOnState } = useTryOn();
  const body = profile.measurements;
  const fitScore = useMemo(() => calculateFitScore(body, selectedSize), [body, selectedSize]);
  const hasCoreMeasurements = [body.chest, body.waist, body.hips, body.shoulder].every((value) => value > 0);
  const updateNumber = (field: (typeof fields)[number][0], value: string) => updateMeasurements({ [field]: Number(value) } as never);

  async function handleSave() {
    if (isSaving) return;
    setSaveAttempted(true);
    if (body.height < 100 || body.height > 250 || [body.chest, body.waist, body.hips, body.shoulder].some((value) => value <= 0)) {
      setSaveError("Enter valid height, chest, waist, hip and shoulder measurements before saving.");
      return;
    }
    setIsSaving(true);
    setSaveError("");
    try {
      await saveMeasurements();
      setScoreVisible(true);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Could not save measurements.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Body Measurements</h2>
        <p className="mt-1 text-sm text-gray-600">Set your measurements to calibrate the fit-guide avatar and size estimate.</p>
        <div className="mt-5 flex flex-wrap gap-2">{(["Female", "Male", "Unisex"] as const).map((gender) => <button key={gender} type="button" onClick={() => updateMeasurements({ gender })} className={`rounded-full border px-4 py-2 text-sm font-semibold ${body.gender === gender ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white text-gray-700"}`}>{gender}</button>)}</div>
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4">
          {fields.map(([field, label, min, max]) => (
            <label key={field} className="block">
              <span className="mb-2 flex flex-wrap justify-between gap-1 text-sm font-semibold text-gray-800"><span>{label}</span><span>{body[field] || min} {field === "weight" ? "kg" : "cm"}</span></span>
              <input type="range" min={min} max={max} value={body[field] || min} onChange={(event) => updateNumber(field, event.target.value)} className="w-full accent-indigo-600" />
            </label>
          ))}
        </div>
        <div className="mt-5"><p className="mb-3 text-sm font-semibold text-gray-800">Skin tone</p><div className="flex gap-3">{["#f7d7c4", "#dfbeaa", "#c58f70", "#8c593c", "#5a3825"].map((skinColor) => <button key={skinColor} type="button" aria-label={`Select skin tone ${skinColor}`} onClick={() => updateMeasurements({ skinColor })} className={`h-9 w-9 rounded-full border-2 ${body.skinColor === skinColor ? "border-indigo-600 ring-2 ring-indigo-200" : "border-gray-300"}`} style={{ backgroundColor: skinColor }} />)}</div></div>
        <button type="button" onClick={() => void handleSave()} disabled={isSaving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:bg-indigo-300">
          {isSaving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? "Saving measurements…" : "Save measurements & calculate fit"}
        </button>
        {saveError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{saveError}</p>}
      </section>

      <div className="space-y-5">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Interactive Twin Model</h2>
          <p className="mt-1 text-sm text-gray-600">An SVG silhouette that updates from your measurements.</p>
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl bg-gray-50 p-3">
            <Avatar body={body} garmentSize={selectedSize} fitScore={scoreVisible && hasCoreMeasurements ? fitScore : null} />
            <p className="mt-3 text-center text-xs text-gray-500">Illustrative silhouette that updates from your saved measurements; it is not a body scan.</p>
            <p className="mt-3 text-sm font-medium text-gray-700">H: {body.height || "—"} cm · W: {body.weight || "—"} kg</p>
          </div>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Your Size Recommendation</h2>
          {!saveAttempted || !hasCoreMeasurements || body.height < 100 || body.height > 250 ? <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Save valid measurements and select an outfit with a product-specific size chart to see a recommendation.</p> : tryOnState.selectedProduct?.availableSizes?.length ? <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">This product lists sizes {tryOnState.selectedProduct.availableSizes.join(", ")}, but detailed chest, waist and hip ranges are not available for a reliable product-specific recommendation.</p> : <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Select an outfit with a size chart in Explore to get a product-specific recommendation.</p>}
          <div className="mt-4 border-t pt-4"><h3 className="font-bold text-gray-900">Manual Size Preview</h3><p className="mt-1 text-sm text-gray-600">Choose a size to update the illustrative twin. Fit status is unavailable without the selected product&apos;s actual size ranges.</p><div className="mt-3 flex flex-wrap gap-2">{sizes.map((size) => <button type="button" key={size} onClick={() => { setSelectedSize(size); setScoreVisible(true); }} className={`rounded-lg border px-4 py-2 font-semibold transition ${selectedSize === size ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"}`}>{size}</button>)}</div></div>
        </section>
      </div>
    </div>
  );
}
