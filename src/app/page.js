import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-6">
        
        <h1 className="text-5xl font-bold text-gray-900">
          Digital Fitting Room
        </h1>

        <p className="mt-4 text-gray-600 text-lg max-w-xl">
          Create Your Digital Twin Today
Join thousands of fashion enthusiasts experiencing the future of online shopping

        </p>

        <div className="flex gap-4">

        <Link
          href="/login"
          className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition inline-block"
>
           Sign In
</Link>

  <button className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition">
    Continue as Guest
  </button>

</div>
      </main>
    </>
  );
}
