// Server-owned mode selection. Vercel deployments must never expose local CRUD.
// This module also runs in Prisma CLI config, so it does not import server-only.
export function isReadOnlyDemo() {
  return process.env.VERCEL === "1" || process.env.APPLYFLOW_DEMO === "1";
}

export function readOnlyResponse() {
  return Response.json(
    { error: "This portfolio demo is read-only. Run ApplyFlow locally to add, edit or delete applications." },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}
