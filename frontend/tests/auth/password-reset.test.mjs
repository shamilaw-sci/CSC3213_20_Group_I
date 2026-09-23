import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import ts from "typescript";
import { z } from "zod";
import { NextResponse } from "next/server.js";

const token = "test-reset-token-with-enough-characters";
const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

function fixture({ missing = false, expired = false, used = false, status = "ACTIVE", deleted = false, allowed = true, expireDuringHash = false, failRevocation = false } = {}) {
  let state = {
    record: { passwordResetTokenId: "reset-1", userId: "user-1", tokenHash, usedAt: used ? new Date() : null, expiryDate: new Date(expired ? 0 : Date.now() + 60_000) },
    user: { status, deletedAt: deleted ? new Date() : null, passwordHash: "old-hash" },
    revoked: false, otherTokensUsed: false,
  };
  let transactionQueue = Promise.resolve();
  let hashes = 0;
  const tx = {
    passwordresettoken: { updateMany: async ({ where, data }) => {
      if (where.passwordResetTokenId) {
        if (state.record.usedAt || state.record.expiryDate <= where.expiryDate.gt || state.record.tokenHash !== where.tokenHash) return { count: 0 };
        state.record.usedAt = data.usedAt;
      } else {
        assert.equal(where.userId, "user-1");
        state.otherTokensUsed = true;
      }
      return { count: 1 };
    } },
    user: { updateMany: async ({ where, data }) => {
      assert.equal(where.userId, "user-1");
      if (state.user.status !== where.status || state.user.deletedAt) return { count: 0 };
      state.user.passwordHash = data.passwordHash;
      return { count: 1 };
    } },
    session: { updateMany: async ({ where }) => {
      assert.equal(where.userId, "user-1");
      assert.equal(where.revokedAt, null);
      if (failRevocation) throw Error("Session write failed");
      state.revoked = true;
      return { count: 1 };
    } },
  };
  const prisma = {
    passwordresettoken: { findUnique: async ({ where }) => missing || where.tokenHash !== tokenHash ? null : structuredClone(state.record) },
    $transaction(callback) {
      const result = transactionQueue.then(async () => {
        const before = structuredClone(state);
        try { return await callback(tx); } catch (error) { state = before; throw error; }
      });
      transactionQueue = result.catch(() => {});
      return result;
    },
  };
  const imports = {
    "node:crypto": crypto, "next/server": { NextResponse }, zod: { z },
    bcrypt: { hash: async (password, cost) => {
      hashes++; assert.equal(cost, 12);
      if (expireDuringHash) state.record.expiryDate = new Date(0);
      return `hashed:${password}`;
    } },
    "@/server/db/prisma": { prisma },
    "@/server/security/rate-limit": { enforceRateLimit: () => ({ allowed, retryAfter: 30 }) },
  };
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(new URL("../../app/api/v1/auth/reset-password/route.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { exports, Date, require(name) {
    if (name in imports) return imports[name];
    throw Error(`Unexpected import: ${name}`);
  } });
  const send = (body = { token, password: "NewPassword1" }) => exports.POST(new Request("https://app.example.test/api/v1/auth/reset-password", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  }));
  return { send, state: () => state, hashes: () => hashes };
}

test("reset hashes the password, consumes tokens and revokes sessions", async () => {
  const f = fixture();
  assert.equal((await f.send()).status, 200);
  assert.equal(f.state().user.passwordHash, "hashed:NewPassword1");
  assert.ok(f.state().record.usedAt);
  assert.equal(f.state().otherTokensUsed, true);
  assert.equal(f.state().revoked, true);
  assert.equal((await f.send()).status, 400);
});

test("two simultaneous uses of the same token produce one success", async () => {
  const f = fixture();
  const responses = await Promise.all([f.send(), f.send()]);
  assert.deepEqual(responses.map(response => response.status).sort(), [200, 400]);
});

for (const option of ["missing", "expired", "used"]) {
  test(`rejects ${option} reset tokens before hashing`, async () => {
    const f = fixture({ [option]: true });
    assert.equal((await f.send()).status, 400);
    assert.equal(f.hashes(), 0);
    assert.equal(f.state().user.passwordHash, "old-hash");
  });
}

for (const options of [{ status: "SUSPENDED" }, { status: "DELETED" }, { deleted: true }]) {
  test(`rejects unavailable account ${JSON.stringify(options)}`, async () => {
    const f = fixture(options);
    assert.equal((await f.send()).status, 400);
    assert.equal(f.state().user.passwordHash, "old-hash");
    assert.equal(f.state().record.usedAt, null);
  });
}

test("rechecks expiry after password hashing", async () => {
  const f = fixture({ expireDuringHash: true });
  assert.equal((await f.send()).status, 400);
  assert.equal(f.state().user.passwordHash, "old-hash");
});

test("transaction failure propagates instead of reporting a successful reset", async () => {
  const f = fixture({ failRevocation: true });
  await assert.rejects(f.send(), /Session write failed/);
  assert.equal(f.state().user.passwordHash, "old-hash");
  assert.equal(f.state().record.usedAt, null);
});

test("validates password and applies the request limit", async () => {
  const f = fixture();
  assert.equal((await f.send({ token, password: "weak" })).status, 400);
  assert.equal(f.hashes(), 0);
  const limited = fixture({ allowed: false });
  const response = await limited.send();
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "30");
  assert.equal(limited.hashes(), 0);
});
