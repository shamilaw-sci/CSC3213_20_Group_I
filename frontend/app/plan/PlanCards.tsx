"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Sparkles, Star, Zap } from "lucide-react";

const plans = [
  { code: "STARTER", name: "Starter", price: "Rs. 0", period: "Forever", description: "Start exploring your style for free.", icon: Sparkles, badge: undefined, features: ["1 Digital Twin", "3 virtual try-ons per month", "Browse available outfits", "Basic photo upload and cropping", "Save up to 5 favourite outfits", "Standard fitting preview"] },
  { code: "STYLE_PLUS", name: "Style Plus", price: "Rs. 990", period: "Month", description: "Enjoy more freedom to experiment with your style.", icon: Star, badge: "MOST POPULAR", features: ["Everything in Starter", "25 virtual try-ons per month", "Save up to 50 favourite outfits", "Personal Digital Twin", "Fitting history", "Priority processing, if supported"] },
  { code: "STYLE_PRO", name: "Style Pro", price: "Rs. 1,990", period: "Month", description: "The ultimate fashion experience for style enthusiasts.", icon: Zap, badge: "PREMIUM", features: ["Everything in Style Plus", "60 virtual try-ons per month", "Unlimited favourite outfits", "Unlimited fitting history", "Premium fitting quality, if supported", "Priority generation, if supported", "Early access to new features"] },
] as const;

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) throw new Error(`The subscription service returned an empty response (${response.status}).`);
  try { return JSON.parse(text) as { message?: string; subscription?: { plan: string } }; } catch { throw new Error(`The subscription service returned an invalid response (${response.status}).`); }
}

function actionLabel(currentPlan: string | null, planCode: string, planName: string) {
  if (currentPlan === planCode) return "Current Plan";
  const rank = { STARTER: 0, STYLE_PLUS: 1, STYLE_PRO: 2 } as const;
  if (currentPlan && rank[planCode as keyof typeof rank] < rank[currentPlan as keyof typeof rank]) return `Downgrade to ${planName}`;
  return `Upgrade to ${planName}`;
}

export default function PlanCards() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => { fetch("/api/v1/customer/subscription", { cache: "no-store" }).then(async (response) => { const body = await readJson(response); if (!response.ok) throw new Error(body.message ?? "Could not load your plan."); if (!body.subscription?.plan) throw new Error("The subscription service returned no current plan."); setCurrentPlan(body.subscription.plan); }).catch((error) => setMessage(error instanceof Error ? error.message : "Could not load your plan.")).finally(() => setLoading(false)); }, []);

  async function changePlan(plan: string) {
    setChangingPlan(plan); setMessage("");
    try { const response = await fetch("/api/v1/customer/subscription", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) }); const body = await readJson(response); if (!response.ok) throw new Error(body.message ?? "Could not update your plan."); if (!body.subscription?.plan) throw new Error("The subscription service returned no updated plan."); setCurrentPlan(body.subscription.plan); setMessage(body.message ?? "Plan updated."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update your plan."); } finally { setChangingPlan(null); setPendingPlan(null); }
  }

  const pendingName = plans.find((plan) => plan.code === pendingPlan)?.name;

  return <>
    <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm" aria-labelledby="current-plan-heading"><div className="flex items-center gap-4"><div className="rounded-xl bg-indigo-100 p-3 text-indigo-700"><CreditCard size={24} aria-hidden="true" /></div><div><h2 id="current-plan-heading" className="text-lg font-bold text-slate-950">Your Current Plan: {loading ? "Loading…" : plans.find((plan) => plan.code === currentPlan)?.name ?? "Starter"}</h2><p className="mt-1 text-sm text-slate-600">Plan activation is for demonstration only; no payment is collected.</p></div><span className="ml-auto rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Active</span></div>{message && <p role="status" className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm font-medium text-indigo-800">{message}</p>}</section>
    <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-stretch">{plans.map(({ code, name, price, period, description, icon: Icon, badge, features }) => { const isCurrent = currentPlan === code; return <article key={code} className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${name === "Style Plus" ? "border-indigo-500 ring-2 ring-indigo-200 lg:-mt-3 lg:mb-3" : "border-slate-200"}`}>{badge && <span className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-black tracking-wide text-white ${name === "Style Plus" ? "bg-indigo-600" : "bg-violet-600"}`}>{badge}</span>}<div className="flex items-center justify-between"><div className={`rounded-2xl p-3 ${name === "Style Plus" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"}`}><Icon size={24} aria-hidden="true" /></div><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly billing</span></div><h2 className="mt-6 text-2xl font-black text-slate-950">{name}</h2><p className="mt-3 text-3xl font-black text-indigo-700">{price}<span className="text-sm font-semibold text-slate-500"> / {period}</span></p><p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{description}</p><ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 pt-6">{features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-slate-700"><Check size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /><span>{feature}</span></li>)}</ul><button type="button" onClick={() => code === "STARTER" ? setPendingPlan(code) : setPaymentPlan(code)} disabled={loading || changingPlan !== null || isCurrent} className="mt-8 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{changingPlan === code ? "Updating…" : actionLabel(currentPlan, code, name)}</button></article>; })}</div>
    <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-slate-500">Demo activation updates your customer subscription in the database. Real payment processing and usage limits are not connected.</p>
    {pendingPlan && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-xl font-black text-slate-950">Confirm plan change</h2><p className="mt-2 text-sm text-slate-600">Change your plan to {pendingName}? This is a demonstration activation; no payment will be collected.</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setPendingPlan(null)} className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700">Cancel</button><button type="button" onClick={() => changePlan(pendingPlan)} className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white">Confirm</button></div></div></div>}
    {paymentPlan && (() => { const selected = plans.find((plan) => plan.code === paymentPlan); if (!selected) return null; return <div className="fixed inset-0 z-50 bg-slate-950/50" role="dialog" aria-modal="true" aria-labelledby="payment-drawer-title"><aside className="ml-auto flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Subscription checkout</p><h2 id="payment-drawer-title" className="mt-1 text-2xl font-black text-slate-950">{selected.name}</h2></div><button type="button" onClick={() => setPaymentPlan(null)} className="rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700">Close</button></div><div className="mt-8 rounded-2xl bg-indigo-50 p-5"><p className="text-3xl font-black text-indigo-700">{selected.price}<span className="text-sm font-semibold text-slate-500"> / {selected.period}</span></p><p className="mt-2 text-sm text-slate-600">Monthly billing · Demo checkout</p></div><h3 className="mt-8 text-lg font-black text-slate-950">Included with this plan</h3><ul className="mt-4 space-y-3">{selected.features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-slate-700"><Check size={18} className="shrink-0 text-emerald-600" />{feature}</li>)}</ul><div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-bold">Demo checkout</p><p className="mt-1">You will continue to the demonstration payment page. No real payment details are collected.</p></div><div className="mt-auto flex gap-3 pt-8"><button type="button" onClick={() => setPaymentPlan(null)} className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700">Back</button><button type="button" onClick={() => router.push(`/plan/checkout?plan=${selected.code}`)} className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700">Pay Now</button></div></aside></div>; })()}
  </>;
}
