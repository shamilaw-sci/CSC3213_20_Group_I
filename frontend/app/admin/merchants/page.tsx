"use client";

import { useEffect, useState } from "react";

type Merchant = { id: string; storeName: string; email: string; status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED"; productCount: number; createdAt: string };

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/v1/admin/merchants", { cache: "no-store" });
    const body = await response.json();
    if (response.ok) setMerchants(body.merchants ?? []);
    else setMessage(body.message ?? "Could not load merchants.");
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function updateStatus(id: string, status: Merchant["status"]) {
    setMessage("");
    const response = await fetch(`/api/v1/admin/merchants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const body = await response.json();
    if (!response.ok) return setMessage(body.message ?? "Could not update merchant status.");
    setMessage(`Merchant status updated to ${status}.`);
    await load();
  }

  return (
    <main className="space-y-6">
      <div><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Administration</p><h1 className="mt-2 text-3xl font-black text-slate-950">Merchant approvals</h1><p className="mt-2 text-slate-600">Approve merchants before they can manage products and upload catalogue images.</p></div>
      {message && <p role="status" className="rounded-xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-800">{message}</p>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-6 text-slate-600">Loading merchants…</p> : merchants.length === 0 ? <p className="p-6 text-slate-600">No merchant applications found.</p> : <div className="divide-y divide-slate-100">{merchants.map((merchant) => <div key={merchant.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-bold text-slate-950">{merchant.storeName}</p><p className="text-sm text-slate-500">{merchant.email} · {merchant.productCount} products</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{merchant.status}</span>{merchant.status === "PENDING" && <button type="button" onClick={() => void updateStatus(merchant.id, "ACTIVE")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">Approve</button>}{merchant.status === "ACTIVE" && <button type="button" onClick={() => void updateStatus(merchant.id, "SUSPENDED")} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50">Suspend</button>}</div></div>)}</div>}
      </section>
    </main>
  );
}
