"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (password !== data.get("confirmPassword")) {
      setError("Passwords do not match.");
      return;
    }
    if (data.get("terms") !== "on") {
      setError("Please accept the terms to continue.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await register({ name: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), password });
      router.replace("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#2E1065] via-[#9333EA] to-[#2563EB]">

      {/* Background Blobs */}
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-pink-500/30 blur-3xl"></div>
      <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl"></div>
      <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/30 blur-3xl"></div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">

        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20 lg:grid-cols-2">

          {/* Left Side */}
          <div className="hidden flex-col justify-center bg-gradient-to-br from-purple-900/60 via-fuchsia-700/50 to-blue-700/50 p-12 text-white lg:flex">

            <h1 className="text-5xl font-extrabold">
              StyleTwin
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-200">
              Create your Digital Twin and experience the future of fashion
              through AI-powered virtual fitting.
            </p>

            <div className="mt-12 space-y-8">

              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur-md">
                  👕
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    Virtual Try-On
                  </h3>

                  <p className="text-sm text-gray-300">
                    Try clothes before purchasing.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur-md">
                  🤖
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    AI Digital Twin
                  </h3>

                  <p className="text-sm text-gray-300">
                    Personalized body model powered by AI.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur-md">
                  🛍️
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    Multi-Brand Shopping
                  </h3>

                  <p className="text-sm text-gray-300">
                    Compare products from multiple stores.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Side */}
          <div className="flex items-center justify-center bg-white p-8 sm:p-12">

            <div className="w-full max-w-md">

              <h2 className="text-4xl font-bold text-gray-900">
                Create Account
              </h2>

              <p className="mt-3 text-gray-500">
                Join StyleTwin and begin your AI fashion journey.
              </p>

              <form onSubmit={handleSubmit} aria-busy={busy} className="mt-8 space-y-5">

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    aria-label="Full name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition-all duration-300 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-300/40"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    aria-label="Email address"
                    autoComplete="email"
                    required
                    maxLength={255}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition-all duration-300 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-300/40"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    aria-label="Password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition-all duration-300 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-300/40"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    aria-label="Confirm password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition-all duration-300 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-300/40"
                  />
                </div>

                {/* Checkbox */}
                <div className="flex items-start gap-3">

                  <input
                    id="terms"
                    name="terms"
                    required
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 accent-fuchsia-600"
                  />

                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600"
                  >
                    I agree to the{" "}
                    <span className="font-semibold text-fuchsia-600">
                      Terms & Conditions
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-fuchsia-600">
                      Privacy Policy
                    </span>
                  </label>

                </div>

                {/* Register Button */}
                <p className="text-sm text-gray-600">Use at least 8 characters, including an uppercase letter and a number.</p>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/50"
                >
                  {busy ? "Creating account..." : "Create Account"}
                </button>

                {/* Guest */}
                <button
                  type="button"
                  className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Continue as Guest
                </button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text font-bold text-transparent hover:opacity-80"
                  >
                    Login
                  </Link>
                </div>

              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
