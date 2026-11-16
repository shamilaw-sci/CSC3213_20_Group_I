import { redirect } from "next/navigation";

import Navbar from "@/app/components/Navbar";
import { getCurrentSession } from "@/server/auth/session";
import PlanCards from "./PlanCards";

export default async function CustomerPlanPage() {
  const current = await getCurrentSession();
  if (!current) redirect("/login");
  if (current.user.role === "ADMIN") redirect("/admin");
  if (current.user.role === "MERCHANT") redirect("/merchant");

  return (
    <div className="tv-page min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:pl-80">
        <section className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-7 text-center text-white shadow-xl sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-100">TryVora plans</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Choose Your Style. Find Your Perfect Fit.</h1>
          <p className="mt-4 text-lg text-indigo-100">Unlock more virtual try-ons and enjoy a personalized fashion experience with TryVora.</p>
        </section>

        <PlanCards />
      </main>
    </div>
  );
}
