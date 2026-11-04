import { test } from "node:test";
import assert from "node:assert/strict";
import { isReadOnlyDemo, readOnlyResponse } from "../src/lib/deployment-mode";
import { getDemoApplications } from "../src/lib/demo-applications";
import { getAnalytics } from "../src/lib/analytics";

test("Vercel always enforces demo mode, including an explicit demo flag of zero", () => {
  const originalVercel = process.env.VERCEL;
  const originalDemo = process.env.APPLYFLOW_DEMO;
  try {
    delete process.env.VERCEL;
    delete process.env.APPLYFLOW_DEMO;
    assert.equal(isReadOnlyDemo(), false);
    process.env.APPLYFLOW_DEMO = "1";
    assert.equal(isReadOnlyDemo(), true);
    process.env.APPLYFLOW_DEMO = "0";
    process.env.VERCEL = "1";
    assert.equal(isReadOnlyDemo(), true);
  } finally {
    if (originalVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = originalVercel;
    if (originalDemo === undefined) delete process.env.APPLYFLOW_DEMO;
    else process.env.APPLYFLOW_DEMO = originalDemo;
  }
});

test("demo records are explicitly fictional and drive consistent analytics", () => {
  const rows = getDemoApplications("2026-11-04");
  assert.equal(rows.length, 8);
  assert.ok(rows.every(row => row.company.startsWith("[Demo]") && row.notes.startsWith("Fictional portfolio example.")));
  assert.ok(rows.every(row => row.date <= "2026-11-04" && !row.applicationUrl));
  const analytics = getAnalytics(rows, "2026-11-04");
  assert.equal(analytics.total, 8);
  assert.equal(analytics.counts.Interview, 2);
  assert.equal(analytics.counts.Offer, 1);
  assert.equal(analytics.conversion, 38);
  assert.equal(analytics.periodTotal, 8);
  rows[0].notes = "changed";
  assert.notEqual(getDemoApplications("2026-11-04")[0].notes, "changed");
});

test("blocked mutations provide a clear non-cacheable forbidden response", async () => {
  const response = readOnlyResponse();
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.match((await response.json()).error, /read-only/);
});
