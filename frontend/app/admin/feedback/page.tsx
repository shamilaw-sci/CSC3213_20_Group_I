"use client";

import { Save, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type FeedbackStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
type FeedbackItem = { id: string; customer: { name: string; email: string }; type: string; status: FeedbackStatus; rating: number | null; subject: string | null; message: string; resolutionNotes: string | null; createdAt: string; resolvedAt: string | null; resolvedBy: string | null };
type Data = { summary: { open: number; inReview: number; resolved: number; closed: number }; feedback: FeedbackItem[] };

async function fetchFeedback() {
  const response = await fetch("/api/v1/admin/feedback", { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "Could not load feedback.");
  return body as Data;
}

export default function FeedbackManagementPage() {
  const [data, setData] = useState<Data | null>(null);
  const [filter, setFilter] = useState<"ALL" | FeedbackStatus>("ALL");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setData(await fetchFeedback());
    setError("");
  }, []);
  useEffect(() => {
    let active = true;
    fetchFeedback().then((body) => { if (active) setData(body); }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load feedback."); });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => data?.feedback.filter((item) => filter === "ALL" || item.status === filter) ?? [], [data, filter]);
  function editItem(id: string, changes: Partial<FeedbackItem>) {
    setData((current) => current ? { ...current, feedback: current.feedback.map((item) => item.id === id ? { ...item, ...changes } : item) } : current);
  }
  async function save(item: FeedbackItem) {
    if (savingId) return;
    setSavingId(item.id);
    setError("");
    try {
      const response = await fetch(`/api/v1/admin/feedback/${encodeURIComponent(item.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: item.status, resolutionNotes: item.resolutionNotes ?? "" }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not update feedback.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update feedback.");
    } finally {
      setSavingId(null);
    }
  }

  const filters: Array<"ALL" | FeedbackStatus> = ["ALL", "OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"];
  return (
    <section className="space-y-6">
      <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-700">Customer support</p><h2 className="mt-1 text-3xl font-black text-slate-950">Feedback management</h2><p className="mt-2 text-slate-600">Review customer reports, update their status, and record resolution notes.</p></div>
      {error && <p role="alert" className="rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{([['OPEN','Open'],['IN_REVIEW','In review'],['RESOLVED','Resolved'],['CLOSED','Closed']] as const).map(([status, label]) => <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-2xl p-5 text-left shadow ${filter === status ? "bg-purple-700 text-white" : "bg-white"}`}><p className="font-bold">{label}</p><p className="mt-2 text-3xl font-black">{data?.summary[status === "IN_REVIEW" ? "inReview" : status.toLowerCase() as "open" | "resolved" | "closed"] ?? 0}</p></button>)}</div>
      <div className="flex flex-wrap gap-2">{filters.map((status) => <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === status ? "bg-slate-950 text-white" : "bg-white text-slate-700 shadow"}`}>{status === "ALL" ? "All feedback" : status.toLowerCase().replace("_", " ")}</button>)}</div>
      <div className="grid gap-5">
        {visible.map((item) => <article key={item.id} className="rounded-2xl bg-white p-6 shadow"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">{item.type.replaceAll("_", " ")}</span>{item.rating !== null && <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600"><Star size={16} fill="currentColor" />{item.rating}/5</span>}</div><h3 className="mt-3 text-xl font-black">{item.subject || "Feedback"}</h3><p className="mt-1 text-sm text-slate-500">{item.customer.name} · {item.customer.email} · {new Date(item.createdAt).toLocaleString()}</p></div><select value={item.status} onChange={(event) => editItem(item.id, { status: event.target.value as FeedbackStatus })} className="rounded-xl border px-3 py-2 font-semibold"><option value="OPEN">Open</option><option value="IN_REVIEW">In review</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select></div><p className="mt-5 rounded-xl bg-slate-50 p-4 leading-7 text-slate-700">{item.message}</p><label className="mt-5 grid gap-2 text-sm font-semibold">Resolution notes<textarea value={item.resolutionNotes ?? ""} onChange={(event) => editItem(item.id, { resolutionNotes: event.target.value })} maxLength={2000} rows={3} placeholder="Add notes about the investigation or resolution…" className="rounded-xl border p-3 font-normal" /></label><button type="button" disabled={savingId !== null} onClick={() => void save(item)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2 font-semibold text-white disabled:opacity-40"><Save size={17} />{savingId === item.id ? "Saving…" : "Save update"}</button></article>)}
        {!data && !error && <p role="status" className="rounded-2xl bg-white p-6 shadow">Loading feedback…</p>}
        {data && !visible.length && <p className="rounded-2xl bg-white p-6 text-slate-500 shadow">No feedback matches this filter.</p>}
      </div>
    </section>
  );
}
