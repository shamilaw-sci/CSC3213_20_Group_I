/** WBS-1.x | Owner: S/21/315 | Branch: feature/s21-315-auth-access | Scope: Authentication, users and access control. */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/features/auth/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    setIsSubmitting(true);
    try {
      const signedInUser = await login(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
      router.push(signedInUser.role === "ADMIN" ? "/admin" : signedInUser.role === "MERCHANT" ? "/merchant" : "/explore");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in.");
    } finally { setIsSubmitting(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 px-4 py-10"><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><Link href="/" className="text-sm font-bold text-indigo-600">← TryVora</Link><h1 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h1><p className="mt-2 text-gray-600">Sign in to access your fitting room.</p><form onSubmit={handleSubmit} className="mt-7 space-y-5"><label className="block text-sm font-semibold text-gray-700">Email<input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" /></label><label className="block text-sm font-semibold text-gray-700">Password<input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" /></label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{isSubmitting ? "Signing in…" : "Sign in"}</button></form><p className="mt-6 text-center text-sm text-gray-600">No account yet? <Link href="/register" className="font-bold text-indigo-600">Create one</Link></p><p className="mt-4 text-center text-xs text-gray-400">Your session is stored in a secure HTTP-only cookie.</p></section></main>;
}
