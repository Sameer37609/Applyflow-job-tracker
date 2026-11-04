# Deployment readiness — Phase 4A

> Historical assessment of the SQLite CRUD application. Phase 4C now prepares a separate **read-only, database-free demo**; follow [VERCEL-DEMO.md](VERCEL-DEMO.md) for current Vercel settings. The persistence and access-control blockers below still apply to a future hosted writable workspace.

**Status: blocked for public production deployment. No deployment or database switch has been performed.**

## What exists today

The application uses Next.js Node.js route handlers, Prisma 7, and `@prisma/adapter-better-sqlite3`. Both `src/lib/db.ts` and `prisma.config.ts` require a `file:` URL. Migration scripts first open a local SQLite file. These are deliberate local-development choices, not a hosted database integration.

Default dev/start scripts bind to 127.0.0.1. This reduces accidental LAN exposure of an unauthenticated local workspace. It is not authentication and is not a production access-control strategy.

## Vercel assessment

The Next.js framework is an appropriate Vercel workload, but **this app cannot provide reliable persistence on Vercel as currently configured**. Vercel Functions do not provide durable shared local-file storage for SQLite across requests/instances/deployments. Uploading `dev.db`, writing to `/tmp`, or merely changing a URL does not solve that architecture mismatch. Database files must stay out of Git.

Source: [Vercel: Is SQLite supported?](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel).

## Recommended next architecture (requires approval)

For a conventional Next.js portfolio deployment, the recommended path is **Vercel + hosted PostgreSQL**, with Prisma Postgres as a straightforward supported option through Vercel Marketplace. This is a recommendation, not a service provisioning action. Costs, ownership, region and the provider's current terms must be reviewed before connecting anything.

An alternative that retains local SQLite is a single Node server/container with a persistent volume and backups. That still needs an access-control decision and operational ownership; it is not the current Vercel serverless setup.

## Required code and database changes

These are planned steps only:

1. Decide whether the hosted product is a personal authenticated workspace or an explicitly disposable public demo. A public URL with the current API would let visitors read/change the same records. Origin validation does not replace authentication or authorization.
2. Approve a database provider, region, account and any spending limit. Back up local SQLite before any transfer.
3. Change Prisma's datasource provider to PostgreSQL and replace the SQLite adapter with the PostgreSQL adapter (`@prisma/adapter-pg`) using the chosen provider's supported configuration. Remove the SQLite-only URL guards and local-file initialization from production migration commands.
4. Create/review PostgreSQL migrations for the existing model. The checked-in SQLite SQL migration is not a PostgreSQL migration history and must not simply be replayed unchanged. Keep the SQLite backup/history available; do not reset the user's database.
5. Decide whether to import local records or start with a separate empty production database. Migrations create schema; they do not move SQLite records automatically. Verify row counts, statuses, dates, notes and rollback/backup procedures if importing.
6. Configure server-only environment values in separate development/preview/production environments. Test preview against a non-production database.
7. On the approved deployment pipeline, generate the Prisma client, apply reviewed production migrations with the installed Prisma 7 command `prisma migrate deploy`, and build Next.js. Do not use `migrate dev` or `migrate reset` against production. The current `pnpm db:deploy` wrapper must first be adapted because it is SQLite-specific.
8. Smoke-test CRUD, access controls, cold starts, connection handling, persistence, errors and rollback against the hosted environment before declaring it production-ready.

## Environment names

Current local application: `DATABASE_URL` only. `TEST_BASE_URL` is a local test-runner setting.

For a future Prisma Postgres/Vercel integration, current documentation provides a direct `DATABASE_URL` and a pooled `DATABASE_URL_POOLED`. Runtime application traffic should use the pooled connection when supplied, while Prisma CLI migrations use the direct connection. Wire these explicitly during the approved migration; the current SQLite code does not support them. Some providers use different names, so finalize the contract after selecting the provider. Never prefix credentials with `NEXT_PUBLIC_`, include them in screenshots, or commit downloaded environment files.

Sources: [Prisma Postgres on Vercel](https://www.prisma.io/docs/guides/postgres/vercel), [Prisma 7 migrate deploy](https://www.prisma.io/docs/cli/v7/migrate/deploy).

## Approval gates

Explicit approval is still needed before: creating/publishing a GitHub repository, choosing its visibility and pushing; connecting/provisioning a hosted database; transferring existing records; implementing the chosen production access model; linking/deploying to a hosting project or exposing a public writable demo.

No production database credentials are present in this document. No authentication, database-provider switch, remote repository or hosting resource was created in Phase 4A.
