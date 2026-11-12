"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, ChevronDown, ChevronUp, KeyRound, Search, ShieldAlert, UserCheck } from "lucide-react";

import AdminTrendChart, { type TrendPoint } from "../components/adminTrendChart";

type SessionRecord = {
  id: string;
  user: { name: string; email: string; role: string };
  type: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiryDate: string;
  revokedAt: string | null;
  current: boolean;
};

type SecurityData = {
  summary: { activeSessions: number; successfulLogins24h: number; failedAttempts24h: number; adminActions30d: number };
  alerts: Array<{ id: string; severity: "HIGH" | "MEDIUM" | "LOW"; title: string; detail: string; href: string }>;
  loginHistory: SessionRecord[];
  activeSessions: SessionRecord[];
  failedAttempts: Array<{ id: string; email: string; reason: string; ipAddress: string | null; userAgent: string | null; timestamp: string }>;
  adminAuditLogs: Array<{ id: string; action: string; entityType: string | null; entityId: string | null; timestamp: string; admin: { name: string; email: string } | null }>;
  chart: { weekly: TrendPoint[]; monthly: TrendPoint[] };
};

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function formatAction(value: string) {
  return value.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function deviceLabel(userAgent: string | null) {
  if (!userAgent) return "Not recorded";
  if (/iphone|ipad/i.test(userAgent)) return "iPhone or iPad";
  if (/android/i.test(userAgent)) return "Android device";
  if (/macintosh|mac os/i.test(userAgent)) return "Mac browser";
  if (/windows/i.test(userAgent)) return "Windows browser";
  return userAgent.slice(0, 54);
}

export default function SecurityDashboard() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  function toggleTable(table: string) {
    setExpandedTables((current) => ({ ...current, [table]: !current[table] }));
  }

  const loadSecurity = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/admin/security", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not load security information.");
      setError("");
      setData(body);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load security information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const search = new URLSearchParams(window.location.search).get("search")?.trim();
    const securityUrl = search ? `/api/v1/admin/security?search=${encodeURIComponent(search)}` : "/api/v1/admin/security";
    fetch(securityUrl, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message ?? "Could not load security information.");
        return body as SecurityData;
      })
      .then((body) => { setData(body); setError(""); })
      .catch((reason) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load security information."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const term = new URLSearchParams(window.location.search).get("search");
    if (term) setQuery(term);
  }, []);

  async function revokeSession(session: SessionRecord) {
    if (session.current || revoking) return;
    if (!window.confirm(`Revoke ${session.user.name}'s session from ${deviceLabel(session.userAgent)}?`)) return;
    setRevoking(session.id);
    setError("");
    try {
      const response = await fetch(`/api/v1/admin/security/sessions/${encodeURIComponent(session.id)}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Could not revoke this session.");
      await loadSecurity();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not revoke this session.");
    } finally {
      setRevoking(null);
    }
  }

  if (loading) return <p role="status" className="rounded-2xl bg-white p-6 shadow">Loading security information…</p>;

  const cards = data ? [
    { label: "Active sessions", value: data.summary.activeSessions, icon: Activity, color: "text-blue-700 bg-blue-100" },
    { label: "Successful logins (24h)", value: data.summary.successfulLogins24h, icon: UserCheck, color: "text-emerald-700 bg-emerald-100" },
    { label: "Failed attempts (24h)", value: data.summary.failedAttempts24h, icon: ShieldAlert, color: "text-red-700 bg-red-100" },
    { label: "Admin actions (30d)", value: data.summary.adminActions30d, icon: KeyRound, color: "text-purple-700 bg-purple-100" },
  ] : [];
  const term = query.trim().toLowerCase();
  const filteredData = data ? {
    ...data,
    activeSessions: data.activeSessions.filter((session) => !term || `${session.id} ${session.user.name} ${session.user.email} ${session.user.role} ${session.type} ${session.ipAddress ?? ""} ${session.userAgent ?? ""}`.toLowerCase().includes(term)),
    loginHistory: data.loginHistory.filter((session) => !term || `${session.id} ${session.user.name} ${session.user.email} ${session.user.role} ${session.type} ${session.ipAddress ?? ""} ${session.userAgent ?? ""}`.toLowerCase().includes(term)),
    failedAttempts: data.failedAttempts.filter((attempt) => !term || `${attempt.id} ${attempt.email} ${attempt.reason} failed login auth login failed ${attempt.ipAddress ?? ""} ${attempt.userAgent ?? ""}`.toLowerCase().includes(term)),
    adminAuditLogs: data.adminAuditLogs.filter((event) => !term || `${event.id} ${event.action} ${event.entityType ?? ""} ${event.entityId ?? ""} ${event.admin?.name ?? ""} ${event.admin?.email ?? ""}`.toLowerCase().includes(term)),
  } : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-700">Administration</p>
        <h2 className="mt-1 text-3xl font-black text-slate-950">Security centre</h2>
        <p className="mt-2 text-slate-600">Review authentication activity, revoke sessions, and inspect administrator actions.</p>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
      <label className="flex w-full max-w-lg items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"><Search size={18} className="text-slate-500" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sessions, login activity, or audit logs" aria-label="Search security activity" className="w-full outline-none" /></label>

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl bg-white p-5 shadow">
                <div className={`inline-flex rounded-xl p-2 ${color}`}><Icon size={22} /></div>
                <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl bg-white p-6 shadow">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-amber-100 p-2 text-amber-700"><AlertTriangle size={22} /></span>
              <div>
                <h3 className="text-xl font-black text-slate-950">Alerts</h3>
                <p className="text-sm text-slate-600">Security and operational items detected during the last 30 days.</p>
              </div>
            </div>
            {data.alerts.length ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {data.alerts.map((alert) => (
                  <Link key={alert.id} href={alert.href} className="rounded-xl border border-slate-200 p-4 transition hover:border-purple-300 hover:bg-purple-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{alert.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{alert.detail}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-black ${alert.severity === "HIGH" ? "bg-red-100 text-red-700" : alert.severity === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{alert.severity}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">No alerts were detected in the last 30 days.</p>
            )}
          </section>

          <AdminTrendChart title="Security login trends" description="Successful registered logins compared with rejected login attempts." weeklyData={data.chart.weekly} monthlyData={data.chart.monthly} series={[{ key: "successful", name: "Successful", color: "#059669" }, { key: "failed", name: "Failed", color: "#dc2626" }]} />

          <section id="failed-logins" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow">
            <h3 className="text-xl font-black">Active sessions</h3>
            <p className="mt-1 text-sm text-slate-600">Revoke access for a device or session that should no longer be signed in.</p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead><tr className="border-b text-slate-500"><th className="p-3">Account</th><th className="p-3">Device</th><th className="p-3">IP address</th><th className="p-3">Signed in</th><th className="p-3">Expires</th><th className="p-3">Action</th></tr></thead>
                <tbody>{(expandedTables.activeSessions ? filteredData!.activeSessions : filteredData!.activeSessions.slice(0, 5)).map((session) => (
                  <tr key={session.id} className="border-b last:border-0">
                    <td className="p-3"><span className="font-semibold">{session.user.name}</span><br /><span className="text-slate-500">{session.user.email}</span></td>
                    <td className="p-3">{deviceLabel(session.userAgent)}{session.current && <span className="ml-2 rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700">Current</span>}</td>
                    <td className="p-3">{session.ipAddress ?? "Not recorded"}</td>
                    <td className="p-3">{formatDate(session.createdAt)}</td>
                    <td className="p-3">{formatDate(session.expiryDate)}</td>
                    <td className="p-3"><button type="button" disabled={session.current || revoking !== null} onClick={() => void revokeSession(session)} className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">{revoking === session.id ? "Revoking…" : session.current ? "Current session" : "Revoke"}</button></td>
                  </tr>
                ))}</tbody>
              </table>
              {!filteredData!.activeSessions.length && <p className="py-6 text-sm text-slate-500">No active sessions match this search.</p>}
              {filteredData!.activeSessions.length > 5 && <TableExpansionButton expanded={Boolean(expandedTables.activeSessions)} remaining={filteredData!.activeSessions.length - 5} onClick={() => toggleTable("activeSessions")} />}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-xl font-black">Login history</h3>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead><tr className="border-b text-slate-500"><th className="p-3">Account</th><th className="p-3">Role</th><th className="p-3">Device</th><th className="p-3">IP address</th><th className="p-3">Time</th><th className="p-3">Status</th></tr></thead>
                <tbody>{(expandedTables.loginHistory ? filteredData!.loginHistory : filteredData!.loginHistory.slice(0, 5)).map((session) => {
                  const status = session.revokedAt ? "Revoked" : new Date(session.expiryDate) <= new Date() ? "Expired" : "Active";
                  return <tr key={session.id} className="border-b last:border-0"><td className="p-3"><span className="font-semibold">{session.user.name}</span><br /><span className="text-slate-500">{session.user.email}</span></td><td className="p-3">{session.user.role}</td><td className="p-3">{deviceLabel(session.userAgent)}</td><td className="p-3">{session.ipAddress ?? "Not recorded"}</td><td className="p-3">{formatDate(session.createdAt)}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{status}</span></td></tr>;
                })}</tbody>
              </table>
              {!filteredData!.loginHistory.length && <p className="py-6 text-sm text-slate-500">No login history matches this search.</p>}
              {filteredData!.loginHistory.length > 5 && <TableExpansionButton expanded={Boolean(expandedTables.loginHistory)} remaining={filteredData!.loginHistory.length - 5} onClick={() => toggleTable("loginHistory")} />}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-xl font-black">Failed login tracking</h3>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead><tr className="border-b text-slate-500"><th className="p-3">Email entered</th><th className="p-3">Reason</th><th className="p-3">IP address</th><th className="p-3">Device</th><th className="p-3">Time</th></tr></thead>
                <tbody>{(expandedTables.failedAttempts ? filteredData!.failedAttempts : filteredData!.failedAttempts.slice(0, 5)).map((attempt) => <tr key={attempt.id} className="border-b last:border-0"><td className="p-3 font-semibold">{attempt.email}</td><td className="p-3">{formatAction(attempt.reason)}</td><td className="p-3">{attempt.ipAddress ?? "Not recorded"}</td><td className="p-3">{deviceLabel(attempt.userAgent)}</td><td className="p-3">{formatDate(attempt.timestamp)}</td></tr>)}</tbody>
              </table>
              {!filteredData!.failedAttempts.length && <p className="py-6 text-sm text-slate-500">No failed login attempts match this search.</p>}
              {filteredData!.failedAttempts.length > 5 && <TableExpansionButton expanded={Boolean(expandedTables.failedAttempts)} remaining={filteredData!.failedAttempts.length - 5} onClick={() => toggleTable("failedAttempts")} />}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-xl font-black">Admin audit log</h3>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead><tr className="border-b text-slate-500"><th className="p-3">Administrator</th><th className="p-3">Action</th><th className="p-3">Target</th><th className="p-3">Time</th></tr></thead>
                <tbody>{(expandedTables.adminAuditLogs ? filteredData!.adminAuditLogs : filteredData!.adminAuditLogs.slice(0, 5)).map((event) => <tr key={event.id} className="border-b last:border-0"><td className="p-3"><span className="font-semibold">{event.admin?.name ?? "Administrator"}</span><br /><span className="text-slate-500">{event.admin?.email ?? "Unknown"}</span></td><td className="p-3">{formatAction(event.action)}</td><td className="p-3">{event.entityType ?? "—"}{event.entityId ? <><br /><span className="text-xs text-slate-500">{event.entityId}</span></> : null}</td><td className="p-3">{formatDate(event.timestamp)}</td></tr>)}</tbody>
              </table>
              {!filteredData!.adminAuditLogs.length && <p className="py-6 text-sm text-slate-500">No audit log entries match this search.</p>}
              {filteredData!.adminAuditLogs.length > 5 && <TableExpansionButton expanded={Boolean(expandedTables.adminAuditLogs)} remaining={filteredData!.adminAuditLogs.length - 5} onClick={() => toggleTable("adminAuditLogs")} />}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function TableExpansionButton({ expanded, remaining, onClick }: { expanded: boolean; remaining: number; onClick: () => void }) {
  const Icon = expanded ? ChevronUp : ChevronDown;
  return (
    <div className="flex justify-center border-t border-slate-100 pt-4">
      <button type="button" onClick={onClick} aria-expanded={expanded} className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-2 text-sm font-bold text-purple-700 transition hover:bg-purple-50">
        {expanded ? "Show less" : `See more (${remaining})`}
        <Icon size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
