// Run with: node --test tests/auth/admin-user-management.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { z } from "zod";
import { NextResponse } from "next/server.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const actorId = "11111111-1111-4111-8111-111111111111";
const targetId = "22222222-2222-4222-8222-222222222222";

function load(file, imports) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, { exports, Date, URL, process: { env: {} }, require(name) {
    if (name === "server-only") return {};
    if (name in imports) return imports[name];
    throw Error(`Unexpected import: ${name}`);
  } });
  return exports;
}

function fixture({ role = "ADMIN", targetRole = "CUSTOMER", missing = false, conflict = false, auditFailure = false } = {}) {
  const writes = [];
  let transactions = 0;
  const target = missing ? null : { role: targetRole, status: "ACTIVE", deletedAt: null, updatedAt: new Date(0) };
  const authorization = load("server/auth/authorization.ts", {
    "next/server": { NextResponse },
    "@/server/auth/session": { getCurrentSession: async () => role ? { user: { id: actorId, role }, session: {} } : null },
  });
  const tx = {
    user: {
      findUnique: async () => target,
      updateMany: async args => { writes.push({ kind: "user", ...args }); return { count: conflict ? 0 : 1 }; },
    },
    session: { updateMany: async args => { writes.push({ kind: "session", ...args }); return { count: 1 }; } },
    passwordresettoken: { updateMany: async args => { writes.push({ kind: "reset", ...args }); return { count: 1 }; } },
    auditlog: { create: async args => {
      if (auditFailure) throw Error("Audit insert failed");
      writes.push({ kind: "audit", ...args });
    } },
  };
  const prisma = { $transaction: async callback => {
    transactions++;
    return callback(tx);
  } };
  const route = load("app/api/v1/admin/users/[userId]/route.ts", {
    "node:crypto": crypto, "next/server": { NextResponse }, zod: { z },
    "@/server/auth/authorization": authorization, "@/server/db/prisma": { prisma },
  });
  async function send(method = "PATCH", body = { status: "SUSPENDED" }, id = targetId, origin = "https://app.example.test") {
    const request = new Request(`https://app.example.test/api/v1/admin/users/${id}`, {
      method, headers: { origin, "Content-Type": "application/json" },
      ...(method === "PATCH" ? { body: JSON.stringify(body) } : {}),
    });
    return route[method](request, { params: Promise.resolve({ userId: id }) });
  }
  return { send, writes, transactions: () => transactions };
}

for (const role of [null, "CUSTOMER", "MERCHANT"]) {
  test(`${role ?? "anonymous"} cannot mutate users`, async () => {
    const f = fixture({ role });
    assert.equal((await f.send()).status, role ? 403 : 401);
    assert.equal((await f.send("DELETE")).status, role ? 403 : 401);
    assert.equal(f.transactions(), 0);
  });
}

test("rejects cross-origin, invalid IDs, and own-account changes", async () => {
  const f = fixture();
  assert.equal((await f.send("PATCH", {}, targetId, "https://other.example.test")).status, 403);
  assert.equal((await f.send("PATCH", {}, "invalid-id")).status, 400);
  assert.equal((await f.send("DELETE", {}, actorId)).status, 403);
  assert.equal(f.transactions(), 0);
});

test("rejects unsupported fields and statuses", async () => {
  const f = fixture();
  for (const body of [{}, { status: "DELETED" }, { status: "ACTIVE", role: "ADMIN" }]) {
    assert.equal((await f.send("PATCH", body)).status, 400);
  }
  assert.equal(f.transactions(), 0);
});

test("protects admin accounts and reports missing users", async () => {
  const admin = fixture({ targetRole: "ADMIN" });
  assert.equal((await admin.send()).status, 403);
  assert.equal((await admin.send("DELETE")).status, 403);
  assert.equal(admin.writes.length, 0);
  assert.equal((await fixture({ missing: true }).send()).status, 404);
});

test("suspension revokes sessions and reset tokens and writes an audit entry", async () => {
  const f = fixture();
  assert.equal((await f.send()).status, 200);
  assert.deepEqual(f.writes.map(item => item.kind), ["user", "session", "reset", "audit"]);
  assert.equal(f.writes[0].data.status, "SUSPENDED");
  assert.equal(f.writes[0].where.role, "CUSTOMER");
  assert.equal(f.writes[0].where.updatedAt.getTime(), 0);
  assert.equal(f.writes[1].where.userId, targetId);
  assert.equal(f.writes[3].data.adminId, actorId);
  assert.equal(f.writes[3].data.action, "USER_SUSPENDED");
});

test("deletion marks the account deleted without hard-deleting records", async () => {
  const f = fixture();
  const response = await f.send("DELETE");
  assert.equal(response.status, 200);
  assert.equal(f.writes[0].data.status, "DELETED");
  assert.ok(f.writes[0].data.deletedAt instanceof Date);
  assert.equal(f.writes[3].data.action, "USER_DELETED");
});

test("reactivation does not restore revoked sessions", async () => {
  const f = fixture();
  assert.equal((await f.send("PATCH", { status: "ACTIVE" })).status, 200);
  assert.deepEqual(f.writes.map(item => item.kind), ["user", "audit"]);
});

test("concurrent account changes return conflict without revocation or audit writes", async () => {
  const f = fixture({ conflict: true });
  assert.equal((await f.send()).status, 409);
  assert.deepEqual(f.writes.map(item => item.kind), ["user"]);
});

test("audit failure propagates out of the transaction instead of reporting success", async () => {
  const f = fixture({ auditFailure: true });
  await assert.rejects(f.send(), /Audit insert failed/);
});
