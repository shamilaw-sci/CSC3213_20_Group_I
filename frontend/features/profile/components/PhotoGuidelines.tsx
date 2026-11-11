/** WBS-2.4 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Digital Twin photo guidance. */
"use client";

import {
  CheckCircle2,
  Sun,
  Shirt,
  Camera,
  UserCheck,
} from "lucide-react";
import Image from "next/image";

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

export default function PhotoGuidelines({ compact = false, modal = false }: { compact?: boolean; modal?: boolean }) {
  if (modal) {
    const goodExamples = ["/images/digitalTwin/twin1.jpg", "/images/digitalTwin/twin3.jpg", "/images/digitalTwin/twin5.jpeg"];
    const badExamples = ["/images/digitalTwin/twin2.jpg.webp", "/images/digitalTwin/twin4.jpeg", "/images/digitalTwin/twin6.jpg.webp"];
    return (
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <h2 id="photo-guidelines-title" className="text-center text-3xl font-bold text-gray-700">Photo guidelines</h2>
        <p className="mt-2 text-center text-gray-500">Pick a clear photo so your try-on comes out sharp.</p>
        {[{ title: "Good Examples:", note: "Front-facing, full upper body and face visible.", images: goodExamples, tone: "emerald" }, { title: "Bad Examples:", note: "Blurry, cropped, or side-angle shots distort results.", images: badExamples, tone: "rose" }].map((group) => (
          <section key={group.title} className={`mt-5 rounded-2xl p-4 ${group.tone === "emerald" ? "bg-emerald-50" : "bg-rose-50"}`}>
            <h3 className={`text-xl font-bold ${group.tone === "emerald" ? "text-emerald-600" : "text-rose-500"}`}>{group.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{group.note}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {group.images.map((src) => <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-xl"><Image src={src} alt="" fill sizes="140px" className="object-cover" /></div>)}
            </div>
          </section>
        ))}
        <p className="mt-4 text-center text-xs text-gray-500">PNG or JPEG · maximum 5 MB · minimum 400 × 600 pixels</p>
      </div>
    );
  }
  if (compact) {
    return (
      <div className="space-y-3 text-sm text-gray-700">
        <p>Use a clear, well-lit, full-body photo facing the camera against a simple background.</p>
        <ul className="space-y-2">
          {guidelines.map((item) => (
            <li key={item.title} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0" aria-hidden="true">{item.icon}</span>
              <span>
                <strong className="font-semibold text-gray-900">{item.title}:</strong>{" "}
                {item.description}
              </span>
            </li>
          ))}
        </ul>
        <p className="rounded-lg bg-indigo-50 px-3 py-2 text-indigo-900">
          PNG or JPEG · maximum 5 MB · minimum 400 × 600 pixels
        </p>
      </div>
    );
  }

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
