"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, CircleHelp, CreditCard, LockKeyhole, MessageCircle, Search, Shirt, Sparkles, UserRound, Zap } from "lucide-react";

import Navbar from "@/app/components/Navbar";

type Category = "Getting Started" | "Digital Twin" | "Virtual Try-On" | "Explore & Products" | "My Account & Privacy" | "My Plan & Payments" | "Technical Issues";
type Faq = { category: Category; question: string; answer: string };

const categories: { name: Category; description: string; icon: typeof CircleHelp }[] = [
  { name: "Getting Started", description: "Set up your account and begin exploring.", icon: Sparkles },
  { name: "Digital Twin", description: "Upload, crop and protect your photo.", icon: UserRound },
  { name: "Virtual Try-On", description: "Use outfits and fitting previews.", icon: Shirt },
  { name: "Explore & Products", description: "Find, save and compare fashion.", icon: Search },
  { name: "My Account & Privacy", description: "Manage your profile and data.", icon: LockKeyhole },
  { name: "My Plan & Payments", description: "Understand the current plan preview.", icon: CreditCard },
  { name: "Technical Issues", description: "Troubleshoot common problems.", icon: Zap },
];

const faqs: Faq[] = [
  { category: "Getting Started", question: "What is TryVora?", answer: "TryVora is a digital fitting room that lets you explore products, save favourites, use your profile measurements and open an illustrative Try-On preview." },
  { category: "Getting Started", question: "How do I create an account?", answer: "Choose Register from the header, complete the form and sign in with the account you create." },
  { category: "Getting Started", question: "How do I start using TryVora?", answer: "Add your profile information and measurements, upload a Digital Twin photo, then explore products and choose Try On." },
  { category: "Digital Twin", question: "What is a Digital Twin?", answer: "It is your saved full-body reference photo and measurement profile used to personalise the fitting-room experience." },
  { category: "Digital Twin", question: "How do I upload my Digital Twin photo?", answer: "Open Profile or Digital Twin from the sidebar, choose an image, adjust the crop, and select Use this crop." },
  { category: "Digital Twin", question: "What type of photo should I upload?", answer: "Use a clear, front-facing PNG or JPEG, maximum 5 MB and at least 400 × 600 pixels. Keep your full body visible in good lighting." },
  { category: "Digital Twin", question: "Can I change or replace my photo?", answer: "Yes. Open the Digital Twin tab and select Replace Photo. You can crop and upload a new image." },
  { category: "Digital Twin", question: "How is my photo used?", answer: "The photo is stored as your private Digital Twin reference for the fitting-room experience. TryVora currently provides an illustrative fitting preview, not a generated photo of you wearing clothes." },
  { category: "Virtual Try-On", question: "How do I try on a dress?", answer: "Open Explore, choose a product's Try On action, then use the shared fitting preview. You can also select a product first and open Generate My Look from Digital Twin." },
  { category: "Virtual Try-On", question: "Why is Generate My Look disabled?", answer: "A selected product and a saved Digital Twin photo are both required. Products without an available listed size may also be unavailable for generation." },
  { category: "Virtual Try-On", question: "Where can I find my try-on history?", answer: "Open Virtual Try-On History from the customer sidebar or visit /profile/try-on-history." },
  { category: "Virtual Try-On", question: "Can I download my generated fitting result?", answer: "The current Try-On system stores illustrative fitting guides rather than generated result image files, so downloads are not currently available." },
  { category: "Explore & Products", question: "How do I find dresses?", answer: "Use Explore search, category filters, sorting and price filters to browse the catalogue." },
  { category: "Explore & Products", question: "How do I select a dress for Virtual Try-On?", answer: "Choose Try On on the product card or product page. The shared Try-On context keeps the selected product available." },
  { category: "Explore & Products", question: "How do I save my favourite products?", answer: "Use the heart button on a product card. Your saved products are available from My Favorites." },
  { category: "My Account & Privacy", question: "How do I update my profile?", answer: "Open Profile, then use the Account, Measurements or Digital Twin sections as appropriate." },
  { category: "My Account & Privacy", question: "How can I protect my uploaded photos?", answer: "Use the private Digital Twin upload flow and avoid sharing your signed or preview URLs. The app keeps Digital Twin storage behind authenticated endpoints." },
  { category: "My Account & Privacy", question: "How can I delete my Digital Twin photo?", answer: "Open the Digital Twin tab, choose Delete Photo and confirm the action." },
  { category: "My Plan & Payments", question: "What plans does TryVora offer?", answer: "The My Plan page currently presents Starter, Style Plus and Style Pro as a visual plan preview." },
  { category: "My Plan & Payments", question: "What features are included in each plan?", answer: "The plan cards describe the proposed feature tiers. Customer billing, usage limits and activation are not connected yet." },
  { category: "My Plan & Payments", question: "How can I upgrade my plan?", answer: "Upgrade actions are currently disabled because customer payment and subscription activation have not been implemented." },
  { category: "Technical Issues", question: "Why is my photo upload failing?", answer: "Check that the file is PNG or JPEG, no larger than 5 MB, and at least 400 × 600 pixels. Try a different image if the problem continues." },
  { category: "Technical Issues", question: "Why is my Digital Twin photo not appearing?", answer: "Refresh the Profile page and confirm you are signed into the correct account. If the Digital Twin endpoint is unavailable, try again later." },
  { category: "Technical Issues", question: "What should I do if Virtual Try-On fails?", answer: "Close and reopen the fitting preview, confirm a product and photo are available, then try again. The current preview is illustrative." },
  { category: "Technical Issues", question: "Why is the page not loading correctly?", answer: "Refresh the page, check your connection and confirm the local database/service is available. If the issue persists, record the page and message shown." },
];

const tutorials = [
  ["1", "Creating Your Digital Twin", "Open Digital Twin, upload a clear photo, adjust the crop and save it."],
  ["2", "Choosing an Outfit from Explore", "Browse products and select Try On on the dress you want to preview."],
  ["3", "Generating Your Look", "Return to Digital Twin with a selected dress and choose Generate My Look."],
  ["4", "Managing Your Favourites", "Use the heart button to save products, then open My Favorites from the sidebar."],
];

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [open, setOpen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "yes" | "no">>({});

  const filtered = useMemo(() => faqs.filter((faq) => {
    const matchesCategory = category === "All" || faq.category === category;
    const text = `${faq.question} ${faq.answer}`.toLowerCase();
    return matchesCategory && (!query.trim() || text.includes(query.trim().toLowerCase()));
  }), [category, query]);

  return <div className="tv-page min-h-screen bg-slate-50"><Navbar /><main className="mx-auto max-w-7xl px-5 py-10 lg:pl-80">
    <section className="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-7 text-white shadow-xl sm:p-10">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-100">Self-service help centre</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">How can we help you?</h1>
      <p className="mt-3 max-w-2xl text-indigo-100">Find answers, explore helpful guides, and get the support you need to enjoy your TryVora experience.</p>
      <label className="mt-7 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-lg"><Search size={21} className="text-indigo-600" aria-hidden="true" /><span className="sr-only">Search FAQs</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for answers, topics or problems..." className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400" /></label>
      <div className="mt-4 flex flex-wrap gap-2 text-sm"><span className="text-indigo-100">Popular:</span>{["Digital Twin", "Virtual Try-On", "Photo Upload", "My Plan"].map((item) => <button key={item} type="button" onClick={() => setQuery(item)} className="rounded-full bg-white/15 px-3 py-1.5 font-semibold hover:bg-white/25">{item}</button>)}</div>
    </section>
    <section className="mt-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Browse topics</p><h2 className="mt-2 text-2xl font-black text-slate-950">What do you need help with?</h2></div><button type="button" onClick={() => { setQuery(""); setCategory("All"); }} className="text-sm font-semibold text-indigo-700 hover:underline">Reset filters</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{categories.map(({ name, description, icon: Icon }) => <button type="button" key={name} onClick={() => setCategory(name)} className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${category === name ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100" : "border-slate-200 bg-white"}`}><Icon size={23} className="text-indigo-600" aria-hidden="true" /><h3 className="mt-4 font-bold text-slate-950">{name}</h3><p className="mt-1 text-sm text-slate-600">{description}</p><p className="mt-3 text-xs font-bold uppercase tracking-wide text-indigo-600">{faqs.filter((faq) => faq.category === name).length} questions</p></button>)}</div></section>
    <section className="mt-12" aria-labelledby="faq-heading"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Knowledge base</p><h2 id="faq-heading" className="mt-2 text-2xl font-black text-slate-950">Frequently Asked Questions</h2></div><span className="text-sm text-slate-500">{filtered.length} results</span></div><div className="mt-5 space-y-3">{filtered.map((faq) => { const isOpen = open === faq.question; return <article key={faq.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : faq.question)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-slate-950 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"><span>{faq.question}</span><ChevronDown size={20} className={`shrink-0 transition ${isOpen ? "rotate-180 text-indigo-600" : "text-slate-400"}`} aria-hidden="true" /></button>{isOpen && <div className="border-t border-slate-100 px-5 pb-5 pt-4"><p className="leading-7 text-slate-600">{faq.answer}</p><div className="mt-5 flex items-center gap-3 text-sm"><span className="font-semibold text-slate-700">Was this answer helpful?</span><button type="button" onClick={() => setFeedback((old) => ({ ...old, [faq.question]: "yes" }))} className={`rounded-lg px-3 py-1.5 font-semibold ${feedback[faq.question] === "yes" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-emerald-50"}`}>Yes</button><button type="button" onClick={() => setFeedback((old) => ({ ...old, [faq.question]: "no" }))} className={`rounded-lg px-3 py-1.5 font-semibold ${feedback[faq.question] === "no" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600 hover:bg-rose-50"}`}>No</button>{feedback[faq.question] && <span className="text-xs text-slate-500">Thanks for your feedback.</span>}</div></div>}</article>; })}</div>{filtered.length === 0 && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-10 text-center"><CircleHelp className="mx-auto text-indigo-600" /><p className="mt-3 font-bold text-slate-900">No answers found</p><p className="mt-1 text-sm text-slate-600">Try a different search or reset the filters.</p></div>}</section>
    <section className="mt-12"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Quick guides</p><h2 className="mt-2 text-2xl font-black text-slate-950">Learn How to Use TryVora</h2></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{tutorials.map(([number, title, description]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 font-black text-indigo-700">{number}</span><h3 className="mt-4 font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>)}</div></section>
    <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr]"><div className="rounded-3xl bg-slate-900 p-7 text-white"><MessageCircle size={28} className="text-indigo-300" /><h2 className="mt-5 text-2xl font-black">Still need help?</h2><p className="mt-2 text-slate-300">We&apos;re here to help you have a better TryVora experience.</p><p className="mt-6 text-sm leading-6 text-slate-400">If these self-service answers do not solve the problem, open a support ticket so an authorised team member can follow up.</p><Link href="/support" className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-white">Contact Support</Link></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-950">Need personal assistance?</h2><p className="mt-1 text-sm text-slate-500">The Support page handles ticket submission, status tracking and admin responses.</p><Link href="/support" className="mt-4 inline-flex text-sm font-bold text-indigo-700 hover:underline">Open Support</Link></div></section>
  </main></div>;
}
