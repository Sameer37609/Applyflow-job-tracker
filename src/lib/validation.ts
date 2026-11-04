import { statuses, type ApplicationInput, localToday } from "./applications";

export function validateApplication(
  value: unknown,
): { data: ApplicationInput; error?: never } | { error: string; data?: never } {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { error: "Please provide the application details." };
  const input = value as Record<string, unknown>;
  const fields = [
    "company",
    "role",
    "date",
    "status",
    "location",
    "notes",
    "applicationUrl",
  ] as const;
  const optional = new Set(["location", "notes", "applicationUrl"]);
  if (
    fields.some(
      (field) =>
        !(optional.has(field) && input[field] === undefined) &&
        typeof input[field] !== "string",
    )
  )
    return { error: "Application fields must be text." };
  const data = Object.fromEntries(
    fields.map((field) => [field, ((input[field] ?? "") as string).trim()]),
  ) as ApplicationInput;
  if (!data.company || !data.role)
    return {
      error: "Please enter a company and job title. Spaces alone don’t count.",
    };
  if (
    data.company.length > 80 ||
    data.role.length > 100 ||
    data.location.length > 100 ||
    data.notes.length > 1000 ||
    data.applicationUrl.length > 2048
  )
    return { error: "Please shorten the details to the field limits." };
  if (!statuses.includes(data.status))
    return { error: "Choose a valid application status." };
  const date = new Date(`${data.date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== data.date ||
    data.date < "1900-01-01" ||
    data.date > localToday()
  )
    return { error: "Choose a valid application date between 1900 and today." };
  if (data.applicationUrl) {
    try {
      const url = new URL(data.applicationUrl);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error();
    } catch {
      return {
        error:
          "Enter a full http:// or https:// URL without embedded credentials, or leave it blank.",
      };
    }
  }
  return { data };
}
