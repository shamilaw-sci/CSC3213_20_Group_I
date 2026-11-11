
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { loadEnvConfig } from "@next/env";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma/client";

// Load environment variables from .env
loadEnvConfig(process.cwd());

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const databaseUrl = new URL(connectionString);

  const databaseName = decodeURIComponent(
    databaseUrl.pathname.replace(/^\//, ""),
  );

  if (!databaseName) {
    throw new Error("DATABASE_URL must include a database name.");
  }

  const adapter = new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: databaseUrl.port
      ? Number.parseInt(databaseUrl.port, 10)
      : 3306,
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseName,
    connectionLimit: 5,
  });

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env.",
    );
  }

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    throw new Error(
      "ADMIN_PASSWORD needs 8+ characters, an uppercase letter, and a number.",
    );
  }

  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { userEmail: email },

    create: {
      userId: randomUUID(),
      userName: name,
      userEmail: email,
      passwordHash,
      role: "ADMIN",
      updatedAt: now,
    },

    update: {
      userName: name,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      deletedAt: null,
      updatedAt: now,
    },
  });

  console.log("TryVora admin account is ready.");
}

main()
  .catch((error) => {
    console.error("Admin seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
