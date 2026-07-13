import Header from "@/components/Header";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

          <h1 className="text-3xl font-bold text-center mb-8 text-black  ">
            Sign In
          </h1>

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-lg p-3 mb-4 text-black placeholder:text-gray-400"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3 mb-4 text-black placeholder:text-gray-400"
          />

          <button className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700">
            Login
          </button>

          <p className="text-center mt-6 text-gray-600">
            Don't have an account?
          </p>

          <Link
            href="/register"
            className="block text-center text-violet-600 hover:underline mt-2"
          >
            Create an Account
          </Link>

        </div>

      </main>
    </>
  );
}