"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";

const planDetails = {
  STYLE_PLUS: { name: "Style Plus", price: "Rs. 990", features: ["25 virtual try-ons per month", "Up to 50 favourite outfits", "Personal Digital Twin", "Fitting history", "Priority processing, if supported"] },
  STYLE_PRO: { name: "Style Pro", price: "Rs. 1,990", features: ["60 virtual try-ons per month", "Unlimited favourite outfits", "Unlimited fitting history", "Premium fitting quality, if supported", "Early access to new features"] },
} as const;

export default function SubscriptionCheckoutPage() {
  const searchParams = useSearchParams();
  const planCode = searchParams.get("plan") === "STYLE_PRO" ? "STYLE_PRO" : "STYLE_PLUS";
  const plan = planDetails[planCode];
  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  async function completeDemoPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProcessing(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const response = await fetch("/api/v1/customer/subscription", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: planCode }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Demo activation could not be completed.");
      setReference(`TV-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo activation could not be completed.");
    } finally {
      setProcessing(false);
    }
  }

  if (success) return <main className="tv-page flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10"><section className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl"><CheckCircle2 className="mx-auto text-emerald-600" size={56} /><p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Demo payment complete</p><h1 className="mt-2 text-3xl font-black text-slate-950">{plan.name} is now active</h1><p className="mt-3 text-slate-600">No real money was charged. This demonstration subscription was updated through the existing demo API.</p><div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-left"><p className="font-bold text-slate-900">Transaction reference</p><p className="mt-1 font-mono text-indigo-700">{reference}</p><p className="mt-3 font-bold text-slate-900">Amount</p><p className="mt-1 text-slate-700">{plan.price} / Month</p></div><Link href="/dashboard" className="mt-7 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700">Return to dashboard</Link></section></main>;

  return <main className="tv-page min-h-screen bg-slate-50 px-5 py-10"><div className="mx-auto max-w-6xl"><header className="mb-8"><Link href="/plan" className="text-xl font-black text-indigo-700">TryVora</Link><p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Secure demo checkout</p><h1 className="mt-2 text-4xl font-black text-slate-950">Complete your subscription</h1></header><div className="grid gap-6 lg:grid-cols-[1fr_.85fr]"><form onSubmit={completeDemoPayment} className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" /><div><h2 className="text-xl font-black text-slate-950">Payment details</h2><p className="text-sm text-slate-500">Use sample values only. Do not enter real card information.</p></div></div><fieldset className="mt-6"><legend className="text-sm font-bold text-slate-900">Payment method</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{[["card", "Credit / Debit Card"], ["bank", "Online Banking"], ["wallet", "Digital Wallet"]].map(([value, label]) => <label key={value} className={`rounded-xl border p-3 text-sm font-semibold ${method === value ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-700"}`}><input type="radio" name="method" value={value} checked={method === value} onChange={() => setMethod(value)} className="sr-only" />{label}</label>)}</div></fieldset><div className="mt-6 grid gap-4 sm:grid-cols-2"><input required placeholder="Demo cardholder name" className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2" /><input required inputMode="numeric" placeholder="4242 4242 4242 4242 (demo)" className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2" /><input required placeholder="MM/YY" className="rounded-xl border border-slate-300 px-4 py-3" /><input required placeholder="CVV (demo)" className="rounded-xl border border-slate-300 px-4 py-3" /></div>{error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}<button type="submit" disabled={processing} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{processing && <LoaderCircle className="animate-spin" size={18} />}{processing ? "Processing demo payment…" : "Complete Demo Payment"}</button><p className="mt-4 text-center text-xs font-bold text-amber-700">DEMO PAYMENT ONLY – No real money will be charged.</p></form><aside className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">Order summary</p><h2 className="mt-3 text-3xl font-black">{plan.name}</h2><p className="mt-2 text-slate-300">Monthly billing</p><p className="mt-8 text-4xl font-black text-indigo-300">{plan.price}<span className="text-sm font-semibold text-slate-300"> / Month</span></p><ul className="mt-8 space-y-3 border-t border-white/10 pt-6">{plan.features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-slate-200"><CheckCircle2 size={18} className="shrink-0 text-emerald-300" />{feature}</li>)}</ul></aside></div></div></main>;
}
