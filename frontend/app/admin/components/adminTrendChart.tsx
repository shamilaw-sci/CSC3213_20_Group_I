"use client";

import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type TrendPoint = { label: string; [key: string]: string | number };
export type TrendSeries = { key: string; name: string; color: string };
export type TrendDataProps = { weeklyData: TrendPoint[]; monthlyData: TrendPoint[]; threeMonthData: TrendPoint[]; sixMonthData: TrendPoint[] };

type Props = {
  title: string;
  description: string;
  weeklyData: TrendPoint[];
  monthlyData: TrendPoint[];
  threeMonthData?: TrendPoint[];
  sixMonthData?: TrendPoint[];
  series: TrendSeries[];
};

type Period = "weekly" | "monthly" | "threeMonths" | "sixMonths";

export default function AdminTrendChart({ title, description, weeklyData, monthlyData, threeMonthData, sixMonthData, series }: Props) {
  const [period, setPeriod] = useState<Period>("weekly");
  const options: Array<{ value: Period; label: string; data: TrendPoint[] }> = [
    { value: "weekly", label: "Weekly", data: weeklyData },
    { value: "monthly", label: "Monthly", data: monthlyData },
    ...(threeMonthData ? [{ value: "threeMonths" as const, label: "3 months", data: threeMonthData }] : []),
    ...(sixMonthData ? [{ value: "sixMonths" as const, label: "6 months", data: sixMonthData }] : []),
  ];
  const data = options.find((option) => option.value === period)?.data ?? weeklyData;

  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-lg">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="flex shrink-0 rounded-xl bg-slate-100 p-1" aria-label={`${title} period`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              aria-pressed={period === option.value}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${period === option.value ? "bg-purple-700 text-white shadow" : "text-slate-600 hover:bg-white"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full" aria-label={`${title} line chart`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
            <YAxis allowDecimals={false} domain={[0, "auto"]} tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
            {series.length > 1 && <Legend />}
            {series.map((item) => (
              <Line key={item.key} type="monotone" dataKey={item.key} name={item.name} stroke={item.color} strokeWidth={3} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
