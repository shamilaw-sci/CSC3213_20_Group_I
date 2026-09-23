// Run with: node --test tests/auth/guest-session.test.mjs
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
    exports, Date, URL, process: { env: { NODE_ENV: "production" } },
    require(name) {
      if (name === "server-only") return {};
      if (name in imports) return imports[name];
      throw Error(`Unexpected import: ${name}`);
    },
  });
  return exports;
}
const hash = token => crypto.createHash("sha256").update(token).digest("hex");
const request = (origin = "https://app.example.test", body = {}) => new Request("https://app.example.test/api/v1/auth/guest", {
  method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body),
});

function fixture() {
  let token = "guest-secret";
  const row = { guestSessionId: "guest-1", tokenHash: hash(token), expiryDate: new Date(Date.now() + 60_000), convertedAt: null };
  const transfers = [];
  const tx = {
    guestsession: { async updateMany({ where, data }) {
      if (row.convertedAt || row.expiryDate <= where.expiryDate.gt || row.guestSessionId !== where.guestSessionId) return { count: 0 };
      Object.assign(row, data); return { count: 1 };
    } },
  };
  for (const name of ["comparison", "feedback", "tryonsession", "merchantredirect"]) {
    tx[name] = { async updateMany(args) { transfers.push({ name, ...args }); return { count: 1 }; } };
  }
  const prisma = {
    guestsession: { async findUnique({ where }) { return row.tokenHash === where.tokenHash ? structuredClone(row) : null; } },
    async $transaction(callback) { return callback(tx); },
  };
  const guest = load("server/auth/guest.ts", {
    "node:crypto": crypto,
    "next/headers": { cookies: async () => ({ get: () => token ? { value: token } : undefined }) },
    "@/server/db/prisma": { prisma },
  });
  return { guest, row, transfers, setToken: value => { token = value; } };
}

for (const state of ["missing", "unknown", "expired", "converted"]) {
  test(`guest lookup rejects ${state} sessions`, async () => {
    const f = fixture();
    if (state === "missing") f.setToken(null);
    if (state === "unknown") f.setToken("different-secret");
    if (state === "expired") f.row.expiryDate = new Date(0);
    if (state === "converted") f.row.convertedAt = new Date();
    assert.equal(await f.guest.getCurrentGuestSession(), null);
    assert.equal(await f.guest.convertGuestSession("account-1"), false);
    assert.equal(f.transfers.length, 0);
  });
}

test("conversion claims once and transfers only unowned records", async () => {
  const f = fixture();
  const results = await Promise.all([f.guest.convertGuestSession("account-1"), f.guest.convertGuestSession("account-2")]);
  assert.equal(results.filter(Boolean).length, 1);
  assert.equal(f.transfers.length, 4);
  for (const transfer of f.transfers) {
    assert.equal(transfer.where.userId, null);
    assert.equal(transfer.where.guestSessionId, "guest-1");
    assert.equal(transfer.data.userId, f.row.convertedUserId);
    assert.equal(transfer.data.guestSessionId, null);
  }
  assert.equal(await f.guest.convertGuestSession("account-3"), false);
});

function creation({ signedIn = false, existing = null, allowed = true } = {}) {
  let saved;
  const route = load("app/api/v1/auth/guest/route.ts", {
    "node:crypto": crypto, "next/server": { NextResponse },
    "@/server/auth/guest": { GUEST_COOKIE_NAME: "tryvora_guest", GUEST_MAX_AGE: 604800, getCurrentGuestSession: async () => existing, hashGuestToken: hash },
    "@/server/auth/session": { getCurrentSession: async () => signedIn ? {} : null },
    "@/server/db/prisma": { prisma: { guestsession: { create: async ({ data }) => { saved = data; return data; } } } },
    "@/server/security/rate-limit": { enforceRateLimit: () => ({ allowed, retryAfter: 30 }) },
  });
  return { route, saved: () => saved };
}

test("creation stores only a token hash and sets a secure guest cookie", async () => {
  const f = creation();
  const response = await f.route.POST(request());
  assert.equal(response.status, 201);
  const token = response.cookies.get("tryvora_guest").value;
  assert.equal(f.saved().tokenHash, hash(token));
  assert.notEqual(f.saved().tokenHash, token);
  assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(response.headers.get("set-cookie"), /Secure/i);
  assert.match(response.headers.get("set-cookie"), /SameSite=lax/i);
  assert.equal((await response.json()).token, undefined);
});

test("creation reuses an existing guest session", async () => {
  const f = creation({ existing: { guestSessionId: "existing", expiryDate: new Date() } });
  const response = await f.route.POST(request());
  assert.equal(response.status, 200); assert.equal(f.saved(), undefined);
  assert.equal((await response.json()).guest.id, "existing");
});

test("creation rejects signed-in, cross-origin and rate-limited requests", async () => {
  assert.equal((await creation({ signedIn: true }).route.POST(request())).status, 409);
  assert.equal((await creation().route.POST(request("https://other.example.test"))).status, 403);
  assert.equal((await creation({ allowed: false }).route.POST(request())).status, 429);
});

function conversion(access, convert) {
  return load("app/api/v1/auth/guest/convert/route.ts", {
    "next/server": { NextResponse },
    "@/server/auth/authorization": { requireAuthenticatedUser: async () => access },
    "@/server/auth/guest": { GUEST_COOKIE_NAME: "tryvora_guest", convertGuestSession: convert },
    "@/server/security/rate-limit": { enforceRateLimit: () => ({ allowed: true }) },
  });
}

test("conversion requires authentication and ignores destination IDs in request bodies", async () => {
  const denied = conversion({ error: NextResponse.json({}, { status: 401 }) }, () => assert.fail("Must not convert"));
  assert.equal((await denied.POST(request())).status, 401);
  const allowed = conversion({ user: { id: "authenticated-user" } }, async id => { assert.equal(id, "authenticated-user"); return true; });
  const response = await allowed.POST(request(undefined, { userId: "attacker-selected-user" }));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
});

test("conversion failures propagate before the guest cookie can be cleared", async () => {
  const failure = new Error("Database unavailable");
  const route = conversion({ user: { id: "account-1" } }, async () => { throw failure; });
  await assert.rejects(route.POST(request()), error => error === failure);
});
