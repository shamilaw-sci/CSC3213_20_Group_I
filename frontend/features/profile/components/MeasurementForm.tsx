/** WBS-2.2/2.3 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Profile measurement persistence and avatar inputs. */
"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";

import { useProfile } from "../hooks/useProfile";
import Avatar from "./Avatar";

const sizeCharts = {
  men: [
    { size: "XS", chest: [79, 84], waist: [63.5, 68.5], hips: [81, 86], shoulder: 42 },
    { size: "S", chest: [86, 94], waist: [71, 76], hips: [89, 94], shoulder: 44.5 },
    { size: "M", chest: [96.5, 104], waist: [81, 86], hips: [96.5, 101.5], shoulder: 47 },
    { size: "L", chest: [106.5, 114], waist: [91.5, 96.5], hips: [104, 109], shoulder: 49.5 },
    { size: "XL", chest: [117, 124.5], waist: [101.5, 106.5], hips: [112, 117], shoulder: 52 },
    { size: "2XL", chest: [127, 134.5], waist: [112, 117], hips: [119.5, 124.5], shoulder: 54.5 },
  ],
  women: [
    { size: "XS", chest: [81, 84], waist: [61, 63.5], hips: [87.5, 90], shoulder: 37 },
    { size: "S", chest: [86.5, 89], waist: [66, 68.5], hips: [92.5, 95], shoulder: 38 },
    { size: "M", chest: [91.5, 94], waist: [71, 73.5], hips: [98, 100.5], shoulder: 39.5 },
    { size: "L", chest: [98, 101.5], waist: [77.5, 81], hips: [104, 108], shoulder: 40.5 },
    { size: "XL", chest: [105.5, 109], waist: [85, 89], hips: [112, 115.5], shoulder: 42 },
    { size: "2XL", chest: [113, 117], waist: [92.5, 96.5], hips: [119.5, 123], shoulder: 43 },
  ],
} as const;
const fields = [
  ["height", "Height", 100, 250], ["weight", "Weight", 40, 140], ["chest", "Chest circumference", 1, 140],
  ["waist", "Waist circumference", 50, 130], ["hips", "Hip circumference", 65, 150], ["shoulder", "Shoulder width", 30, 65],
] as const;

function recommendSize(body: { chest: number; waist: number; hips: number; shoulder: number; gender: "Female" | "Male" | "Unisex" }) {
  const chart = body.gender === "Female" ? sizeCharts.women : sizeCharts.men;
  const distanceFromRangeCenter = (value: number, range: readonly [number, number]) => (value - (range[0] + range[1]) / 2) / Math.max((range[1] - range[0]) / 2, 1.5);
  const ranked = chart.map((row) => {
    const distances = [distanceFromRangeCenter(body.chest, row.chest), distanceFromRangeCenter(body.waist, row.waist), distanceFromRangeCenter(body.hips, row.hips), (body.shoulder - row.shoulder) / 2];
    return { size: row.size, distance: distances.reduce((sum, distance) => sum + distance ** 2, 0) };
  }).sort((a, b) => a.distance - b.distance);
  return { size: ranked[0].size, match: Math.max(0, Math.round(100 / (1 + ranked[0].distance / 4))) };
}

export default function MeasurementForm() {
  const { profile, updateMeasurements, saveMeasurements } = useProfile();
  const [scoreVisible, setScoreVisible] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const body = profile.measurements;
  const hasCoreMeasurements = [body.chest, body.waist, body.hips, body.shoulder].every((value) => value > 0);
  const recommendation = useMemo(() => recommendSize(body), [body]);
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
          {isSaving ? "Saving measurements…" : "Save measurements"}
        </button>
        {saveError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{saveError}</p>}
      </section>

      <div className="space-y-5">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Interactive Twin Model</h2>
          <p className="mt-1 text-sm text-gray-600">An SVG silhouette that updates from your measurements.</p>
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl bg-gray-50 p-3">
            <Avatar body={body} />
            <p className="mt-3 text-center text-xs text-gray-500">Illustrative silhouette that updates from your saved measurements; it is not a body scan.</p>
            <p className="mt-3 text-sm font-medium text-gray-700">H: {body.height || "—"} cm · W: {body.weight || "—"} kg</p>
          </div>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Your Size Recommendation</h2>
          {!scoreVisible || !saveAttempted || !hasCoreMeasurements || body.height < 100 || body.height > 250 ? <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Enter and save your measurements to get a size recommendation from the {body.gender === "Female" ? "women’s" : "men’s and unisex"} chart.</p> : <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-5"><p className="text-sm font-semibold text-indigo-800">Recommended size · {body.gender === "Female" ? "Women’s" : "Men’s & Unisex"} chart</p><p className="mt-1 text-4xl font-black text-indigo-950">{recommendation.size}</p><p className="mt-2 text-sm text-indigo-800">Closest match based on your chest, waist, hips, and shoulder measurements ({recommendation.match}% match).</p><p className="mt-3 text-xs leading-5 text-slate-600">Sizing can vary by merchant and garment. Check the product’s own size chart before purchasing.</p></div>}
        </section>
      </div>
    </div>
  );
}
