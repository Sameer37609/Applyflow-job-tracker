import "dotenv/config";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const url = process.env.DATABASE_URL;
if (!url?.startsWith("file:"))
  throw new Error("Set DATABASE_URL to a local SQLite file in .env.");
const path = resolve(url.slice(5));
mkdirSync(dirname(path), { recursive: true });
// Opening SQLite creates a missing file; it does not clear existing tables or records.
new Database(path).close();
