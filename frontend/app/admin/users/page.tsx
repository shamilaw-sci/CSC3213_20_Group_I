"use client";

import { Trash, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "MERCHANT" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
  lastLoginAt: string | null;
  twinsCreated: number;
};

const roleLabels = { CUSTOMER: "Customer", MERCHANT: "Merchant", ADMIN: "Admin" };

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

export default function Userpage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function loadUsers() {
      try {
        const response = await fetch("/api/v1/admin/users", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.message ?? "Could not load users.");
        }
        const body: { users: UserRecord[] } = await response.json();
        if (!Array.isArray(body.users)) throw new Error("Invalid user-list response.");
        if (!controller.signal.aborted) setUsers(body.users);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Could not load users.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadUsers();
    return () => controller.abort();
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <h1 className="text-3xl font-bold mb-5">User Details</h1>
      {error && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}
      <div className="overflow-x-auto">
        <table aria-busy={loading} className="w-full border-collapse text-left mt-4 p-5 border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left text-sm text-gray-600 uppercase">
              <th scope="col" className="p-2">User</th>
              <th scope="col" className="p-2">Role</th>
              <th scope="col" className="p-2">Joined</th>
              <th scope="col" className="p-2">Last Login</th>
              <th scope="col" className="p-2">Twins Created</th>
              <th scope="col" className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-4" role="status">Loading users...</td></tr>}
            {!loading && !error && users.length === 0 && (
              <tr><td colSpan={6} className="p-4">No users found.</td></tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-100">
                <td className="p-2 py-7">
                  <span className="font-semibold">{user.name}<br /></span>
                  <span className="italic text-gray-500">{user.email}</span>
                </td>
                <td className="p-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-4 rounded-xl shadow-xs text-xs font-semibold ${user.role === "CUSTOMER" ? "bg-red-100 text-green-900" : "bg-yellow-100 text-yellow-900"}`}>
                    <UserCheck size={16} />{roleLabels[user.role]}
                  </span>
                </td>
                <td className="p-2 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-2 text-gray-500">{user.lastLoginAt ? getTimeAgo(user.lastLoginAt) : "Never"}</td>
                <td className="p-2 text-center">{user.twinsCreated}</td>
                <td className="p-2">
                  <span title="User deletion is not available yet">
                    <button type="button" disabled aria-label={`Delete ${user.name} (unavailable)`} className="p-3 rounded-md opacity-40 cursor-not-allowed">
                      <Trash size={16} />
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
