"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import PasswordInput from "@/components/PasswordInput";

export default function PasswordRecoveryForm({ token, returnTo }: { token?: string; returnTo?: string }) {
  const resetting = token !== undefined;
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    setError("");
    if (resetting && password !== data.get("confirmPassword")) {
      setError("Passwords do not match.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/auth/${resetting ? "reset-password" : "forgot-password"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetting
          ? { token, password }
          : { email: String(data.get("email") ?? ""), ...(returnTo ? { returnTo } : {}) }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "The request failed. Please try again.");
      setMessage(resetting ? "Password updated. Sign in with your new password." : "If an account exists, reset instructions will be sent. Check your inbox and spam folder.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The request failed. Please try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  const invalidToken = resetting && (!token || token.length < 20 || token.length > 200);
  const safeReturnTo = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : null;
  const loginHref = safeReturnTo ? `/login?returnTo=${encodeURIComponent(safeReturnTo)}` : "/login";
  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900";
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-200 to-pink-100 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">{resetting ? "Reset password" : "Forgot password?"}</h1>
        {invalidToken ? (
          <p role="alert" className="text-red-700">This reset link is missing or invalid. Request a new link.</p>
        ) : message ? (
          <p role="status" className="text-green-800">{message}</p>
        ) : (
          <form onSubmit={submit} aria-busy={busy} className="space-y-4">
            {resetting ? <>
              <div><label htmlFor="password" className="mb-1 block text-gray-700">New password</label>
                <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={8} maxLength={128} className={inputClass} /></div>
              <div><label htmlFor="confirmPassword" className="mb-1 block text-gray-700">Confirm password</label>
                <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required minLength={8} maxLength={128} className={inputClass} /></div>
              <p className="text-sm text-gray-600">Use at least 8 characters, including an uppercase letter and a number.</p>
            </> : <div>
              <label htmlFor="email" className="mb-1 block text-gray-700">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required maxLength={255} className={inputClass} />
            </div>}
            {error && <p role="alert" className="text-red-700">{error}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
              {busy ? "Please wait..." : resetting ? "Update password" : "Send reset link"}
            </button>
          </form>
        )}
        <div className="mt-6 flex justify-between gap-4 text-sm text-indigo-700">
          <Link href={loginHref}>Back to sign in</Link>
          {resetting && <Link href="/forgot-password">Request a new link</Link>}
        </div>
      </section>
    </main>
  );
}
