"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const user = await login(String(form.get("email")), String(form.get("password")));
      router.push(user.role === "ADMIN" ? "/admin" : "/explore");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <>
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gradient-to-r from-purple-400 to-pink-300 ">
        
        {/* 🔥 MODERN LOGIN CARD WRAPPER */}
        <div className="sm:mx-auto sm:w-full sm:max-w-sm border border-gray-200 rounded-2xl shadow-lg bg-white/80 backdrop-blur-md p-8 hover:shadow-indigo-200 transition-all duration-300">
          
          {/* LOGO + TITLE */}
          <div className="text-center">
            <img
              alt="Your Company"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
              className="mx-auto h-10 w-auto"
            />

            <h2 className="mt-6 text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Sign in to your account
            </h2>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>

              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>

                <a href="#" className="text-sm font-semibold text-indigo-500 hover:text-indigo-700">
                  Forgot password?
                </a>
              </div>

              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>
            </div>

            {/* BUTTON */}
            <div>
                <button
                  type="submit"
                  disabled={submitting}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md hover:shadow-indigo-300 transition"
              >
                  {submitting ? "Signing in..." : "Sign in"}
              </button>
            </div>

          </form>

          {/* FOOTER */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Not a member?{" "}
            <Link href="/register" className="font-semibold text-indigo-500 hover:text-indigo-700">
              Start a 14 day free trial
            </Link>
          </p>

        </div>
      </div>
    </>
  )
}
