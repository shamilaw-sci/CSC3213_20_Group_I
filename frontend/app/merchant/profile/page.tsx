"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";

type MerchantProfile = {
  storeName: string;
  ownerName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  businessCategory: string | null;
  storeDescription: string | null;
  websiteUrl: string | null;
  socialMediaUrl: string | null;
  merchantLogo: string | null;
  status: string;
};

type MerchantProfileForm = {
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  businessCategory: string;
  storeDescription: string;
  websiteUrl: string;
  socialMediaUrl: string;
  merchantLogo: string;
};

const emptyProfile: MerchantProfileForm = {
  storeName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  businessCategory: "",
  storeDescription: "",
  websiteUrl: "",
  socialMediaUrl: "",
  merchantLogo: "",
};

function toForm(profile: MerchantProfile): MerchantProfileForm {
  return {
    storeName: profile.storeName,
    ownerName: profile.ownerName ?? "",
    email: profile.email,
    phone: profile.phone ?? "",
    address: profile.address ?? "",
    businessCategory: profile.businessCategory ?? "",
    storeDescription: profile.storeDescription ?? "",
    websiteUrl: profile.websiteUrl ?? "",
    socialMediaUrl: profile.socialMediaUrl ?? "",
    merchantLogo: profile.merchantLogo ?? "",
  };
}

function nullable(value: string) {
  return value.trim() || null;
}

export default function MerchantProfilePage() {
  const [form, setForm] = useState<MerchantProfileForm>(emptyProfile);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/v1/merchant/profile", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "Could not load merchant profile.");
        }

        setForm(toForm(data.merchant));
        setStatus(data.merchant.status);
      } catch (reason) {
        setMessage(reason instanceof Error ? reason.message : "Could not load merchant profile.");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function updateField(field: keyof MerchantProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/v1/merchant/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: form.storeName,
          ownerName: form.ownerName,
          email: form.email,
          phone: form.phone,
          address: nullable(form.address),
          businessCategory: form.businessCategory,
          storeDescription: nullable(form.storeDescription),
          websiteUrl: nullable(form.websiteUrl),
          socialMediaUrl: nullable(form.socialMediaUrl),
          merchantLogo: nullable(form.merchantLogo),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Could not update merchant profile.");
      }

      setForm(toForm(data.merchant));
      setStatus(data.merchant.status);
      setMessage("Merchant profile updated.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not update merchant profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tv-page min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-bold uppercase tracking-wide text-indigo-600">Merchant Profile</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Store details</h1>
            <p className="mt-2 text-sm text-slate-500">Keep customer-facing store and contact details current.</p>
          </div>
          <Link href="/merchant" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">
            Back to dashboard
          </Link>
        </div>

        {message && <p className="mt-6 rounded-xl bg-indigo-50 p-4 font-medium text-indigo-900">{message}</p>}

        <form onSubmit={saveProfile} className="tv-card mt-8 p-6 sm:p-8">
          {loading ? (
            <p className="text-sm text-gray-400">Loading merchant profile...</p>
          ) : (
            <>
              <div className="mb-6 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Approval status</p>
                <p className="mt-1 font-black text-indigo-700">{status || "Unknown"}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input value={form.storeName} onChange={(event) => updateField("storeName", event.target.value)} required placeholder="Business / Store Name" className="rounded-xl border border-slate-300 p-3" />
                <input value={form.ownerName} onChange={(event) => updateField("ownerName", event.target.value)} required placeholder="Owner Name" className="rounded-xl border border-slate-300 p-3" />
                <input value={form.email} onChange={(event) => updateField("email", event.target.value)} required type="email" placeholder="Merchant Email" className="rounded-xl border border-slate-300 p-3" />
                <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required placeholder="Phone Number" className="rounded-xl border border-slate-300 p-3" />
                <input value={form.businessCategory} onChange={(event) => updateField("businessCategory", event.target.value)} required placeholder="Business Category" className="rounded-xl border border-slate-300 p-3" />
                <input value={form.websiteUrl} onChange={(event) => updateField("websiteUrl", event.target.value)} type="url" placeholder="Website URL" className="rounded-xl border border-slate-300 p-3" />
                <input value={form.socialMediaUrl} onChange={(event) => updateField("socialMediaUrl", event.target.value)} type="url" placeholder="Social Media URL" className="rounded-xl border border-slate-300 p-3" />
                <input value={form.merchantLogo} onChange={(event) => updateField("merchantLogo", event.target.value)} type="url" placeholder="Merchant Logo URL" className="rounded-xl border border-slate-300 p-3" />
                <input value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Business Address" className="rounded-xl border border-slate-300 p-3 sm:col-span-2" />
                <textarea value={form.storeDescription} onChange={(event) => updateField("storeDescription", event.target.value)} placeholder="Store description" className="min-h-32 rounded-xl border border-slate-300 p-3 sm:col-span-2" />
              </div>

              <button disabled={saving} className="tv-button mt-6 w-full py-3 disabled:opacity-60">
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </>
          )}
        </form>
      </main>
    </div>
  );
}
