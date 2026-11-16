/** WBS-2.2 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Measurement tab composition. */
"use client";

import MeasurementForm from "./MeasurementForm";
import { Ruler } from "lucide-react";

export default function MeasurementsTab() {
  return (
    <div className="space-y-8">

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <div className="rounded-2xl bg-white/15 p-3"><Ruler size={28} aria-hidden="true" /></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-100">Your personal fit profile</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">My Measurements</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">Manage your body measurements to support personalized size recommendations.</p></div>
        </div>
      </header>

      {/* Measurement Form */}
      <MeasurementForm />

    </div>
  );
}
