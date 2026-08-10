"use client";
import { useRouter } from "next/navigation";
export default function Dashboard() {
  const isReturningUser = true;
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col bg-gray-100 px-6 py-10">

      {/* Header Section */}
      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold text-black">
          {isReturningUser ? "Welcome Back 👋" : "Welcome 👋"}
        </h1>

        <p className="mt-3 text-gray-600 text-lg max-w-xl mx-auto">
          Your personal digital fitting room is ready. Explore outfits, try styles, and discover your perfect look.
        </p>

        <button 
         onClick={() => router.push("/profile")}
         className="mt-6 px-5 py-2 rounded-lg bg-violet-600 text-white font-medium shadow-md hover:bg-violet-700 hover:shadow-lg transition">
           Start Try-On Experience →
        </button>
      </div>

      {/* Feature Boxes */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition">
          <img src="https://cdn-icons-png.flaticon.com/512/892/892458.png" className="w-12 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-black">Try Ons</h2>
          <p className="text-gray-500 text-sm mt-2">Try outfits virtually in real-time</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition">
          <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" className="w-12 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-black">Favorites</h2>
          <p className="text-gray-500 text-sm mt-2">Save your favorite styles</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition">
          <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png" className="w-12 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-black">Available Items</h2>
          <p className="text-gray-500 text-sm mt-2">Browse clothing collections</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition">
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828919.png" className="w-12 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-black">Ready Looks</h2>
          <p className="text-gray-500 text-sm mt-2">Pre-styled outfit combinations</p>
        </div>

      </div>

    </main>
  );
}