import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../server/db/prisma";

async function main() {
  const name = process.env.ADMIN_NAME; const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(); const password = process.env.ADMIN_PASSWORD;
  if (!name || !email || !password) throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env.");
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) throw new Error("ADMIN_PASSWORD needs 8+ characters, an uppercase letter, and a number.");
  const now = new Date();
  await prisma.user.upsert({ where: { userEmail: email }, create: { userId: randomUUID(), userName: name, userEmail: email, passwordHash: await bcrypt.hash(password, 12), role: "ADMIN", updatedAt: now }, update: { userName: name, passwordHash: await bcrypt.hash(password, 12), role: "ADMIN", status: "ACTIVE", deletedAt: null, updatedAt: now } });
  console.log("TryVora admin account is ready.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
