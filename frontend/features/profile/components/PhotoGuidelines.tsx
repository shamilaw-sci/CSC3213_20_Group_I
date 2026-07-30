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
    description: "Avoid oversized clothing for more accurate body measurements.",
  },
];

export default function PhotoGuidelines() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Photo Guidelines
      </h2>

      <p className="text-gray-500 mb-6">
        Follow these recommendations to generate a more accurate AI Digital Twin.
      </p>

      <div className="space-y-5">
        {guidelines.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
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

            <CheckCircle2
              size={20}
              className="text-green-500 mt-1"
            />
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-8 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
        <h4 className="font-semibold text-indigo-700 mb-2">
          Tips for Best Results
        </h4>

        <ul className="list-disc ml-5 text-sm text-gray-600 space-y-2">
          <li>Capture your full body from head to toe.</li>
          <li>Keep your arms slightly away from your body.</li>
          <li>Avoid blurry or low-quality images.</li>
          <li>Do not crop any part of your body.</li>
          <li>Use natural posture without bending.</li>
        </ul>
      </div>

    </div>
  );
}