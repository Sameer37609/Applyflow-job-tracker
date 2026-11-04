import { demoApplications } from "../../prisma/demo-data";
import type { Application } from "./applications";

// Fictional examples only. Relative dates keep the six-month demo chart useful.
// These are never loaded from, or written to, the user's local database.
export function getDemoApplications(today: string): Application[] {
  const offsets = [2, 7, 18, 35, 49, 66, 95, 130];
  return demoApplications.map((row, index) => {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - offsets[index]);
    return {
      ...row,
      id: `demo-${row.id}`,
      company: `[Demo] ${row.company}`,
      date: date.toISOString().slice(0, 10),
      applicationUrl: "",
      notes: `Fictional portfolio example. ${row.notes}`.trim(),
    };
  });
}
