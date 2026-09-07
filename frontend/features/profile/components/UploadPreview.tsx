/** WBS-2.x | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Scope: Profile, Digital Twin, storage and privacy. */
"use client";

import { Camera, Trash2 } from "lucide-react";
import { useRef, ChangeEvent } from "react";
import { useProfile } from "../hooks/useProfile";

export default function UploadPreview() {
  const { profile, uploadImage, removeImage } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replace Image
  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  // New Image Selected
  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    uploadImage(imageUrl);
  };

  // If no image uploaded
  if (!profile.digitalTwin.image) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-gray-900 mb-5">
        Uploaded Image
      </h2>

      {/* Image */}
      <div className="overflow-hidden rounded-2xl border border-gray-200">
        <img
          src={profile.digitalTwin.image}
          alt="Digital Twin"
          className="w-full h-[500px] object-cover"
        />
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">

        <button
          onClick={handleReplace}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <Camera size={18} />
          Replace
        </button>

        <button
          onClick={removeImage}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition"
        >
          <Trash2 size={18} />
          Remove
        </button>

      </div>

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

    </div>
  );
}
