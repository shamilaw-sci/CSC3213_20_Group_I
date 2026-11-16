"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";

const plans = {
  STYLE_PLUS: { name: "Style Plus", price: "Rs. 990", features: ["25 virtual try-ons per month", "Up to 50 favourite outfits", "Personal Digital Twin", "Fitting history"] },
  STYLE_PRO: { name: "Style Pro", price: "Rs. 1,990", features: ["60 virtual try-ons per month", "Unlimited favourite outfits", "Unlimited fitting history", "Early access to new features"] },
} as const;
type Method = "card" | "bank" | "wallet";

export default function SubscriptionCheckoutPage() {
  const code = useSearchParams().get("plan") === "STYLE_PRO" ? "STYLE_PRO" : "STYLE_PLUS";
  const plan = plans[code];
  const [method, setMethod] = useState<Method>("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing) return;
    setProcessing(true); setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const response = await fetch("/api/v1/customer/subscription", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: code }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Demo activation could not be completed.");
      setReference(`TV-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`); setSuccess(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Demo activation could not be completed."); } finally { setProcessing(false); }
  }

  if (success) return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5"><section className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl"><CheckCircle2 className="mx-auto text-emerald-600" size={56} /><p className="mt-5 text-sm font-bold uppercase tracking-widest text-indigo-600">Demo payment complete</p><h1 className="mt-2 text-3xl font-black text-slate-950">{plan.name} is now active</h1><p className="mt-3 text-slate-600">No real money was charged. This is an academic demonstration.</p><div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-left"><p className="text-sm font-bold text-slate-900">Demo transaction reference</p><p className="mt-1 font-mono text-indigo-700">{reference}</p><p className="mt-3 text-sm font-bold text-slate-900">Amount</p><p className="mt-1 text-slate-700">{plan.price} / Month</p></div><Link href="/dashboard" className="mt-7 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">Return to dashboard</Link></section></main>;

  return <main className="min-h-screen bg-slate-50 p-5 py-10"><div className="mx-auto max-w-6xl"><Link href="/plan" className="text-xl font-black text-indigo-700">TryVora</Link><header className="mt-8"><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Secure demo checkout</p><h1 className="mt-2 text-4xl font-black text-slate-950">Complete your subscription</h1><p className="mt-3 text-slate-600">Choose a sample payment method. No real payment details are collected.</p></header><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.85fr]"><form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" /><h2 className="text-xl font-black text-slate-950">Demo payment method</h2></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{([["card", "Credit / Debit Card"], ["bank", "Online Banking"], ["wallet", "Digital Wallet"]] as const).map(([value, label]) => <label key={value} className={`cursor-pointer rounded-xl border p-3 text-sm font-semibold ${method === value ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-700"}`}><input type="radio" name="method" value={value} checked={method === value} onChange={() => setMethod(value)} className="sr-only" />{label}</label>)}</div><p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800">SAMPLE ONLY — Never enter real card, bank or wallet credentials.</p>{method === "card" && <div className="mt-5 grid gap-4 sm:grid-cols-2"><input required placeholder="SAMPLE ONLY · Cardholder name" className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2" /><input required inputMode="numeric" placeholder="SAMPLE ONLY · 4242 4242 4242 4242" className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2" /><input required placeholder="SAMPLE ONLY · MM/YY" className="rounded-xl border border-slate-300 px-4 py-3" /><input required placeholder="SAMPLE ONLY · CVV" className="rounded-xl border border-slate-300 px-4 py-3" /></div>}{method === "bank" && <div className="mt-5 grid gap-4"><select required defaultValue="" className="rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="" disabled>Select demo bank</option><option>TryVora Demo Bank</option><option>Sample Online Bank</option></select><input required placeholder="SAMPLE ONLY · Account holder name" className="rounded-xl border border-slate-300 px-4 py-3" /><input required placeholder="SAMPLE ONLY · Demo transfer reference" className="rounded-xl border border-slate-300 px-4 py-3" /><p className="text-sm text-slate-600">The transfer confirmation is simulated locally; no bank connection, password, PIN or OTP is requested.</p></div>}{method === "wallet" && <div className="mt-5 grid gap-4"><select required defaultValue="" className="rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="" disabled>Select demo wallet</option><option>Google Wallet (demo)</option><option>Apple Pay (demo)</option><option>PayPal (demo)</option></select><input required placeholder="SAMPLE ONLY · Wallet account/email" className="rounded-xl border border-slate-300 px-4 py-3" /><input required placeholder="SAMPLE ONLY · Demo wallet reference" className="rounded-xl border border-slate-300 px-4 py-3" /><p className="text-sm text-slate-600">Wallet authorization is simulated; no wallet credentials or verification codes are requested.</p></div>}{error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}<button type="submit" disabled={processing} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-60">{processing && <LoaderCircle className="animate-spin" size={18} />}{processing ? "Processing demo payment…" : "Complete Demo Payment"}</button><p className="mt-4 text-center text-xs font-bold text-amber-700">DEMO PAYMENT ONLY — No real money will be charged.</p></form><aside className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-8"><p className="text-sm font-bold uppercase tracking-widest text-indigo-300">Order summary</p><h2 className="mt-3 text-3xl font-black">{plan.name}</h2><p className="mt-2 text-slate-300">Monthly billing</p><p className="mt-8 text-4xl font-black text-indigo-300">{plan.price}<span className="text-sm text-slate-300"> / Month</span></p><ul className="mt-8 space-y-3 border-t border-white/10 pt-6">{plan.features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-slate-200"><CheckCircle2 size={18} className="text-emerald-300" />{feature}</li>)}</ul></aside></div></div></main>;
}
