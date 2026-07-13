import Link from "next/link";
import Header from "@/components/Header";

export default function LoginPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

        <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Sign In
          </h1>

          {/* Email */}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* Login Button */}
          <button className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 transition">
            Login
          </button>

          {/* Divider */}
          <div className="my-6 text-center text-gray-400">
            OR
          </div>

          {/* Register Link */}
          <Link
            href="/register"
            className="block text-center text-violet-600 hover:underline"
          >
            Create an account
          </Link>

          {/* Guest Link */}
          <Link
            href="/guest"
            className="block text-center mt-3 text-gray-600 hover:underline"
          >
            Continue as Guest
          </Link>

        </div>

      </main>
    </>
  );
}