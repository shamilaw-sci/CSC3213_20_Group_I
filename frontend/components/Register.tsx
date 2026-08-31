/** WBS-1.x | Owner: S/21/315 | Branch: feature/s21-315-auth-access | Scope: Authentication, users and access control. */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/features/auth/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("confirmation") ?? "");
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return setError("Use 8+ characters with an uppercase letter and a number.");
    if (password !== confirmation) return setError("Passwords do not match.");
    setError("");
    setIsSubmitting(true);
    try { await register({ name, email, password }); router.push("/explore"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create the account."); }
    finally { setIsSubmitting(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 px-4 py-10"><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><Link href="/" className="text-sm font-bold text-indigo-600">← TryVora</Link><h1 className="mt-6 text-3xl font-bold text-gray-900">Create account</h1><p className="mt-2 text-gray-600">Start building your fitting-room profile.</p><form onSubmit={handleSubmit} className="mt-7 space-y-5"><label className="block text-sm font-semibold text-gray-700">Full name<input name="name" autoComplete="name" required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" /></label><label className="block text-sm font-semibold text-gray-700">Email<input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" /></label><label className="block text-sm font-semibold text-gray-700">Password<input name="password" type="password" autoComplete="new-password" required minLength={8} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" /></label><label className="block text-sm font-semibold text-gray-700">Confirm password<input name="confirmation" type="password" autoComplete="new-password" required minLength={8} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" /></label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{isSubmitting ? "Creating account…" : "Create account"}</button></form><p className="mt-6 text-center text-sm text-gray-600">Already registered? <Link href="/login" className="font-bold text-indigo-600">Log in</Link></p><p className="mt-4 text-center text-xs text-gray-400">Passwords are hashed and sessions use secure HTTP-only cookies.</p></section></main>;
}
