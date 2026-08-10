"use client";

import { useState } from "react";
import { Save } from "lucide-react";

interface Measurements {
  height: string;
  weight: string;
  chest: string;
  waist: string;
  hips: string;
  shoulder: string;
  inseam: string;
}

export default function MeasurementForm() {
  const [measurements, setMeasurements] = useState<Measurements>({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    shoulder: "",
    inseam: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeasurements({
      ...measurements,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    console.log("Measurements:", measurements);

    // TODO:
    // Save to backend / Context later

    alert("Measurements saved successfully!");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Body Measurements
      </h2>

      <p className="text-gray-500 mb-8">
        Enter your body measurements for a more accurate AI fitting experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Height */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Height (cm)
          </label>

          <input
            type="number"
            name="height"
            value={measurements.height}
            onChange={handleChange}
            placeholder="170"
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Weight (kg)
          </label>

          <input
            type="number"
            name="weight"
            value={measurements.weight}
            onChange={handleChange}
            placeholder="65"
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Chest */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Chest (cm)
          </label>

          <input
            type="number"
            name="chest"
            value={measurements.chest}
            onChange={handleChange}
            placeholder="95"
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Waist */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Waist (cm)
          </label>

          <input
            type="number"
            name="waist"
            value={measurements.waist}
            onChange={handleChange}
            placeholder="80"
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Hips */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Hips (cm)
          </label>

          <input
            type="number"
            name="hips"
            value={measurements.hips}
            onChange={handleChange}
            placeholder="98"
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Shoulder */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Shoulder (cm)
          </label>

          <input
            type="number"
            name="shoulder"
            value={measurements.shoulder}
            onChange={handleChange}
            placeholder="45"
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Inseam */}
        <div className="md:col-span-2">
          <label className="block mb-2 font-medium text-gray-700">
            Inseam (cm)
          </label>

          <input
            type="number"
            name="inseam"
            value={measurements.inseam}
            onChange={handleChange}
            placeholder="78"
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          <Save size={18} />
          Save Measurements
        </button>
      </div>

    </div>
  );
}