/** WBS-2.4 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Digital Twin photo guidance. */
"use client";

import {
  CheckCircle2,
  Sun,
  Shirt,
  Camera,
  UserCheck,
} from "lucide-react";

const guidelines = [
  {
    icon: <Sun size={22} className="text-yellow-500" />,
    title: "Good Lighting",
    description: "Take the photo in a bright environment with even lighting.",
  },
  {
    icon: <Camera size={22} className="text-indigo-500" />,
    title: "Plain Background",
    description: "Use a clean background without objects or distractions.",
  },
  {
    icon: <UserCheck size={22} className="text-green-500" />,
    title: "Stand Straight",
    description: "Face the camera directly and keep your full body visible.",
  },
  {
    icon: <Shirt size={22} className="text-pink-500" />,
    title: "Wear Fitted Clothes",
    description: "Avoid oversized clothing for better fitting visualization.",
  },
];

export default function PhotoGuidelines() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Photo Guidelines
      </h2>

      <p className="mb-4 text-gray-500">
        Follow these simple recommendations for a clear Digital Twin photo.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {guidelines.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 transition hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
              {item.icon}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {item.description}
              </p>
            </div>

            <CheckCircle2 size={18} className="mt-1 shrink-0 text-green-500" />
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <h4 className="font-semibold text-indigo-700 mb-2">
          Tips for Best Results
        </h4>

        <ul className="ml-5 list-disc space-y-1 text-sm text-gray-600">
          <li>Capture your full body from head to toe.</li>
          <li>Keep your arms slightly away from your body.</li>
          <li>Avoid blurry or low-quality images.</li>
          <li>Keep your full body inside the crop frame.</li>
          <li>Use natural posture without bending.</li>
        </ul>
      </div>

    </div>
  );
}
