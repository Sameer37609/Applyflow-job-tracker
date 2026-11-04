import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { demoApplications } from "./demo-data";

if (process.env.NODE_ENV === "production")
  throw new Error("Demo seeding is development-only.");
const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});
const status = {
  Applied: "APPLIED",
  "In review": "IN_REVIEW",
  Interview: "INTERVIEW",
  Offer: "OFFER",
  Rejected: "REJECTED",
} as const;
try {
  for (const row of demoApplications) {
    await db.jobApplication.upsert({
      where: { id: `demo-${row.id}` },
      update: {},
      create: {
        id: `demo-${row.id}`,
        companyName: `[Demo] ${row.company}`,
        jobTitle: row.role,
        location: row.location,
        status: status[row.status],
        appliedDate: new Date(`${row.date}T00:00:00Z`),
        notes: `Fictional development example. ${row.notes}`,
      },
    });
  }
  console.log(
    "Added optional [Demo] examples. Existing records were preserved.",
  );
} finally {
  await db.$disconnect();
}
