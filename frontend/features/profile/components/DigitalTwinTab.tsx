"use client";

import UploadBox from "./UploadBox";
import UploadPreview from "./UploadPreview";
import PhotoGuidelines from "./PhotoGuidelines";
import { useProfile } from "../hooks/useProfile";

export default function DigitalTwinTab() {
  const { profile } = useProfile();

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Digital Twin
        </h2>

        <p className="text-gray-500 mt-2">
          Upload a clear full-body image to create your AI Digital Twin.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Left Side */}
        <div className="space-y-6">

          {/* Upload Box */}
          {!profile.digitalTwin.image && (
            <UploadBox />
          )}

          {/* Preview */}
          {profile.digitalTwin.image && (
            <UploadPreview />
          )}

        </div>

        {/* Right Side */}
        <div>
          <PhotoGuidelines />
        </div>

      </div>

    </div>
  );
}