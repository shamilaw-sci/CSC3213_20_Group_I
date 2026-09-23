// Run with: node --test tests/auth/session-refresh.test.mjs
// Real JWT signing/verification; isolated database and cookie adapters.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function load(file, imports) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, {
    exports, Date, TextEncoder, URL,
    process: { env: { JWT_ACCESS_SECRET: "test-only-secret-012345678901234567890", NODE_ENV: "production" } },
    require(name) {
      if (name === "server-only") return {};
      if (name in imports) return imports[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}

async function fixture() {
  const user = { userId: crypto.randomUUID(), userName: "Test", userEmail: "test@example.test", role: "CUSTOMER", status: "ACTIVE", deletedAt: null };
  let row, cookie;
  const prisma = { session: {
    async create({ data }) { row = { ...data, revokedAt: null, user }; },
    async findUnique({ where }) { return row?.tokenHash === where.tokenHash ? structuredClone(row) : null; },
    async updateMany({ where, data }) {
      if (!row || row.tokenHash !== where.tokenHash || row.revokedAt) return { count: 0 };
      if (where.sessionId && row.sessionId !== where.sessionId) return { count: 0 };
      if (where.expiryDate && row.expiryDate <= where.expiryDate.gt) return { count: 0 };
      if (where.user && (row.user.status !== "ACTIVE" || row.user.deletedAt)) return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    },
  }};
  const sessionModule = load("server/auth/session.ts", {
    "node:crypto": crypto,
    jose: await import("jose"),
    "next/headers": { cookies: async () => ({ get: () => cookie ? { value: cookie } : undefined }) },
    "@/server/db/prisma": { prisma },
  });
  const initial = await sessionModule.createUserSession(user, false);
  cookie = initial.token;
  return { module: sessionModule, initial, row: () => row, setCookie: value => { cookie = value; } };
}

test("rotation invalidates old token and preserves absolute expiry", async () => {
  const f = await fixture();
  const rotated = await f.module.rotateCurrentSession();
  assert.equal(rotated.status, "ok");
  assert.notEqual(rotated.token, f.initial.token);
  assert.equal(rotated.expiryDate.getTime(), f.initial.expiryDate.getTime());
  assert.equal(await f.module.getCurrentSession(), null);
  f.setCookie(rotated.token);
  assert.ok(await f.module.getCurrentSession());
  await f.module.revokeCurrentSession();
  assert.equal(await f.module.getCurrentSession(), null);
});

test("concurrent refresh requests produce exactly one replacement", async () => {
  const f = await fixture();
  const results = await Promise.all([f.module.rotateCurrentSession(), f.module.rotateCurrentSession()]);
  assert.equal(results.filter(result => result.status === "ok").length, 1);
  assert.equal(results.filter(result => result.status !== "ok").length, 1);
});

for (const state of ["missing", "expired", "revoked", "suspended", "deleted", "tampered"]) {
  test(`refresh rejects ${state} sessions`, async () => {
    const f = await fixture();
    if (state === "missing") f.setCookie(undefined);
    if (state === "expired") f.row().expiryDate = new Date(0);
    if (state === "revoked") f.row().revokedAt = new Date();
    if (state === "suspended") f.row().user.status = "SUSPENDED";
    if (state === "deleted") f.row().user.deletedAt = new Date();
    if (state === "tampered") f.setCookie("invalid-token");
    assert.equal((await f.module.rotateCurrentSession()).status, "unauthenticated");
  });
}

function endpoint(result, allowed = true) {
  let calls = 0;
  const route = load("app/api/v1/auth/refresh/route.ts", {
    "next/server": { NextResponse },
    "@/server/auth/session": { AUTH_COOKIE_NAME: "tryvora_session", rotateCurrentSession: async () => { calls++; return result; } },
    "@/server/security/rate-limit": { enforceRateLimit: () => ({ allowed, retryAfter: 30 }) },
  });
  return { route, calls: () => calls };
}
const request = (origin = "https://app.example.test") => new Request("https://app.example.test/api/v1/auth/refresh", {
  method: "POST", headers: origin ? { origin } : {},
});

test("refresh rejects missing or cross-origin requests before rotation", async () => {
  const f = endpoint({ status: "ok" });
  assert.equal((await f.route.POST(request("https://other.example.test"))).status, 403);
  assert.equal((await f.route.POST(request(""))).status, 403);
  assert.equal(f.calls(), 0);
});

test("refresh respects rate limiting", async () => {
  const f = endpoint({ status: "ok" }, false);
  const response = await f.route.POST(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "30");
  assert.equal(f.calls(), 0);
});

test("failed refresh never clears another request's cookie", async () => {
  for (const [status, code] of [["unauthenticated", 401], ["conflict", 409]]) {
    const response = await endpoint({ status }).route.POST(request());
    assert.equal(response.status, code);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("successful refresh sends a secure HttpOnly cookie without exposing token in JSON", async () => {
  const response = await endpoint({ status: "ok", token: "replacement-token", maxAge: 60, expiryDate: new Date(Date.now() + 60_000), user: { id: "test-user" } }).route.POST(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /tryvora_session=replacement-token/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Secure/i);
  assert.match(cookie, /SameSite=lax/i);
  assert.equal((await response.json()).token, undefined);
});
