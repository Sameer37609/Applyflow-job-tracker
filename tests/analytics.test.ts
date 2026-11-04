import { test } from "node:test";
import assert from "node:assert/strict";
import { getAnalytics, filterApplications } from "../src/lib/analytics";
import type { Application } from "../src/lib/applications";
const rows: Application[] = [
  {
    id: "1",
    company: "Zeta",
    role: "Engineer",
    status: "Applied",
    date: "2026-06-01",
    notes: "Prepare React examples",
    location: "Remote",
    applicationUrl: "",
  },
  {
    id: "2",
    company: "Acme",
    role: "Designer",
    status: "In review",
    date: "2026-09-08",
    notes: "",
    location: "London",
    applicationUrl: "",
  },
  {
    id: "3",
    company: "Beta",
    role: "Engineer",
    status: "Interview",
    date: "2026-11-01",
    notes: "Portfolio review",
    location: "Remote",
    applicationUrl: "",
  },
  {
    id: "4",
    company: "Delta",
    role: "Engineer",
    status: "Offer",
    date: "2026-11-01",
    notes: "",
    location: "Remote",
    applicationUrl: "",
  },
  {
    id: "5",
    company: "Echo",
    role: "Engineer",
    status: "Rejected",
    date: "2026-05-01",
    notes: "",
    location: "",
    applicationUrl: "",
  },
];
test("empty analytics has no invented rate or counts", () => {
  const report = getAnalytics([], "2026-11-03");
  assert.equal(report.total, 0);
  assert.equal(report.conversion, null);
  assert.equal(report.periodTotal, 0);
  assert.ok(report.months.every((month) => month.count === 0));
});
test("real counts, conversion and six calendar-month buckets", () => {
  const report = getAnalytics(rows, "2026-11-03");
  assert.equal(report.total, 5);
  assert.deepEqual(Object.values(report.counts), [1, 1, 1, 1, 1]);
  assert.equal(report.conversion, 40);
  assert.equal(report.periodTotal, 4);
  assert.deepEqual(
    report.months.map((month) => month.count),
    [1, 0, 0, 1, 0, 2],
  );
});
test("year boundary includes empty months and excludes older dates", () => {
  const report = getAnalytics(rows, "2027-01-01");
  assert.deepEqual(
    report.months.map((month) => month.key),
    ["2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01"],
  );
  assert.equal(report.periodTotal, 3);
});
test("all-old data keeps all-time totals but has an empty trend", () => {
  const report = getAnalytics(rows, "2028-01-01");
  assert.equal(report.total, 5);
  assert.equal(report.periodTotal, 0);
});
test("search includes notes, handles word order, and composes with status", () => {
  assert.deepEqual(
    filterApplications(rows, "react zeta", "Applied", false, "newest").map(
      (row) => row.id,
    ),
    ["1"],
  );
  assert.equal(
    filterApplications(rows, "react", "Offer", false, "newest").length,
    0,
  );
  assert.equal(
    filterApplications(rows, "  REMOTE  engineer ", "All", true, "newest")[0]
      .id,
    "3",
  );
  assert.equal(filterApplications(rows, " ", "All", false, "newest").length, 5);
});
test("all sort modes are deterministic and do not mutate input", () => {
  assert.deepEqual(
    filterApplications(rows, "", "All", false, "newest").map((row) => row.id),
    ["3", "4", "2", "1", "5"],
  );
  assert.equal(filterApplications(rows, "", "All", false, "oldest")[0].id, "5");
  assert.deepEqual(
    filterApplications(rows, "", "All", false, "company").map(
      (row) => row.company,
    ),
    ["Acme", "Beta", "Delta", "Echo", "Zeta"],
  );
  assert.deepEqual(
    filterApplications(rows, "", "All", false, "status").map(
      (row) => row.status,
    ),
    ["Applied", "In review", "Interview", "Offer", "Rejected"],
  );
  assert.equal(rows[0].id, "1");
});
