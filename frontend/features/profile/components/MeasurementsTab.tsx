/** WBS-2.2 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Measurement tab composition. */
"use client";

import MeasurementForm from "./MeasurementForm";

export default function MeasurementsTab() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          My Measurements
        </h2>

        <p className="text-gray-500 mt-2">
          Your measurements help TryVora provide a more personalized fitting experience and better clothing size recommendations.
        </p>
      </div>

      {/* Measurement Form */}
      <MeasurementForm />

    </div>
  );
}
