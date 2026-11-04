import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { resolve } from "node:path";

// Prisma CLI and the runtime adapter must resolve the same file from the project root.
const databaseUrl = env("DATABASE_URL");
if (!databaseUrl.startsWith("file:"))
  throw new Error("Use a local SQLite file URL.");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: {
    url: `file:${resolve(databaseUrl.slice(5)).replaceAll("\\", "/")}`,
  },
});
