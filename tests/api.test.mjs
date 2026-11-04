import { test } from "node:test";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const input = {
  company: "CRUD test " + Date.now(),
  role: "Engineer",
  status: "Applied",
  date: "2026-01-01",
  location: "Remote",
  notes: "Disposable automated test",
  applicationUrl: "https://example.com/jobs/1",
};
async function call(path = "", method = "GET", body) {
  return fetch(`${base}/api/applications${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: new URL(base).origin,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
test("database-backed CRUD, validation, and missing-record handling", async () => {
  let id;
  try {
    assert.equal(
      (
        await fetch(`${base}/api/applications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await fetch(`${base}/api/applications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://unrelated.example",
          },
          body: JSON.stringify(input),
        })
      ).status,
      403,
    );
    assert.equal(
      (await call("", "POST", { ...input, company: " " })).status,
      400,
    );
    assert.equal(
      (await call("", "POST", { ...input, date: "2026-02-30" })).status,
      400,
    );
    assert.equal(
      (
        await call("", "POST", {
          ...input,
          applicationUrl: "javascript:alert(1)",
        })
      ).status,
      400,
    );
    const created = await call("", "POST", input);
    assert.equal(created.status, 201);
    const row = await created.json();
    id = row.id;
    assert.equal(row.company, input.company);
    const read = await call();
    assert.equal(read.status, 200);
    assert.ok((await read.json()).some((row) => row.id === id));
    const updated = await call(`/${id}`, "PATCH", {
      ...input,
      status: "Offer",
      notes: "Updated",
    });
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).status, "Offer");
    assert.equal((await call(`/${id}`, "DELETE")).status, 204);
    assert.ok(!(await (await call()).json()).some((row) => row.id === id));
    assert.equal((await call(`/${id}`, "DELETE")).status, 404);
    assert.equal((await call(`/${id}`, "PATCH", input)).status, 404);
  } finally {
    if (id) await call(`/${id}`, "DELETE");
  }
});
