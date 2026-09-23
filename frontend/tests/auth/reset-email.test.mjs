import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import ts from "typescript";
import { z } from "zod";
import { NextResponse } from "next/server.js";

function load(relative, imports, env = {}) {
  const exports = {}, logs = [];
  const code = ts.transpileModule(fs.readFileSync(new URL(relative, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, {
    exports, URL, Date, process: { env },
    console: { info: text => logs.push(text), error: text => logs.push(text) },
    require(name) {
      if (name === "server-only") return {};
      if (name in imports) return imports[name];
      throw Error(`Unexpected import: ${name}`);
    },
  });
  return { exports, logs };
}
const smtpEnv = {
  NODE_ENV: "production", APP_URL: "https://app.example.test", MAIL_TRANSPORT: "smtp",
  SMTP_HOST: "smtp.example.test", SMTP_USER: "test", SMTP_PASSWORD: "test-only", SMTP_FROM: "reset@example.test",
};

test("SMTP delivery uses configured origin and TLS, never request headers", async () => {
  let options, message;
  const f = load("../../server/auth/reset-email.ts", { nodemailer: { createTransport: opts => {
    options = opts;
    return { sendMail: async value => { message = value; return { accepted: [value.to] }; } };
  } } }, smtpEnv);
  await f.exports.createPasswordResetMailer()("user@example.test", "token&other=value");
  assert.equal(options.host, "smtp.example.test");
  assert.equal(options.port, 587);
  assert.equal(options.requireTLS, true);
  assert.equal(options.secure, false);
  assert.equal(message.to, "user@example.test");
  assert.match(message.text, /https:\/\/app\.example\.test\/reset-password\?token=token%26other%3Dvalue/);
  assert.equal(f.logs.length, 0);
});

test("port 465 defaults to implicit TLS", async () => {
  let options;
  const f = load("../../server/auth/reset-email.ts", { nodemailer: { createTransport: opts => {
    options = opts; return { sendMail: async () => ({ accepted: ["user@example.test"] }) };
  } } }, { ...smtpEnv, SMTP_PORT: "465" });
  await f.exports.createPasswordResetMailer()("user@example.test", "token");
  assert.equal(options.secure, true);
});

test("development console mode does not create an SMTP connection", async () => {
  const f = load("../../server/auth/reset-email.ts", { nodemailer: { createTransport: () => assert.fail("Must not connect") } }, { NODE_ENV: "development" });
  await f.exports.createPasswordResetMailer()("user@example.test", "local-token");
  assert.match(f.logs[0], /http:\/\/localhost:3000\/reset-password\?token=local-token/);
});

test("production rejects console mode, insecure URLs and incomplete SMTP configuration", () => {
  for (const env of [
    { ...smtpEnv, MAIL_TRANSPORT: "console" },
    { ...smtpEnv, APP_URL: "http://app.example.test" },
    { ...smtpEnv, SMTP_PASSWORD: "" },
    { ...smtpEnv, SMTP_PORT: "invalid" },
  ]) {
    const f = load("../../server/auth/reset-email.ts", { nodemailer: { createTransport: () => assert.fail("Must not connect") } }, env);
    assert.throws(() => f.exports.createPasswordResetMailer());
  }
});

test("SMTP rejection is reported as delivery failure", async () => {
  const f = load("../../server/auth/reset-email.ts", { nodemailer: { createTransport: () => ({ sendMail: async () => ({ accepted: [] }) }) } }, smtpEnv);
  await assert.rejects(f.exports.createPasswordResetMailer()("user@example.test", "token"), /not accepted/);
});

function routeFixture({ exists = true, active = true, failDelivery = false, configured = true } = {}) {
  const writes = [], deliveries = [];
  let lookups = 0;
  const tokenModel = {
    updateMany: async args => { writes.push(args); return { count: 1 }; },
    create: async args => { writes.push(args); return args.data; },
  };
  const prisma = {
    user: { findUnique: async () => { lookups++; return exists ? { userId: "user-1", userEmail: "user@example.test", status: active ? "ACTIVE" : "SUSPENDED", deletedAt: null } : null; } },
    passwordresettoken: tokenModel,
    $transaction: callback => callback({ passwordresettoken: tokenModel }),
  };
  const f = load("../../app/api/v1/auth/forgot-password/route.ts", {
    "node:crypto": crypto, "next/server": { NextResponse }, zod: { z },
    "@/server/db/prisma": { prisma },
    "@/server/security/rate-limit": { enforceRateLimit: () => ({ allowed: true }) },
    "@/server/auth/reset-email": { createPasswordResetMailer: () => {
      if (!configured) throw Error("Missing SMTP config");
      return async (email, token) => {
        if (failDelivery) throw Error("SMTP rejected");
        deliveries.push({ email, token });
      };
    } },
  });
  const send = () => f.exports.POST(new Request("https://app.example.test/api/v1/auth/forgot-password", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "user@example.test" }),
  }));
  return { ...f, send, writes, deliveries, lookups: () => lookups };
}

test("forgot-password sends the raw token only to the mailer and stores its hash", async () => {
  const f = routeFixture();
  const response = await f.send();
  assert.equal(response.status, 200);
  assert.equal(f.deliveries.length, 1);
  assert.equal(f.writes[1].data.tokenHash, crypto.createHash("sha256").update(f.deliveries[0].token).digest("hex"));
  assert.equal((await response.json()).token, undefined);
});

test("unknown and inactive accounts receive the same response without mail", async () => {
  const known = await routeFixture().send();
  const expected = await known.json();
  for (const options of [{ exists: false }, { active: false }]) {
    const f = routeFixture(options);
    const response = await f.send();
    assert.deepEqual(await response.json(), expected);
    assert.equal(f.deliveries.length, 0);
    assert.equal(f.writes.length, 0);
  }
});

test("delivery failure invalidates the token without exposing SMTP details", async () => {
  const f = routeFixture({ failDelivery: true });
  const response = await f.send();
  assert.equal(response.status, 200);
  assert.equal(f.writes[2].where.passwordResetTokenId, f.writes[1].data.passwordResetTokenId);
  assert.ok(f.writes[2].data.usedAt);
  assert.doesNotMatch(JSON.stringify(await response.json()), /SMTP/);
  assert.deepEqual(f.logs, ["Password-reset email delivery failed."]);
});

test("missing mail configuration fails before any account lookup", async () => {
  const f = routeFixture({ configured: false });
  assert.equal((await f.send()).status, 503);
  assert.equal(f.lookups(), 0);
});
