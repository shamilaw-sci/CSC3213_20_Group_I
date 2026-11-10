"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { LifeBuoy, MessageSquare, Paperclip, Send, Ticket, X } from "lucide-react";

import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/features/auth/context/AuthContext";

type TicketItem = { id: string; reference: string; subject: string | null; category: string; priority: number | null; message: string; response: string | null; status: string; createdAt: string };
const categories = [["ACCOUNT", "Account Issues"], ["DIGITAL_TWIN", "Digital Twin"], ["TRY_ON", "Virtual Try-On"], ["PRODUCTS", "Products & Explore"], ["PLANS", "Plans & Payments"], ["PRIVACY", "Privacy & Security"], ["OTHER", "Other"]];
const statusLabels: Record<string, string> = { OPEN: "Open", IN_REVIEW: "In Progress", RESOLVED: "Resolved", CLOSED: "Closed" };
const categoryLabels: Record<string, string> = { GENERAL: "Other", DIGITAL_TWIN: "Digital Twin", VIRTUAL_TRY_ON: "Virtual Try-On", PRODUCT: "Products & Explore", BUG_REPORT: "Technical Issue" };

export default function SupportPage() {
  const { user, ready } = useAuth();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [selected, setSelected] = useState<TicketItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    fetch("/api/v1/support", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not load tickets.");
      setTickets(body.tickets ?? []);
    }).catch((error) => setMessage(error instanceof Error ? error.message : "Could not load tickets.")).finally(() => setLoading(false));
  }, [ready, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/v1/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: form.get("subject"), category: form.get("category"), priority: form.get("priority"), message: form.get("message") }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not submit your request.");
      setMessage(`Request ${body.ticket.reference} submitted successfully.`);
      event.currentTarget.reset();
      const refreshed = await fetch("/api/v1/support", { cache: "no-store" });
      if (refreshed.ok) setTickets((await refreshed.json()).tickets ?? []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit your request."); } finally { setSubmitting(false); }
  }

  return <div className="tv-page min-h-screen bg-slate-50"><Navbar /><main className="mx-auto max-w-7xl px-5 py-10 lg:pl-80"><section className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl sm:p-10"><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">Personal customer support</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">We&apos;re Here to Help!</h1><p className="mt-3 max-w-2xl text-slate-300">Need assistance with TryVora? Submit a request and our team will help you.</p><Link href="/help" className="mt-5 inline-flex text-sm font-bold text-indigo-200 hover:text-white hover:underline">Looking for quick answers? Visit Help &amp; FAQ</Link></section>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-100 p-3 text-indigo-700"><Send size={22} /></div><div><h2 className="text-xl font-black text-slate-950">Submit a Support Request</h2><p className="text-sm text-slate-500">Tell us what happened and we&apos;ll keep it with your account.</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><input required name="subject" placeholder="Subject" className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2" /><select name="category" className="rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="ACCOUNT">Account Issues</option>{categories.slice(1).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select name="priority" className="rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="NORMAL">Normal priority</option><option value="LOW">Low priority</option><option value="HIGH">High priority</option></select><textarea required minLength={10} name="message" placeholder="Describe the problem in detail..." className="min-h-40 rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2" /><label className="flex items-center gap-2 text-sm text-slate-500 sm:col-span-2"><Paperclip size={17} /> Screenshot attachment is not stored yet.</label></div><button disabled={submitting || !ready} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"><Send size={17} />{submitting ? "Submitting…" : "Submit Request"}</button>{message && <p role="status" className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-800">{message}</p>}</form>
    <aside className="space-y-6"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><LifeBuoy className="text-indigo-600" /><h2 className="text-xl font-black text-slate-950">Contact Us</h2></div><p className="mt-4 text-sm leading-6 text-slate-600">Support contact details are not configured in this project yet. Submit a ticket and it will be visible to authorized administrators.</p></section><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><MessageSquare className="text-indigo-600" /><h2 className="text-xl font-black text-slate-950">Feedback & Suggestions</h2></div><p className="mt-3 text-sm leading-6 text-slate-600">Use the support form with category “Other” to send product feedback or a suggestion.</p></section></aside></div>
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><Ticket className="text-indigo-600" /><div><h2 className="text-xl font-black text-slate-950">My Support Tickets</h2><p className="text-sm text-slate-500">Only tickets belonging to your account are shown.</p></div></div>{loading ? <p className="mt-6 text-sm text-slate-500">Loading your tickets…</p> : tickets.length === 0 ? <p className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">You have not submitted any support requests yet.</p> : <div className="mt-5 divide-y divide-slate-100">{tickets.map((ticket) => <button type="button" key={ticket.id} onClick={() => setSelected(ticket)} className="flex w-full flex-wrap items-center justify-between gap-3 py-4 text-left hover:bg-slate-50"><span><span className="block text-xs font-bold uppercase tracking-wide text-indigo-600">{ticket.reference}</span><span className="block font-bold text-slate-900">{ticket.subject}</span><span className="text-sm text-slate-500">{categoryLabels[ticket.category] ?? ticket.category} · {new Date(ticket.createdAt).toLocaleDateString()}</span></span><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{statusLabels[ticket.status] ?? ticket.status}</span></button>)}</div>}</section>
    {selected && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true"><section className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{selected.reference}</p><h2 className="mt-1 text-2xl font-black text-slate-950">{selected.subject}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close ticket" className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button></div><p className="mt-5 whitespace-pre-wrap text-slate-700">{selected.message}</p><div className="mt-5 rounded-xl bg-indigo-50 p-4"><p className="text-sm font-bold text-indigo-900">Status: {statusLabels[selected.status] ?? selected.status}</p>{selected.response ? <p className="mt-2 text-sm text-indigo-800">Admin response: {selected.response}</p> : <p className="mt-2 text-sm text-indigo-800">Our team has not added a response yet.</p>}</div></section></div>}
  </main></div>;
}
