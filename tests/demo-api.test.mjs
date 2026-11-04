import { test } from "node:test";
import assert from "node:assert/strict";

test("public demo reads fictional data and rejects all supported write routes", async () => {
  const base = process.env.TEST_BASE_URL;
  assert.ok(base, "Set TEST_BASE_URL to a read-only demo server.");
  const endpoint = `${base}/api/applications`;
  const initial = await fetch(endpoint);
  assert.equal(initial.status, 200);
  const rows = await initial.json();
  assert.equal(rows.length, 8);
  assert.ok(rows.every(row => row.company.startsWith("[Demo]")));
  for (const [method, path] of [["POST", ""], ["PATCH", `/${rows[0].id}`], ["DELETE", `/${rows[0].id}`], ["PATCH", "/unknown"], ["DELETE", "/unknown"]]) {
    for (const origin of [new URL(base).origin, "https://unrelated.example"]) {
      const response = await fetch(endpoint + path, {
        method,
        headers: { "Content-Type": "application/json", Origin: origin },
        ...(method !== "DELETE" ? { body: "{" } : {}),
      });
      assert.equal(response.status, 403, `${method} ${path}`);
      assert.match((await response.json()).error, /read-only/);
    }
  }
  assert.deepEqual(await (await fetch(endpoint)).json(), rows);
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Read-only portfolio demo/);
});
