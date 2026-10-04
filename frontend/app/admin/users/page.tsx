"use client";

import { Ban, RotateCcw, ShieldCheck, Store, User, UserCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type UserRecord = {
  id: string;
  kind: "REGISTERED" | "GUEST";
  name: string;
  email: string;
  accountType: "REGISTERED_USER" | "GUEST_USER" | "MERCHANT" | "ADMIN";
  status: "ACTIVE" | "RESTRICTED";
  createdAt: string;
  lastActivityAt: string | null;
  twinsCreated: number | null;
  tryOns: number | null;
  restrictable: boolean;
};

const roleLabels = { REGISTERED_USER: "Registered user", GUEST_USER: "Guest user", MERCHANT: "Merchant", ADMIN: "Admin" };

function RoleBadge({ accountType }: { accountType: UserRecord["accountType"] }) {
  const details = {
    REGISTERED_USER: { icon: UserCheck, className: "bg-purple-100 text-purple-900" },
    GUEST_USER: { icon: User, className: "bg-amber-100 text-amber-900" },
    MERCHANT: { icon: Store, className: "bg-blue-100 text-blue-900" },
    ADMIN: { icon: ShieldCheck, className: "bg-emerald-100 text-emerald-900" },
  }[accountType];
  const Icon = details.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${details.className}`}><Icon size={16} />{roleLabels[accountType]}</span>;
}

function getTimeAgo(dateString: string) {
  const timestamp = Date.parse(dateString);
  if (!Number.isFinite(timestamp)) return "Unknown";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const changing = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadUsers() {
      try {
        const response = await fetch("/api/v1/admin/users", { cache: "no-store", signal: controller.signal });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message ?? "Could not load users.");
        if (!Array.isArray(body.users)) throw new Error("Invalid user-list response.");
        if (!controller.signal.aborted) setUsers(body.users);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load users.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadUsers();
    return () => controller.abort();
  }, []);

  async function changeRestriction(user: UserRecord) {
    if (!user.restrictable || changing.current) return;
    const nextStatus = user.status === "ACTIVE" ? "RESTRICTED" : "ACTIVE";
    const action = nextStatus === "RESTRICTED" ? "Restrict" : "Reactivate";
    if (!window.confirm(`${action} ${user.name}?${nextStatus === "RESTRICTED" && user.kind === "REGISTERED" ? " Their active sessions will be revoked." : ""}`)) return;
    changing.current = true;
    setPendingId(user.id);
    setError("");
    try {
      const response = await fetch(`/api/v1/admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: user.kind, status: nextStatus }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Could not update this customer.");
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: nextStatus } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update this customer.");
    } finally {
      changing.current = false;
      setPendingId(null);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h1 className="mb-5 text-3xl font-bold">User Details</h1>
      {error && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-purple-200 bg-purple-50 p-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-700 text-white"><UserCheck size={23} /></span>
          <div><p className="font-bold text-purple-950">Registered users</p><p className="text-sm text-purple-700">{users.filter((user) => user.accountType === "REGISTERED_USER").length} customers</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-600 text-white"><User size={23} /></span>
          <div><p className="font-bold text-amber-950">Guest users</p><p className="text-sm text-amber-700">{users.filter((user) => user.accountType === "GUEST_USER").length} guests</p></div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table aria-busy={loading} className="mt-4 w-full border-collapse border border-gray-300 text-left">
          <thead><tr className="bg-gray-200 text-sm uppercase text-gray-600">
            <th scope="col" className="p-2">User</th><th scope="col" className="p-2">Role</th>
            <th scope="col" className="p-2">Status</th><th scope="col" className="p-2">Joined</th><th scope="col" className="p-2">Last activity</th>
            <th scope="col" className="p-2">Usage</th><th scope="col" className="p-2">Actions</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-4" role="status">Loading users...</td></tr>}
            {!loading && !error && users.length === 0 && <tr><td colSpan={7} className="p-4">No users found.</td></tr>}
            {users.map((user) => <tr key={user.id} className="border-b hover:bg-gray-100">
              <td className="p-2 py-7"><span className="font-semibold">{user.name}<br /></span><span className="italic text-gray-500">{user.email}</span></td>
              <td className="p-2"><RoleBadge accountType={user.accountType} /></td>
              <td className="p-2"><span className={`rounded-full px-3 py-2 text-xs font-bold ${user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{user.status === "ACTIVE" ? "Active" : "Restricted"}</span></td>
              <td className="p-2 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="p-2 text-gray-500">{user.lastActivityAt ? getTimeAgo(user.lastActivityAt) : "Never"}</td>
              <td className="p-2 text-center">{user.kind === "GUEST" ? `${user.tryOns ?? 0} try-ons` : `${user.twinsCreated ?? 0} twins`}</td>
              <td className="p-2">{user.restrictable ? <button type="button" disabled={pendingId !== null} onClick={() => void changeRestriction(user)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-40 ${user.status === "ACTIVE" ? "border-red-200 text-red-700 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}>{user.status === "ACTIVE" ? <Ban size={16} /> : <RotateCcw size={16} />}{pendingId === user.id ? "Updating…" : user.status === "ACTIVE" ? "Restrict" : "Activate"}</button> : <span className="text-sm text-gray-500">Protected role</span>}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
