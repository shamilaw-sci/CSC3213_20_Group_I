"use client";

import { useEffect, useMemo, useState } from "react";

type Ticket = { id: string; reference: string; subject: string | null; category: string; status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED"; message: string; response: string | null; createdAt: string; updatedAt: string; customer: { userId: string; userName: string; userEmail: string } | null };

const labels: Record<string, string> = { GENERAL: "General", DIGITAL_TWIN: "Digital Twin", VIRTUAL_TRY_ON: "Virtual Try-On", PRODUCT: "Products" };

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<Ticket["status"]>("OPEN");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const result = await fetch("/api/v1/admin/support", { cache: "no-store" });
      const body = await result.json().catch(() => ({}));
      if (!result.ok) throw new Error(body.message ?? "Could not load support tickets.");
      setTickets(body.tickets ?? []);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load support tickets.");
    } finally {
      setLoading(false);
    }
  }

  // Loading server state is the purpose of this effect; the async request updates the view when it completes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  const selected = useMemo(() => tickets.find((ticket) => ticket.id === selectedId) ?? null, [tickets, selectedId]);

  function select(ticket: Ticket) {
    setSelectedId(ticket.id);
    setStatus(ticket.status);
    setResponse(ticket.response ?? "");
  }

  async function save() {
    if (!selected || saving) return;
    setSaving(true);
    setError("");
    try {
      const result = await fetch("/api/v1/admin/support", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketId: selected.id, status, resolutionNotes: response }) });
      const body = await result.json().catch(() => ({}));
      if (!result.ok) throw new Error(body.message ?? "Could not update the support ticket.");
      await load();
      setSelectedId(selected.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the support ticket.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="space-y-6"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-700">Customer support</p><h1 className="mt-1 text-3xl font-black text-slate-950">Support tickets</h1><p className="mt-2 text-slate-600">Review customer requests and record status updates or responses.</p></div>{error && <p role="alert" className="rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.8fr)]"><section className="rounded-2xl bg-white p-5 shadow"><h2 className="text-xl font-black text-slate-950">All customer tickets</h2>{loading ? <p role="status" className="mt-5 text-slate-500">Loading support tickets…</p> : tickets.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-5 text-slate-600">No customer support tickets have been submitted.</p> : <div className="mt-4 divide-y divide-slate-100">{tickets.map((ticket) => <button type="button" key={ticket.id} onClick={() => select(ticket)} className={`w-full rounded-xl p-4 text-left transition hover:bg-purple-50 ${selectedId === ticket.id ? "bg-purple-50 ring-2 ring-purple-200" : ""}`}><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wide text-purple-700">{ticket.reference}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{ticket.status.replace("_", " ")}</span></div><h3 className="mt-2 font-bold text-slate-950">{ticket.subject || "Support request"}</h3><p className="mt-1 text-sm text-slate-500">{ticket.customer?.userName ?? "Unknown customer"} · {labels[ticket.category] ?? ticket.category} · {new Date(ticket.createdAt).toLocaleString()}</p></button>)}</div>}</section><section className="rounded-2xl bg-white p-5 shadow">{selected ? <><p className="text-xs font-bold uppercase tracking-wide text-purple-700">{selected.reference}</p><h2 className="mt-1 text-2xl font-black text-slate-950">{selected.subject || "Support request"}</h2><p className="mt-2 text-sm text-slate-500">{selected.customer?.userName ?? "Unknown customer"} · {selected.customer?.userEmail ?? "No email"} · {labels[selected.category] ?? selected.category}</p><p className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-7 text-slate-700">{selected.message}</p><label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">Status<select value={status} onChange={(event) => setStatus(event.target.value as Ticket["status"])} className="rounded-xl border border-slate-300 bg-white p-3 font-normal"><option value="OPEN">Open</option><option value="IN_REVIEW">In review</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select></label><label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">Admin response<textarea value={response} onChange={(event) => setResponse(event.target.value)} maxLength={10000} rows={6} className="rounded-xl border border-slate-300 p-3 font-normal" placeholder="Add a response or internal resolution note…" /></label><button type="button" disabled={saving} onClick={() => void save()} className="mt-4 rounded-xl bg-purple-700 px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save update"}</button></> : <p className="rounded-xl bg-slate-50 p-5 text-slate-600">Select a ticket to view its details.</p>}</section></div></section>;
}
