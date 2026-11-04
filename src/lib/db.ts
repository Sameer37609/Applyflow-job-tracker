import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:"))
    throw new Error("Configure a local DATABASE_URL in .env.");
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}
export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
