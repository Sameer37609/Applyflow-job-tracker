import { statuses, type Application, type Status } from "./applications";

export type SortOrder = "newest" | "oldest" | "company" | "status";
export const sortLabels: Record<SortOrder, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  company: "Company A–Z",
  status: "Status order",
};

export function filterApplications(
  applications: Application[],
  query: string,
  status: Status | "All",
  interviewsOnly: boolean,
  sort: SortOrder,
) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return applications
    .filter((row) => {
      const text =
        `${row.company} ${row.role} ${row.location} ${row.notes}`.toLocaleLowerCase();
      return (
        (!interviewsOnly || row.status === "Interview") &&
        (status === "All" || row.status === status) &&
        words.every((word) => text.includes(word))
      );
    })
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (sort === "oldest") return -byDate || a.id.localeCompare(b.id);
      if (sort === "company")
        return (
          a.company.localeCompare(b.company, "en", { sensitivity: "base" }) ||
          byDate ||
          a.id.localeCompare(b.id)
        );
      if (sort === "status")
        return (
          statuses.indexOf(a.status) - statuses.indexOf(b.status) ||
          byDate ||
          a.id.localeCompare(b.id)
        );
      return byDate || a.id.localeCompare(b.id);
    });
}

// Use calendar months in UTC so chart buckets match the applied-date field.
export function getAnalytics(applications: Application[], endDate: string) {
  const counts = Object.fromEntries(
    statuses.map((status) => [status, 0]),
  ) as Record<Status, number>;
  for (const row of applications) counts[row.status]++;
  const end = new Date(`${endDate}T00:00:00Z`);
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 5 + index, 1),
    );
    return {
      key: date.toISOString().slice(0, 7),
      label: new Intl.DateTimeFormat("en", {
        month: "short",
        timeZone: "UTC",
      }).format(date),
      fullLabel: new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date),
      count: 0,
    };
  });
  for (const row of applications) {
    const month = months.find((month) => month.key === row.date.slice(0, 7));
    if (month) month.count++;
  }
  const total = applications.length;
  const progressed = counts.Interview + counts.Offer;
  return {
    total,
    counts,
    months,
    progressed,
    conversion: total ? Math.round((progressed / total) * 100) : null,
    periodTotal: months.reduce((sum, month) => sum + month.count, 0),
  };
}
