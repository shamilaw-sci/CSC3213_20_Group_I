"use client";

import Link from "next/link";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Camera, Eye, EyeOff, LayoutDashboard, Pencil, Save, ShieldCheck, Trash2, UserCircle, X } from "lucide-react";

type AdminAccount = {
  name: string;
  email: string;
  role: "ADMIN";
  department: string;
  designation: string;
  createdAt: string;
  lastLoginAt: string | null;
  hasAvatar: boolean;
};

export default function AdminProfile() {
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [savedAccount, setSavedAccount] = useState<AdminAccount | null>(null);
  const [editing, setEditing] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/v1/admin/account", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message ?? "Could not load the admin account.");
        if (!controller.signal.aborted) {
          setAccount(body.account);
          setSavedAccount(body.account);
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load the admin account.");
      });
    return () => controller.abort();
  }, []);

  function clearPasswords() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  function cancelEditing() {
    setAccount(savedAccount);
    clearPasswords();
    setError("");
    setEditing(false);
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account || busy) return;
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/v1/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: account.name,
          email: account.email,
          department: account.department,
          designation: account.designation,
          currentPassword,
          ...(newPassword ? { newPassword } : {}),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not update the admin account.");
      setAccount(body.account);
      setSavedAccount(body.account);
      clearPasswords();
      setEditing(false);
      setMessage(body.passwordChanged ? "Profile and password updated." : "Profile updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the admin account.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image || !account) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.set("image", image);
      const response = await fetch("/api/v1/admin/account/avatar", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not upload the profile picture.");
      const updated = { ...account, hasAvatar: true };
      setAccount(updated);
      setSavedAccount(updated);
      setAvatarVersion((value) => value + 1);
      setMessage("Profile picture updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not upload the profile picture.");
    } finally {
      setBusy(false);
    }
  }

  async function removeAvatar() {
    if (!account?.hasAvatar || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/v1/admin/account/avatar", { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not remove the profile picture.");
      const updated = { ...account, hasAvatar: false };
      setAccount(updated);
      setSavedAccount(updated);
      setMessage("Profile picture removed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not remove the profile picture.");
    } finally {
      setBusy(false);
    }
  }

  if (!account && !error) return <main className="min-h-screen bg-pink-50 p-6"><p>Loading admin profile…</p></main>;

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Administrator</p>
            <h1 className="text-3xl font-bold">Admin profile</h1>
          </div>
          <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800">
            <LayoutDashboard size={20} /> Admin dashboard
          </Link>
        </div>

        {error && <p role="alert" className="mb-5 rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
        {message && <p role="status" className="mb-5 rounded-xl bg-green-100 p-4 text-green-800">{message}</p>}

        {account && (
          <section className="rounded-2xl bg-white p-6 shadow">
            <div className="flex flex-col gap-6 border-b pb-6 sm:flex-row sm:items-center">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-purple-700">
                {account.hasAvatar ? (
                  <div role="img" aria-label={`${account.name} profile picture`} className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(/api/v1/admin/account/avatar?v=${avatarVersion})` }} />
                ) : (
                  <UserCircle size={72} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold">{account.name}</h2>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">{account.role}</span>
                </div>
                <p className="mt-1 text-gray-600">{account.email}</p>
                <p className="mt-1 text-sm text-gray-500">{account.designation}{account.department ? ` · ${account.department}` : ""}</p>
              </div>
              {!editing && (
                <button type="button" onClick={() => { setEditing(true); setError(""); setMessage(""); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800">
                  <Pencil size={18} /> Edit profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={saveAccount} className="mt-6 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 font-medium hover:bg-gray-50">
                    <Camera size={18} /> Change picture
                    <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} disabled={busy} />
                  </label>
                  {account.hasAvatar && <button type="button" onClick={() => void removeAvatar()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 font-medium text-red-700 hover:bg-red-50"><Trash2 size={18} /> Remove picture</button>}
                  <span className="self-center text-xs text-gray-500">JPG, PNG, or WebP; maximum 2 MB.</span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">Name<input required minLength={2} maxLength={100} value={account.name} onChange={(event) => setAccount({ ...account, name: event.target.value })} className="rounded-xl border p-3" /></label>
                  <label className="grid gap-2 text-sm font-medium">Email<input required type="email" maxLength={255} value={account.email} onChange={(event) => setAccount({ ...account, email: event.target.value })} className="rounded-xl border p-3" /></label>
                  <label className="grid gap-2 text-sm font-medium">Department<input maxLength={100} value={account.department} onChange={(event) => setAccount({ ...account, department: event.target.value })} className="rounded-xl border p-3" /></label>
                  <label className="grid gap-2 text-sm font-medium">Designation<input required minLength={2} maxLength={100} value={account.designation} onChange={(event) => setAccount({ ...account, designation: event.target.value })} className="rounded-xl border p-3" /></label>
                </div>

                <div className="border-t pt-6">
                  <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold"><ShieldCheck size={20} /> Security</h3>
                  <p className="mb-5 text-sm text-gray-500">Your current password is required to save profile details. Leave the new password blank to keep it.</p>
                  <div className="grid gap-5 md:grid-cols-3">
                    <label className="grid gap-2 text-sm font-medium">Current password<div className="relative"><input required type={showCurrentPassword ? "text" : "password"} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-xl border p-3 pr-11" /><button type="button" onClick={() => setShowCurrentPassword((value) => !value)} aria-label={showCurrentPassword ? "Hide current password" : "Show current password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-purple-700">{showCurrentPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
                    <label className="grid gap-2 text-sm font-medium">New password<div className="relative"><input type={showNewPassword ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-xl border p-3 pr-11" /><button type="button" onClick={() => setShowNewPassword((value) => !value)} aria-label={showNewPassword ? "Hide new password" : "Show new password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-purple-700">{showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
                    <label className="grid gap-2 text-sm font-medium">Confirm new password<div className="relative"><input type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border p-3 pr-11" /><button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-purple-700">{showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800 disabled:opacity-50"><Save size={18} /> {busy ? "Saving…" : "Save changes"}</button>
                  <button type="button" onClick={cancelEditing} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50"><X size={18} /> Cancel</button>
                </div>
              </form>
            ) : (
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">Name</dt><dd className="mt-1 font-semibold">{account.name}</dd></div>
                <div className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">Email</dt><dd className="mt-1 break-all font-semibold">{account.email}</dd></div>
                <div className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">Department</dt><dd className="mt-1 font-semibold">{account.department || "Not set"}</dd></div>
                <div className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">Last login</dt><dd className="mt-1 font-semibold">{account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : "Not recorded"}</dd></div>
              </dl>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
