export const statuses = [
  "Applied",
  "In review",
  "Interview",
  "Offer",
  "Rejected",
] as const;
export type Status = (typeof statuses)[number];
export type Application = {
  id: string;
  company: string;
  role: string;
  status: Status;
  date: string;
  location: string;
  notes: string;
  applicationUrl: string;
};
export type ApplicationInput = Omit<Application, "id">;
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
export function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
