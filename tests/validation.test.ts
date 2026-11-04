import { test } from "node:test";
import assert from "node:assert/strict";
import { validateApplication } from "../src/lib/validation";
const valid = {
  company: " Acme ",
  role: "Engineer",
  status: "Applied",
  date: "2026-01-01",
  location: "",
  notes: "",
  applicationUrl: "https://example.com/job",
};
test("accepts and trims valid input", () =>
  assert.equal(validateApplication(valid).data?.company, "Acme"));
test("allows omitted optional fields", () =>
  assert.equal(
    validateApplication({
      company: "Acme",
      role: "Engineer",
      date: "2026-01-01",
      status: "Applied",
    }).data?.applicationUrl,
    "",
  ));
test("rejects missing, oversized and unsupported input", () => {
  for (const input of [
    null,
    [],
    {},
    { ...valid, company: " " },
    { ...valid, role: "" },
    { ...valid, notes: "x".repeat(1001) },
    { ...valid, status: "UNKNOWN" },
    { ...valid, location: 123 },
  ])
    assert.ok(validateApplication(input).error);
});
test("rejects invalid and future dates", () => {
  for (const date of ["2026-02-30", "not-a-date", "2099-01-01", "1899-01-01"])
    assert.ok(validateApplication({ ...valid, date }).error);
});
test("accepts blank URL and rejects unsafe URLs", () => {
  assert.ok(validateApplication({ ...valid, applicationUrl: "" }).data);
  for (const applicationUrl of [
    "javascript:alert(1)",
    "ftp://example.com",
    "bad-url",
    "https://user:password@example.com",
  ])
    assert.ok(validateApplication({ ...valid, applicationUrl }).error);
});
