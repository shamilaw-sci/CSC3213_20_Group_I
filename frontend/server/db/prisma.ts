import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "@/app/generated/prisma/client";

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

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}