import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { resolve } from "node:path";
import { isReadOnlyDemo } from "./src/lib/deployment-mode";

// Prisma CLI and the runtime adapter must resolve the same file from the project root.
// Client generation needs a datasource URL but never connects to this file.
// Hosted demo builds do not require or use a database credential.
const databaseUrl = isReadOnlyDemo() ? "file:./prisma/demo-unused.db" : env("DATABASE_URL");
if (!databaseUrl.startsWith("file:"))
  throw new Error("Use a local SQLite file URL.");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: {
    url: `file:${resolve(databaseUrl.slice(5)).replaceAll("\\", "/")}`,
  },
});
