import { redirect } from "next/navigation";
import { Check, CreditCard, Sparkles, Star, Zap } from "lucide-react";

import Navbar from "@/app/components/Navbar";
import { getCurrentSession } from "@/server/auth/session";

const plans = [
  {
    name: "Starter",
    price: "Rs. 0",
    period: "Forever",
    description: "Start exploring your style for free.",
    icon: Sparkles,
    badge: undefined,
    features: ["1 Digital Twin", "3 virtual try-ons per month", "Browse available outfits", "Basic photo upload and cropping", "Save up to 5 favourite outfits", "Standard fitting preview"],
    action: "Get Started – Free",
  },
  {
    name: "Style Plus",
    price: "Rs. 990",
    period: "Month",
    description: "Enjoy more freedom to experiment with your style.",
    icon: Star,
    badge: "MOST POPULAR",
    features: ["Everything in Starter", "25 virtual try-ons per month", "Save up to 50 favourite outfits", "Personal Digital Twin", "Fitting history", "Priority processing, if supported"],
    action: "Upgrade to Style Plus",
  },
  {
    name: "Style Pro",
    price: "Rs. 1,990",
    period: "Month",
    description: "The ultimate fashion experience for style enthusiasts.",
    icon: Zap,
    badge: "PREMIUM",
    features: ["Everything in Style Plus", "60 virtual try-ons per month", "Unlimited favourite outfits", "Unlimited fitting history", "Premium fitting quality, if supported", "Priority generation, if supported", "Early access to new features"],
    action: "Upgrade to Style Pro",
  },
] as const;

export default async function CustomerPlanPage() {
  const current = await getCurrentSession();
  if (!current) redirect("/login");
  if (current.user.role === "ADMIN") redirect("/admin");
  if (current.user.role === "MERCHANT") redirect("/merchant");

  return (
    <div className="tv-page min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:pl-80">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">TryVora plans</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Choose Your Style. Find Your Perfect Fit.</h1>
          <p className="mt-4 text-lg text-slate-600">Unlock more virtual try-ons and enjoy a personalized fashion experience with TryVora.</p>
        </section>

        <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm" aria-labelledby="current-plan-heading">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700"><CreditCard size={24} aria-hidden="true" /></div>
            <div>
              <h2 id="current-plan-heading" className="text-lg font-bold text-slate-950">Your Current Plan</h2>
              <p className="mt-1 text-sm text-slate-600">Customer subscription billing is not connected yet.</p>
            </div>
            <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">No plan selected</span>
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {plans.map(({ name, price, period, description, icon: Icon, badge, features, action }) => (
            <article key={name} className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${name === "Style Plus" ? "border-indigo-500 ring-2 ring-indigo-200 lg:-mt-3 lg:mb-3" : "border-slate-200"}`}>
              {badge && <span className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-black tracking-wide text-white ${name === "Style Plus" ? "bg-indigo-600" : "bg-violet-600"}`}>{badge}</span>}
              <div className="flex items-center justify-between">
                <div className={`rounded-2xl p-3 ${name === "Style Plus" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"}`}><Icon size={24} aria-hidden="true" /></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly billing</span>
              </div>
              <h2 className="mt-6 text-2xl font-black text-slate-950">{name}</h2>
              <p className="mt-3 text-3xl font-black text-indigo-700">{price}<span className="text-sm font-semibold text-slate-500"> / {period}</span></p>
              <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{description}</p>
              <ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 pt-6">
                {features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-slate-700"><Check size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> <span>{feature}</span></li>)}
              </ul>
              <button type="button" disabled className={`mt-8 w-full rounded-xl px-4 py-3 font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${name === "Style Plus" ? "bg-indigo-600 text-white" : "border border-indigo-200 bg-white text-indigo-700"}`}>{action}</button>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-slate-500">Plans are currently a visual preview. Payment, subscription activation, usage limits, and plan management will be connected when customer billing is implemented.</p>
      </main>
    </div>
  );
}
