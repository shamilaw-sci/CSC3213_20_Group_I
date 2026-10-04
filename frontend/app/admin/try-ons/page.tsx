"use client";

import { RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type TryOn = { id: string; customer: { name: string; email: string }; product: string; status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"; errorMessage: string | null; createdAt: string; startedAt: string | null; completedAt: string | null };
type Data = { summary: Record<TryOn["status"], number>; tryOns: TryOn[] };

const statuses: Array<"ALL" | TryOn["status"]> = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"];

async function fetchTryOns() {
  const response = await fetch("/api/v1/admin/try-ons", { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "Could not load try-on sessions.");
  return body as Data;
}

export default function TryOnManagementPage() {
  const [data, setData] = useState<Data | null>(null);
  const [filter, setFilter] = useState<(typeof statuses)[number]>("ALL");
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setData(await fetchTryOns());
    setError("");
  }, []);

  useEffect(() => {
    let active = true;
    fetchTryOns().then((body) => { if (active) setData(body); }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load try-on sessions."); });
    return () => { active = false; };
  }, []);
  const visible = useMemo(() => data?.tryOns.filter((item) => filter === "ALL" || item.status === filter) ?? [], [data, filter]);

  async function manage(item: TryOn, action: "RETRY" | "CANCEL") {
    if (pendingId) return;
    if (!window.confirm(`${action === "RETRY" ? "Retry" : "Cancel"} this try-on session?`)) return;
    setPendingId(item.id);
    setError("");
    try {
      const response = await fetch(`/api/v1/admin/try-ons/${encodeURIComponent(item.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not update the try-on session.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the try-on session.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-700">Operations</p><h2 className="mt-1 text-3xl font-black text-slate-950">Try-on management</h2><p className="mt-2 text-slate-600">Inspect processing status, retry failures, and cancel stalled sessions.</p></div>
      {error && <p role="alert" className="rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"] as const).map((status) => <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-2xl p-5 text-left shadow ${filter === status ? "bg-purple-700 text-white" : "bg-white"}`}><p className="text-sm font-bold capitalize">{status.toLowerCase()}</p><p className="mt-2 text-3xl font-black">{data?.summary[status] ?? 0}</p></button>)}</div>
      <div className="flex flex-wrap gap-2">{statuses.map((status) => <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === status ? "bg-slate-950 text-white" : "bg-white text-slate-700 shadow"}`}>{status === "ALL" ? "All sessions" : status.toLowerCase()}</button>)}</div>
      <div className="overflow-x-auto rounded-2xl bg-white p-5 shadow">
        <table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">Customer</th><th className="p-3">Product</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3">Error</th><th className="p-3">Actions</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-3"><span className="font-semibold">{item.customer.name}</span><br /><span className="text-slate-500">{item.customer.email}</span></td><td className="p-3 font-medium">{item.product}</td><td className="p-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{item.status}</span></td><td className="p-3">{new Date(item.createdAt).toLocaleString()}</td><td className="max-w-64 p-3 text-red-700">{item.errorMessage || "—"}</td><td className="p-3"><div className="flex gap-2">{(item.status === "FAILED" || item.status === "CANCELLED") && <button type="button" disabled={pendingId !== null} onClick={() => void manage(item, "RETRY")} className="inline-flex items-center gap-1 rounded-lg border border-purple-200 px-3 py-2 font-semibold text-purple-700 disabled:opacity-40"><RefreshCw size={15} /> Retry</button>}{(item.status === "PENDING" || item.status === "PROCESSING") && <button type="button" disabled={pendingId !== null} onClick={() => void manage(item, "CANCEL")} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-700 disabled:opacity-40"><XCircle size={15} /> Cancel</button>}{item.status === "COMPLETED" && <span className="text-slate-500">No action required</span>}</div></td></tr>)}</tbody></table>
        {!data && !error && <p className="p-5" role="status">Loading try-on sessions…</p>}
        {data && !visible.length && <p className="p-5 text-slate-500">No try-on sessions match this filter.</p>}
      </div>
    </section>
  );
}
