import { test } from "node:test";
import assert from "node:assert/strict";
import { getAnalytics } from "../src/lib/analytics";
import { statuses, type Application } from "../src/lib/applications";
const base = process.env.TEST_BASE_URL;
test("analytics calculated from real records in an isolated database", async () => {
  assert.ok(base, "Set TEST_BASE_URL to the separate empty test server.");
  const endpoint = `${base}/api/applications`;
  const ids: string[] = [];
  const read = async () => {
    const response = await fetch(endpoint);
    assert.equal(response.status, 200);
    return (await response.json()) as Application[];
  };
  assert.equal(
    (await read()).length,
    0,
    "Use an empty disposable test database.",
  );
  try {
    for (const [index, status] of statuses.entries()) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: `[Test] Analytics ${status}`,
          role: "Engineer",
          status,
          date: [
            "2026-06-01",
            "2026-09-08",
            "2026-11-01",
            "2026-11-01",
            "2026-05-01",
          ][index],
          notes: "Disposable analytics fixture",
        }),
      });
      assert.equal(response.status, 201);
      ids.push((await response.json()).id);
    }
    const report = getAnalytics(await read(), "2026-11-03");
    assert.equal(report.total, 5);
    assert.equal(report.conversion, 40);
    assert.equal(report.periodTotal, 4);
    assert.deepEqual(Object.values(report.counts), [1, 1, 1, 1, 1]);
    const response = await fetch(`${endpoint}/${ids[0]}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: "[Test] Analytics Applied",
        role: "Engineer",
        status: "Interview",
        date: "2026-06-01",
        notes: "Updated",
      }),
    });
    assert.equal(response.status, 200);
    assert.equal(getAnalytics(await read(), "2026-11-03").conversion, 60);
  } finally {
    for (const id of ids)
      await fetch(`${endpoint}/${id}`, { method: "DELETE" });
  }
  assert.equal((await read()).length, 0);
});
