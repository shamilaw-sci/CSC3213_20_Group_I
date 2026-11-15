"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GoBackButton() {
  const router = useRouter();
  return <button type="button" onClick={() => router.back()} aria-label="Go back" title="Go back" className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"><ArrowLeft size={18} aria-hidden="true" /></button>;
}
