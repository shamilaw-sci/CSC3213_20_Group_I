"use client";

import { Pencil, Search, Store, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type MerchantStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
type SubscriptionPlan = "FREE" | "STANDARD" | "PRO";
type Merchant = { id: string; storeName: string; email: string; ownerName: string | null; phone: string | null; address: string | null; businessCategory: string | null; websiteUrl: string | null; storeDescription: string | null; logo: string | null; status: MerchantStatus; products: number; redirects: number; account: { name: string; email: string } | null; subscription: { plan: SubscriptionPlan; status: string }; createdAt: string; updatedAt: string };
type MerchantData = { summary: { pending: number; active: number; suspended: number; rejected: number; total: number; freeTrial: number; standard: number; pro: number }; merchants: Merchant[] };
type MerchantForm = { storeName: string; email: string; ownerName: string; phone: string; address: string; businessCategory: string; websiteUrl: string; storeDescription: string; status: MerchantStatus; plan: SubscriptionPlan };

const initialForm: MerchantForm = { storeName: "", email: "", ownerName: "", phone: "", address: "", businessCategory: "", websiteUrl: "", storeDescription: "", status: "PENDING", plan: "FREE" };

async function fetchMerchants() {
  const response = await fetch("/api/v1/admin/merchants", { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "Could not load merchants.");
  return body as MerchantData;
}

function merchantPayload(merchant: Merchant, status = merchant.status) {
  return { storeName: merchant.storeName, email: merchant.email, ownerName: merchant.ownerName ?? "", phone: merchant.phone ?? "", address: merchant.address ?? "", businessCategory: merchant.businessCategory ?? "", websiteUrl: merchant.websiteUrl ?? "", storeDescription: merchant.storeDescription ?? "", status, plan: merchant.subscription.plan };
}

function planLabel(plan: SubscriptionPlan) {
  return plan === "FREE" ? "Free Trial" : plan === "STANDARD" ? "Standard" : "Pro";
}

export default function MerchantManagementPage() {
  const [data, setData] = useState<MerchantData | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | MerchantStatus>("ALL");
  const [plan, setPlan] = useState<"ALL" | SubscriptionPlan>("ALL");
  const [editing, setEditing] = useState<Merchant | undefined>(undefined);
  const [form, setForm] = useState<MerchantForm>(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => { const body = await fetchMerchants(); setData(body); setError(""); }, []);
  useEffect(() => { let active = true; fetchMerchants().then((body) => { if (active) setData(body); }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load merchants."); }); return () => { active = false; }; }, []);
  const visible = useMemo(() => { const term = query.trim().toLowerCase(); return data?.merchants.filter((merchant) => (status === "ALL" || merchant.status === status) && (plan === "ALL" || merchant.subscription.plan === plan) && (!term || `${merchant.storeName} ${merchant.email} ${merchant.ownerName ?? ""} ${merchant.businessCategory ?? ""}`.toLowerCase().includes(term))) ?? []; }, [data, plan, query, status]);

  function openEdit(merchant: Merchant) { setEditing(merchant); setForm(merchantPayload(merchant)); }
  async function request(url: string, payload: MerchantForm) {
    const response = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message ?? "Could not save the merchant.");
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving || !editing) return; setSaving(true); setError("");
    try { await request(`/api/v1/admin/merchants/${encodeURIComponent(editing.id)}`, form); setEditing(undefined); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save the merchant."); }
    finally { setSaving(false); }
  }
  async function setMerchantStatus(merchant: Merchant, nextStatus: MerchantStatus) {
    if (updatingId) return;
    if (!window.confirm(`${nextStatus === "ACTIVE" ? "Activate" : nextStatus === "SUSPENDED" ? "Restrict" : "Reject"} ${merchant.storeName}?`)) return;
    setUpdatingId(merchant.id); setError("");
    try { await request(`/api/v1/admin/merchants/${encodeURIComponent(merchant.id)}`, merchantPayload(merchant, nextStatus)); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update the merchant."); }
    finally { setUpdatingId(null); }
  }

  const summary = data?.summary;
  return <section className="space-y-6">
    <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-700">Commerce partners</p><h2 className="mt-1 text-3xl font-black text-slate-950">Merchant management</h2><p className="mt-2 text-slate-600">Manage existing stores, subscription plans, access, and catalog activity.</p></div>
    {error && <p role="alert" className="rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{([['total','All merchants'],['active','Active'],['pending','Pending'],['suspended','Restricted'],['rejected','Rejected']] as const).map(([key, label]) => <div key={key} className="rounded-2xl bg-white p-5 shadow"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{summary?.[key] ?? 0}</p></div>)}</div>
    <div><h3 className="mb-3 text-lg font-black text-slate-950">Subscription categories</h3><div className="grid gap-4 sm:grid-cols-3">{([['freeTrial','Free Trial'],['standard','Standard'],['pro','Pro']] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setPlan(key === "freeTrial" ? "FREE" : key === "standard" ? "STANDARD" : "PRO")} className={`rounded-2xl p-5 text-left shadow transition ${plan === (key === "freeTrial" ? "FREE" : key === "standard" ? "STANDARD" : "PRO") ? "bg-purple-700 text-white" : "bg-white"}`}><p className="font-bold">{label}</p><p className="mt-2 text-3xl font-black">{summary?.[key] ?? 0}</p></button>)}</div></div>
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow sm:flex-row"><label className="flex flex-1 items-center gap-2 rounded-xl border px-3"><Search size={18} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stores, owners, or categories" className="w-full py-3 outline-none" /></label><select value={status} onChange={(event) => setStatus(event.target.value as "ALL" | MerchantStatus)} className="rounded-xl border px-4 py-3 font-semibold"><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Restricted</option><option value="REJECTED">Rejected</option></select><select value={plan} onChange={(event) => setPlan(event.target.value as "ALL" | SubscriptionPlan)} className="rounded-xl border px-4 py-3 font-semibold"><option value="ALL">All plans</option><option value="FREE">Free Trial</option><option value="STANDARD">Standard</option><option value="PRO">Pro</option></select></div>
    <div className="overflow-x-auto rounded-2xl bg-white p-5 shadow"><table className="w-full min-w-[1000px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">Store</th><th className="p-3">Contact</th><th className="p-3">Category</th><th className="p-3">Activity</th><th className="p-3">Plan</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{visible.map((merchant) => <tr key={merchant.id} className="border-b align-top last:border-0"><td className="p-3"><div className="flex items-center gap-3"><span className="rounded-xl bg-purple-100 p-2 text-purple-700"><Store size={20} /></span><div><p className="font-bold">{merchant.storeName}</p><p className="text-slate-500">{merchant.ownerName || "Owner not recorded"}</p></div></div></td><td className="p-3"><p>{merchant.email}</p><p className="text-slate-500">{merchant.phone || "No phone"}</p></td><td className="p-3">{merchant.businessCategory || "Not set"}</td><td className="p-3">{merchant.products} products<br /><span className="text-slate-500">{merchant.redirects} redirects</span></td><td className="p-3 font-semibold">{planLabel(merchant.subscription.plan)}</td><td className="p-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${merchant.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : merchant.status === "SUSPENDED" || merchant.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{merchant.status === "SUSPENDED" ? "RESTRICTED" : merchant.status}</span></td><td className="p-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => openEdit(merchant)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 font-semibold"><Pencil size={15} /> Edit</button>{merchant.status !== "ACTIVE" && <button type="button" disabled={updatingId !== null} onClick={() => void setMerchantStatus(merchant, "ACTIVE")} className="rounded-lg border border-emerald-200 px-3 py-2 font-semibold text-emerald-700 disabled:opacity-40">Activate</button>}{merchant.status === "ACTIVE" && <button type="button" disabled={updatingId !== null} onClick={() => void setMerchantStatus(merchant, "SUSPENDED")} className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-700 disabled:opacity-40">Restrict</button>}{merchant.status === "PENDING" && <button type="button" disabled={updatingId !== null} onClick={() => void setMerchantStatus(merchant, "REJECTED")} className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-600 disabled:opacity-40">Reject</button>}</div></td></tr>)}</tbody></table>{!data && !error && <p role="status" className="p-5">Loading merchants…</p>}{data && !visible.length && <p className="p-5 text-slate-500">No merchants match the current filters.</p>}</div>

    {editing !== undefined && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="merchant-form-title"><form onSubmit={save} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h3 id="merchant-form-title" className="text-2xl font-black">Edit merchant</h3><button type="button" onClick={() => setEditing(undefined)} aria-label="Close merchant form" className="rounded-lg p-2 hover:bg-slate-100"><X /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Field label="Store name"><input required minLength={2} maxLength={150} value={form.storeName} onChange={(event) => setForm({ ...form, storeName: event.target.value })} className="rounded-xl border p-3" /></Field><Field label="Email"><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="rounded-xl border p-3" /></Field><Field label="Owner name"><input maxLength={150} value={form.ownerName} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} className="rounded-xl border p-3" /></Field><Field label="Phone"><input maxLength={32} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="rounded-xl border p-3" /></Field><Field label="Business category"><input maxLength={100} value={form.businessCategory} onChange={(event) => setForm({ ...form, businessCategory: event.target.value })} className="rounded-xl border p-3" /></Field><Field label="Status"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as MerchantStatus })} className="rounded-xl border p-3"><option value="PENDING">Pending</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Restricted</option><option value="REJECTED">Rejected</option></select></Field><Field label="Subscription plan"><select value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value as SubscriptionPlan })} className="rounded-xl border p-3"><option value="FREE">Free Trial</option><option value="STANDARD">Standard</option><option value="PRO">Pro</option></select></Field><Field label="Website URL"><input type="url" value={form.websiteUrl} onChange={(event) => setForm({ ...form, websiteUrl: event.target.value })} className="rounded-xl border p-3" /></Field><Field label="Address"><input maxLength={500} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="rounded-xl border p-3" /></Field><label className="grid gap-2 text-sm font-bold sm:col-span-2">Store description<textarea rows={4} maxLength={3000} value={form.storeDescription} onChange={(event) => setForm({ ...form, storeDescription: event.target.value })} className="rounded-xl border p-3 font-normal" /></label>
    </div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditing(undefined)} className="rounded-xl border px-5 py-3 font-bold">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-purple-700 px-5 py-3 font-bold text-white disabled:opacity-40">{saving ? "Saving…" : "Save merchant"}</button></div></form></div>}
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-bold">{label}{children}</label>; }
