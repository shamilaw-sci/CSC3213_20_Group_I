"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function DigitalTwin() {
  const { user, isGuest, ready } = useAuth();
  const router = useRouter();

  function handleGetStarted() {
    if (!ready) return;
    router.push(user && !isGuest ? "/profile?tab=digitalTwin" : "/register");
  }

  return (
    <div className="bg-gradient-to-r from-blue-400 to-purple-600 py-20 px-6">

      <div className="max-w-2xl mx-auto text-center">

        
        <h2 className="text-4xl md:text-5xl font-bold text-white mt-20">
          Create Your Digital Twin Today

        </h2>

        
        <p className="mt-4 text-lg text-white">
          Join thousands of fashion enthusiasts experiencing the future <br/>of online shopping


        </p>

        
        <div className="mt-8 mb-10  ">
          <button
            type="button"
            onClick={handleGetStarted}
            disabled={!ready}
            className="px-6 py-3 border border-white text-white rounded-lg hover:bg-blue-600 hover:text-white transition disabled:cursor-wait disabled:opacity-70"
          >
            {ready ? "Get Started" : "Checking account…"}
          </button>
        </div>

      </div>

    </div>
  );
}
