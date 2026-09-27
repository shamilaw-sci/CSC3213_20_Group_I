/** WBS-2.2 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Profile account interface. */
"use client";

import { CheckCircle2, Mail, MapPin, Save, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || profile.account.email) return;
    const [firstName = "", ...rest] = user.name.split(" ");
    updateAccount({ firstName, lastName: rest.join(" "), email: user.email });
  }, [profile.account.email, updateAccount, user]);

  async function save() {
    setError("");
    try {
      await saveProfile();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save account details.");
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
    router.replace("/");
  }

  return (
    <div className="space-y-7">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><UserRound size={29} /></div><div><h2 className="text-2xl font-bold">Account & privacy</h2><p className="mt-1 text-sm text-white/80">Your details support a personalised fitting-room experience.</p></div></div><div className="rounded-xl bg-white/15 px-4 py-3 text-sm"><ShieldCheck className="mr-2 inline" size={17} />Your saved account details are stored in your TryVora profile.</div></div>
      </section>
        <section className="tv-card p-6 sm:p-8">
        <div className="flex items-start gap-3"><Mail className="mt-0.5 text-indigo-600" size={21} /><div><h3 className="text-xl font-bold text-gray-900">Personal information</h3><p className="mt-1 text-sm text-gray-500">Keep your contact information up to date.</p></div></div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">{fields.map((field) => <label key={field.key} className={`block ${field.span ?? ""}`}><span className="mb-2 block text-sm font-semibold text-gray-700">{field.label}</span><input type={field.type} value={profile.account[field.key]} placeholder={field.placeholder} onChange={(event) => updateAccount({ [field.key]: event.target.value } as Partial<Account>)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" /></label>)}</div>
        <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-sm text-gray-500"><MapPin size={16} /> Measurements and image settings are managed in their own tabs.</p><div className="flex flex-col-reverse gap-3 sm:flex-row"><button type="button" onClick={deleteAccount} className="rounded-xl border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50">Delete account</button><button type="button" onClick={save} className="tv-button inline-flex items-center justify-center gap-2 px-5 py-3"><Save size={18} /> Save changes</button></div></div>
        {saved && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800"><CheckCircle2 size={18} /> Account changes saved to your profile.</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800">{error}</p>}
      </section>
    </div>
  );
}
