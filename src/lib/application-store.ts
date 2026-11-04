import "server-only";
import { db } from "./db";
import type { JobApplication } from "@/generated/prisma/client";
import type { Application, ApplicationInput } from "./applications";

const statusToDatabase = {
  Applied: "APPLIED",
  "In review": "IN_REVIEW",
  Interview: "INTERVIEW",
  Offer: "OFFER",
  Rejected: "REJECTED",
} as const;
const statusToLabel = {
  APPLIED: "Applied",
  IN_REVIEW: "In review",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
} as const;
export function serializeApplication(row: JobApplication): Application {
  return {
    id: row.id,
    company: row.companyName,
    role: row.jobTitle,
    location: row.location ?? "",
    status: statusToLabel[row.status],
    date: row.appliedDate.toISOString().slice(0, 10),
    applicationUrl: row.applicationUrl ?? "",
    notes: row.notes ?? "",
  };
}
export function toDatabase(input: ApplicationInput) {
  return {
    companyName: input.company,
    jobTitle: input.role,
    location: input.location || null,
    status: statusToDatabase[input.status],
    appliedDate: new Date(`${input.date}T00:00:00Z`),
    applicationUrl: input.applicationUrl || null,
    notes: input.notes || null,
  };
}
export async function listApplications() {
  return (
    await db.jobApplication.findMany({
      orderBy: [{ appliedDate: "desc" }, { createdAt: "desc" }],
    })
  ).map(serializeApplication);
}
