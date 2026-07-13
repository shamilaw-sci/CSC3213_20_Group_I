"use client";

import Header from "@/components/Header";
import Link from "next/link";



import { useRouter } from "next/navigation";


export default function RegisterPage() {

        const router = useRouter();

    const handleRegister = () => {
        // later you will add validation / API call here

        router.push("/dashboard");

    };
  return (

        



    <>
      <Header />

      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

          <h1 className="text-3xl font-bold text-center text-black mb-8" >
            Create Account
          </h1>

          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-lg p-3 mb-4 text-black placeholder:text-gray-400"
          />

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

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border rounded-lg p-3 mb-4 text-black placeholder:text-gray-400"
          />

         <button
            onClick={handleRegister}
            className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700"
            >
            Create Account
            </button>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?
          </p>

          <Link
            href="/login"
            className="block text-center text-violet-600 hover:underline mt-2"
          >
            Sign In
          </Link>

        </div>

      </main>
    </>
  );
}