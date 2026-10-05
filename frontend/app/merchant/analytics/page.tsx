"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";

type MerchantAnalytics = {
  totalProducts: number;
  statusCounts: Record<string, number>;
  totalStock: number;
  totalRedirects: number;
  redirectedProducts: number;
};

const emptyAnalytics: MerchantAnalytics = {
  totalProducts: 0,
  statusCounts: {},
  totalStock: 0,
  totalRedirects: 0,
  redirectedProducts: 0,
};

export default function MerchantAnalyticsPage() {
  const [analytics, setAnalytics] = useState<MerchantAnalytics>(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/v1/merchant/analytics", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "Could not load merchant analytics.");
        }

        setAnalytics(data.analytics);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not load merchant analytics.");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const cards = [
    { label: "Products", value: analytics.totalProducts },
    { label: "Stock units", value: analytics.totalStock },
    { label: "Merchant redirects", value: analytics.totalRedirects },
    { label: "Redirected products", value: analytics.redirectedProducts },
  ];

  return (
    <div className="tv-page min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-bold uppercase tracking-wide text-indigo-600">Merchant Analytics</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Catalog performance</h1>
            <p className="mt-2 text-sm text-slate-500">Track product coverage, stock and customer redirects.</p>
          </div>
          <Link href="/merchant" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">
            Back to dashboard
          </Link>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-gray-400">Loading analytics...</p>
        ) : error ? (
          <p className="mt-8 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-black text-indigo-700">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="tv-card mt-8 p-6">
              <h2 className="text-xl font-bold">Products by status</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"].map((status) => (
                  <div key={status} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">{status.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{analytics.statusCounts[status] ?? 0}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
