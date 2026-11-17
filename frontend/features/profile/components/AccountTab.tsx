/** WBS-2.2 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Profile account interface. */
"use client";

import { CheckCircle2, LoaderCircle, Mail, MapPin, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import type { Account } from "../types/profile";

const fields: Array<{ key: keyof Account; label: string; type: string; placeholder: string; span?: string }> = [
  { key: "firstName", label: "First name", type: "text", placeholder: "Jane" },
  { key: "lastName", label: "Last name", type: "text", placeholder: "Doe" },
  { key: "email", label: "Email address", type: "email", placeholder: "jane@example.com" },
  { key: "phone", label: "Phone number", type: "tel", placeholder: "+94 77 123 4567" },
  { key: "dateOfBirth", label: "Date of birth", type: "date", placeholder: "" },
  { key: "country", label: "Country", type: "text", placeholder: "Sri Lanka", span: "md:col-span-2" },
];

export default function AccountTab() {
  const { profile, updateAccount, saveProfile } = useProfile();
  const { user, logout } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user || profile.account.email) return;
    const [firstName = "", ...rest] = user.name.split(" ");
    updateAccount({ firstName, lastName: rest.join(" "), email: user.email });
  }, [profile.account.email, updateAccount, user]);

  async function save() {
    if (isSaving) return;
    setError("");
    setSaved(false);
    setIsSaving(true);
    try {
      await saveProfile();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save account details.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Delete your TryVora account? This will sign you out and revoke your active sessions.")) return;
    setError("");
    const response = await fetch("/api/v1/profiles/me", { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json().catch(() => ({})) as { message?: string };
      setError(result.message ?? "Could not delete your account.");
      return;
    }
    await logout();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 text-indigo-600" size={21} />
          <div><h3 className="text-xl font-bold text-gray-900">Personal information</h3><p className="mt-1 text-sm text-gray-500">Keep your contact information up to date.</p></div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className={`block ${field.span ?? ""}`}>
              <span className="mb-2 block text-sm font-semibold text-gray-700">{field.label}</span>
              <input type={field.type} value={profile.account[field.key]} placeholder={field.placeholder} onChange={(event) => updateAccount({ [field.key]: event.target.value } as Partial<Account>)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" />
            </label>
          ))}
        </div>
        <div className="mt-5 border-t border-gray-100 pt-5">
          <button type="button" onClick={() => void save()} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:bg-indigo-300">
            {isSaving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? "Saving changes…" : "Save changes"}
          </button>
          {saved && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800"><CheckCircle2 size={18} /> Account changes saved to your profile.</p>}
          {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800">{error}</p>}
        </div>
      </section>
      <aside className="space-y-5">
        <section className="rounded-2xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-6 text-white shadow-sm">
          <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15"><UserRound size={26} /></div><h2 className="text-xl font-bold">Account & privacy</h2></div>
          <p className="mt-4 text-sm text-white/90">Your details support a personalised fitting-room experience.</p>
          <p className="mt-4 rounded-xl bg-white/15 p-3 text-sm"><ShieldCheck className="mr-2 inline" size={17} />Your saved account details are stored in your TryVora profile.</p>
          <p className="mt-4 flex items-start gap-2 text-sm text-white/90"><MapPin size={16} className="mt-0.5 shrink-0" /> Measurements and image settings are managed in their own tabs.</p>
        </section>
        <section className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900">Delete account</h3>
          <p className="mt-2 text-sm text-gray-600">This removes your account and signs you out. This action cannot be undone.</p>
          <button type="button" onClick={() => void deleteAccount()} className="mt-4 rounded-xl border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">Delete account</button>
        </section>
      </aside>
    </div>
  );
}
