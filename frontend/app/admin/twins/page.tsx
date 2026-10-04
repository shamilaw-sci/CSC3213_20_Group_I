"use client";

import Image from "next/image";
import { HardDrive, Images, ScanLine, UserCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

type Twin = {
  id: string;
  imageUrl: string;
  name: string;
  email: string;
  role: "Registered User";
  status: string;
  createdAt: string;
};

type TwinData = {
  metrics: { totalTwinsCreated: number; totalImagesUploaded: number; storageBytes: number };
  twins: Twin[];
};

function formatStorage(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value < 10 ? value.toFixed(2) : value.toFixed(1)} ${unit}`;
}

export default function TwinsPage() {
  const [data, setData] = useState<TwinData | null>(null);
  const [selectedTwin, setSelectedTwin] = useState<Twin | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/admin/twins", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message ?? "Could not load digital-twin statistics.");
        return body as TwinData;
      })
      .then((body) => { setData(body); setError(""); })
      .catch((reason) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load digital-twin statistics."); });
    return () => controller.abort();
  }, []);

  const metrics = [
    { label: "Total digital twins created", value: data ? data.metrics.totalTwinsCreated.toLocaleString() : "—", icon: ScanLine, style: "from-purple-200 via-pink-100 to-white text-purple-800" },
    { label: "Total images uploaded", value: data ? data.metrics.totalImagesUploaded.toLocaleString() : "—", icon: Images, style: "from-pink-200 via-purple-100 to-white text-pink-800" },
    { label: "Storage consumption", value: data ? formatStorage(data.metrics.storageBytes) : "—", icon: HardDrive, style: "from-indigo-200 via-purple-100 to-white text-indigo-800" },
  ];

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-700">Monitoring</p>
        <h2 className="mt-1 text-3xl font-black text-slate-950">Digital Twin Monitor</h2>
        <p className="mt-2 text-slate-600">Live digital-twin totals and encrypted storage usage.</p>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}

      <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon, style }) => (
          <div key={label} className={`flex min-h-44 w-full flex-col justify-between rounded-3xl bg-gradient-to-br p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${style}`}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="max-w-48 text-base font-bold leading-6">{label}</h3>
              <span className="rounded-xl bg-white/70 p-2"><Icon size={24} /></span>
            </div>
            <p className="mt-6 break-words text-4xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-5 text-2xl font-black text-slate-950">Active digital twins</h3>
        {!data && !error && <p role="status" className="rounded-2xl bg-white p-6 shadow">Loading digital twins…</p>}
        {data && data.twins.length === 0 && <p className="rounded-2xl bg-white p-6 text-slate-500 shadow">No active digital twins found.</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {data?.twins.map((twin) => (
            <button key={twin.id} type="button" onClick={() => setSelectedTwin(twin)} className="overflow-hidden rounded-2xl bg-white text-left shadow transition hover:-translate-y-1 hover:shadow-xl">
              <Image src={twin.imageUrl} alt={`${twin.name}'s digital twin`} width={500} height={500} className="aspect-square w-full object-cover" unoptimized />
              <div className="p-4"><p className="truncate font-bold text-slate-950">{twin.name}</p><p className="truncate text-sm text-slate-500">{twin.email}</p></div>
            </button>
          ))}
        </div>
      </div>

      <TwinModal twin={selectedTwin} onClose={() => setSelectedTwin(null)} />
    </section>
  );
}

function TwinModal({ twin, onClose }: { twin: Twin | null; onClose: () => void }) {
  if (!twin) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={`${twin.name} digital twin`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close digital twin details" className="absolute right-4 top-4 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black"><X size={20} /></button>
        <Image src={twin.imageUrl} alt={`${twin.name}'s digital twin`} width={700} height={700} className="aspect-square w-full rounded-2xl object-cover" unoptimized />
        <h2 className="mt-5 text-2xl font-black text-slate-950">{twin.name}</h2>
        <p className="mt-1 break-all text-slate-600">{twin.email}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-2 text-sm font-semibold text-purple-800"><UserCheck size={17} />{twin.role}</span>
          <span className="rounded-full bg-green-100 px-3 py-2 text-sm font-semibold text-green-800">{twin.status}</span>
        </div>
        <p className="mt-4 text-sm text-slate-500">Created {new Date(twin.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
