import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function fixture() {
  let now = 0;
  const exports = {};
  const source = fs.readFileSync(new URL("../../server/security/rate-limit.ts", import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, {
    exports, Date: { now: () => now },
    require(name) { if (name !== "server-only") throw Error(`Unexpected import: ${name}`); return {}; },
  });
  return { limit: exports.enforceRateLimit, advance: ms => { now += ms; } };
}
const request = (ip = "192.0.2.1") => new Request("https://app.example.test", {
  headers: ip ? { "x-forwarded-for": ip } : {},
});

test("allows exactly the configured number of requests", () => {
  const f = fixture();
  assert.equal(f.limit(request(), "login", 2, 60_000).allowed, true);
  assert.equal(f.limit(request(), "login", 2, 60_000).allowed, true);
  const denied = f.limit(request(), "login", 2, 60_000);
  assert.equal(denied.allowed, false);
  assert.equal(denied.retryAfter, 60);
});

test("opens a new window at the expiry boundary", () => {
  const f = fixture();
  f.limit(request(), "login", 1, 60_000);
  f.advance(59_999);
  const denied = f.limit(request(), "login", 1, 60_000);
  assert.equal(denied.allowed, false);
  assert.equal(denied.retryAfter, 1);
  f.advance(1);
  const reset = f.limit(request(), "login", 1, 60_000);
  assert.equal(reset.allowed, true);
  assert.equal(reset.retryAfter, 0);
});

test("blocked attempts do not extend the fixed window", () => {
  const f = fixture();
  f.limit(request(), "login", 1, 10_000);
  f.advance(5_000);
  assert.equal(f.limit(request(), "login", 1, 10_000).retryAfter, 5);
  f.advance(5_000);
  assert.equal(f.limit(request(), "login", 1, 10_000).allowed, true);
});

test("keeps independent buckets for each address and endpoint scope", () => {
  const f = fixture();
  f.limit(request(), "login", 1, 60_000);
  assert.equal(f.limit(request(), "login", 1, 60_000).allowed, false);
  assert.equal(f.limit(request("192.0.2.2"), "login", 1, 60_000).allowed, true);
  assert.equal(f.limit(request(), "register", 1, 60_000).allowed, true);
});

test("uses the first forwarded address consistently", () => {
  const f = fixture();
  f.limit(request("192.0.2.1, 192.0.2.2"), "login", 1, 60_000);
  assert.equal(f.limit(request("192.0.2.1"), "login", 1, 60_000).allowed, false);
});

test("falls back to real IP or a shared local bucket", () => {
  const f = fixture();
  const realIp = new Request("https://app.example.test", { headers: { "x-real-ip": "192.0.2.3" } });
  f.limit(realIp, "login", 1, 60_000);
  assert.equal(f.limit(request("192.0.2.3"), "login", 1, 60_000).allowed, false);
  f.limit(request(null), "login", 1, 60_000);
  assert.equal(f.limit(request(null), "login", 1, 60_000).allowed, false);
});
