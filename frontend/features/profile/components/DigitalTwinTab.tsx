/** WBS-2.4 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Digital Twin photo management UI. */
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, X } from "lucide-react";

import { useProfile } from "../hooks/useProfile";
import PhotoGuidelines from "./PhotoGuidelines";
import UploadBox from "./UploadBox";

export default function DigitalTwinTab() {
  const { profile, uploadImage, removeImage } = useProfile();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTwin() {
      const response = await fetch("/api/v1/digital-twins/current", { cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json() as { twin: { imageUrl: string } | null };
      if (result.twin) uploadImage(result.twin.imageUrl);
    }
    void loadTwin();
  // Load the saved twin once; uploadImage is a context action recreated on renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpload(file: File) {
    setError("");
    const formData = new FormData();
    formData.set("image", file);
    const response = await fetch("/api/v1/digital-twins/current", { method: "POST", body: formData });
    const result = await response.json().catch(() => ({})) as { message?: string; twin?: { imageUrl: string } };
    if (!response.ok || !result.twin) throw new Error(result.message ?? "Could not save your digital twin.");
    uploadImage(result.twin.imageUrl);
    setPreviewOpen(false);
  }

  async function handleRemove() {
    setError("");
    setIsDeleting(true);
    try {
      const response = await fetch("/api/v1/digital-twins/current", { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { message?: string };
        setError(result.message ?? "Could not delete your Digital Twin photo.");
        return;
      }
      removeImage();
      setPreviewOpen(false);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div><h2 className="text-3xl font-bold text-gray-900">Your Digital Twin</h2><p className="mt-2 text-gray-500">Upload and manage a clear full-body photo for your virtual fitting room.</p></div>
      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Current Photo</h3>
          <UploadBox onUpload={handleUpload} preview={profile.digitalTwin.image} onDeleteRequest={() => setDeleteDialogOpen(true)} />
          {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          {profile.digitalTwin.image ? <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"><p className="flex items-center gap-2"><CheckCircle2 size={18} /> Photo uploaded successfully</p><p className="mt-2 flex items-center gap-2"><CheckCircle2 size={18} /> Digital Twin photo ready</p><button type="button" onClick={() => setPreviewOpen(true)} className="mt-4 font-semibold text-indigo-700 underline underline-offset-4">View photo preview</button></div> : <p className="mt-4 text-sm text-gray-500">Upload requirements: PNG or JPEG · Maximum 5 MB</p>}
        </section>
        <PhotoGuidelines />
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="twin-preview-title" onClick={() => setPreviewOpen(false)}>
          <section className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview" className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"><X size={19} /></button>
            <h3 id="twin-preview-title" className="text-xl font-bold text-gray-900">Digital Twin Photo Preview</h3>
            <p className="mt-1 text-sm text-gray-500">Your saved full-body photo.</p>
            <div className="mt-5 rounded-xl bg-gray-50 p-5"><img src={profile.digitalTwin.image ?? ""} alt="Uploaded full-body Digital Twin photo" className="mx-auto max-h-[65vh] w-auto max-w-full rounded-xl object-contain" /></div>
            <button type="button" onClick={() => setPreviewOpen(false)} className="mt-5 w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-900">Close</button>
          </section>
        </div>
      )}

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-twin-title">
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 id="delete-twin-title" className="text-xl font-bold text-gray-900">Delete Digital Twin photo?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">Are you sure you want to delete your Digital Twin photo? This action cannot be undone.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={isDeleting} onClick={() => setDeleteDialogOpen(false)} className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-800">Cancel</button><button type="button" disabled={isDeleting} onClick={() => void handleRemove()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{isDeleting && <LoaderCircle size={17} className="animate-spin" />} Delete</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
