import Link from "next/link";
import { ArrowUpRight, Clock3, MessageSquareWarning, ScanLine, ShieldCheck, UsersRound } from "lucide-react";

import { dashboardRangeStart, getAdminDashboardOverview, type DashboardRange } from "@/server/modules/analytics/admin-dashboard";
import DashboardDateFilter from "./components/dashboardDateFilter";

const cards = [
  {
    key: "users",
    label: "New users",
    href: "/admin/users",
    description: "Review customer, merchant, and admin accounts.",
    icon: UsersRound,
  },
  {
    key: "twins",
    label: "Digital twins created",
    href: "/admin/twins",
    description: "Monitor the digital twins stored by the platform.",
    icon: ScanLine,
  },
  {
    key: "sessions",
    label: "Try-on sessions",
    href: "/admin/try-ons",
    description: "See the amount of virtual try-on activity.",
    icon: ShieldCheck,
  },
] as const;

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const requestedRange = (await searchParams).range;
  const range: DashboardRange = requestedRange === "7d" || requestedRange === "6m" ? requestedRange : "30d";
  const rangeStart = dashboardRangeStart(range);
  const overview = await getAdminDashboardOverview(rangeStart);
  const totals = overview.totals;

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-6 rounded-3xl bg-slate-950 px-7 py-8 text-white shadow-xl md:flex-row md:items-end md:justify-between">
        <div><p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-300">Overview</p><h2 className="mt-2 text-3xl font-black">Welcome to the admin dashboard</h2><p className="mt-3 max-w-2xl text-slate-300">View platform activity and open the management area that needs your attention.</p></div>
        <DashboardDateFilter value={range} />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(({ key, label, href, description, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <Icon className="text-purple-700" size={30} />
              <span className="text-4xl font-black text-slate-950">{totals[key]}</span>
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-950">{label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </Link>
        ))}
      </div>

      <Link href="/admin/feedback" className="flex flex-col gap-4 rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="rounded-2xl bg-purple-100 p-3 text-purple-700"><MessageSquareWarning size={26} /></span>
          <div><h3 className="text-lg font-bold text-slate-950">Feedback management</h3><p className="mt-1 text-sm text-slate-600">Review customer feedback, update statuses, and record resolution notes.</p></div>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-bold text-purple-800">Open feedback <ArrowUpRight size={16} /></span>
      </Link>

      <section className="rounded-3xl bg-white/90 p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between"><div><h3 className="text-xl font-black text-slate-950">Recent activity</h3><p className="text-sm text-slate-500">Latest events within the selected date range.</p></div><Clock3 className="text-purple-700" /></div>
        <div className="divide-y">
          {overview.activity.map((item) => <Link key={item.id} href={item.href} className="flex items-center justify-between gap-4 py-3 hover:text-purple-800"><div className="min-w-0"><p className="truncate font-semibold capitalize">{item.title}</p><p className="truncate text-sm text-slate-500">{item.detail}</p></div><div className="flex shrink-0 items-center gap-2 text-xs text-slate-500"><span>{item.timestamp.toLocaleString()}</span><ArrowUpRight size={15} /></div></Link>)}
          {!overview.activity.length && <p className="py-8 text-sm text-slate-500">No activity in this date range.</p>}
        </div>
      </section>

    </section>
  );
}
