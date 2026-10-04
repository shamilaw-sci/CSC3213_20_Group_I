"use client";

import { usePathname, useRouter } from "next/navigation";

export type DashboardRange = "7d" | "30d" | "6m";

export default function DashboardDateFilter({ value }: { value: DashboardRange }) {
  const router = useRouter();
  const pathname = usePathname();

  function updateRange(range: DashboardRange) {
    router.replace(`${pathname}?range=${range}`);
  }

  return (
    <label className="flex items-center gap-3 text-sm font-semibold text-white">
      Date range
      <select value={value} onChange={(event) => updateRange(event.target.value as DashboardRange)} className="rounded-xl border border-white/20 bg-white px-3 py-2 text-slate-950 outline-none focus:ring-2 focus:ring-purple-400">
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="6m">Last 6 months</option>
      </select>
    </label>
  );
}
