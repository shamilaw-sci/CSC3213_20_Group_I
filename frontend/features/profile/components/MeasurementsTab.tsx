/** WBS-2.2 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Measurement tab composition. */
"use client";

import MeasurementForm from "./MeasurementForm";

export default function MeasurementsTab() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Body Measurements
        </h2>

        <p className="text-gray-500 mt-2">
          Enter your body measurements to improve the accuracy of your AI Digital Twin and virtual try-on experience.
        </p>
      </div>

      {/* Measurement Form */}
      <MeasurementForm />

    </div>
  );
}
