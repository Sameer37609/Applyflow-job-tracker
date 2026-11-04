# Safe Vercel portfolio demo — Phase 4C preparation

## Deployment model

Use Vercel Hobby with **no database integration**. The hosted application serves eight clearly labeled fictional applications from code. Dates are relative examples so the chart remains useful. Metrics derive from these examples, not from personal activity. Search, filters, sorting, analytics and viewing notes work; changes are unavailable.

The existing local SQLite workspace retains full CRUD. Prisma remains at 7.10.1 and the SQLite schema and migration history are unchanged. `DATABASE_URL` is needed only locally. Do not upload a database or copy your local `.env` into Vercel.

Server safeguards:

- Either `VERCEL=1` or `APPLYFLOW_DEMO=1` enables the read-only mode. Setting the latter to zero cannot override Vercel.
- POST, PATCH and DELETE return 403 before reading a request body or importing the database.
- The page and GET route read fictional examples directly. No database connection is made.
- The database module refuses initialization in demo mode as a second guard.
- Prisma generation uses an unused SQLite URL in demo mode; generation does not create a database. Do not run migrations or seeding during deployment.

This is not authentication. Do not remove these guards to turn the deployment into a writable service.

## Before any deployment

The existing GitHub `main` commit `97cc29712a0c06bc510321bea504e49cc1af4284` and its 46 files were verified through GitHub's API during this preparation. These new demo changes are local and must be reviewed, committed and pushed before Vercel can build them. Nothing was pushed or deployed during preparation.

Review the diff, then use a normal commit/push from the current branch:

```powershell
git status --short
git diff
git add .env.example README.md docs/DEPLOYMENT.md docs/VERCEL-DEMO.md package.json prisma.config.ts src/app/api/applications src/app/page.tsx src/app/globals.css src/components src/lib/db.ts src/lib/demo-applications.ts src/lib/deployment-mode.ts tests/demo.test.ts tests/demo-api.test.mjs
git diff --cached --stat
git commit -m "feat: prepare safe read-only Vercel portfolio demo"
git push origin HEAD:main
```

These commands require your review and normal GitHub authentication. Do not force-push. If the remote has advanced, stop and reconcile history. Check that GitHub shows the new commit and this guide before deploying. Environment files (except `.env.example`), database files, backups, node_modules and generated builds remain ignored.

## Vercel New Project settings

1. Remain on the imported `Sameer37609/Applyflow-job-tracker` New Project screen. Use your personal **Hobby** scope, not a paid team or trial.
2. Choose project name `applyflow-job-tracker` if available; Vercel may require a different unique name. Production branch: `main`.
3. Framework preset: **Next.js**. Root directory: the repository root (`./`).
4. Use **Node.js 24.x**, matching `package.json`. If this setting is available only after project creation, verify the build detects Node 24 from `engines` and check Settings → Build and Deployment before any approved deployment.
5. Build command: `pnpm build` (includes `prisma generate`). Install command: `pnpm install --frozen-lockfile`. Leave Output Directory at the Next.js framework default. Do not set `out` or use a custom start command.
6. Add the following environment variables for **Production and Preview**. If the import screen does not show environment scopes, confirm both scopes in project settings before subsequent deployments:

   | Name | Value | Purpose |
   | --- | --- | --- |
   | `APPLYFLOW_DEMO` | `1` | Explicit safe demo configuration |
   | `ENABLE_EXPERIMENTAL_COREPACK` | `1` | Use `packageManager: pnpm@11.25.0` |

7. Keep Vercel's automatic system environment variables enabled; Vercel supplies `VERCEL=1`. Do not add a database URL, local file path, API key or private value.
8. Choose **no Storage/Marketplace database integration**. No PostgreSQL, SQLite upload, migration, seed, paid add-on or custom domain is needed.
9. **Stop before clicking Create Project or Deploy.** Review the pushed commit, environment settings and Hobby scope, then give explicit approval for publishing the final site. That button can immediately create a public deployment.

After approval, deploy the reviewed commit. Inspect build logs for Node 24, the pinned pnpm installation, successful Prisma generation and Next.js build. A failed deployment is not a working website; diagnose the logs rather than provisioning services to work around it.

Official references: [build settings and Corepack](https://vercel.com/docs/deployments/configure-a-build), [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Costs and limitations

Vercel Hobby is a free tier for personal, non-commercial projects. Usage limits apply; exceeding limits can pause features until their limits reset. This is not an uptime guarantee. Check current terms if the project becomes commercial. No database service is needed, so this design adds no hosted-database bill. Use the included `vercel.app` address; custom domains, upgrades and paid integrations are separate decisions. Do not approve a Pro trial or paid resource for this demo.

Source: [Vercel Hobby documentation](https://vercel.com/docs/plans/hobby). Provider terms and quotas can change.

SQLite local files are not durable shared storage on Vercel Functions. A future hosted writable workspace would need authentication/authorization and a separate durable database. Hosted PostgreSQL is a reasonable next choice, but requires a PostgreSQL adapter, reviewed PostgreSQL migrations (SQLite SQL cannot simply be reused), server-only credentials and isolated preview data. No such migration or provider provisioning is part of this demo.

## Local demo verification

In a new PowerShell terminal:

```powershell
$env:APPLYFLOW_DEMO = "1"
pnpm build
pnpm start --port 3011
```

In another terminal:

```powershell
$env:TEST_BASE_URL = "http://127.0.0.1:3011"
pnpm test:demo-api
```

Close these terminals afterward so demo environment variables do not affect normal SQLite development. To return to local CRUD, use a fresh terminal with your local `.env`, without `VERCEL` or `APPLYFLOW_DEMO` flags.

## Checks actually performed

- PASS: ESLint, TypeScript and production build. Build ran with demo enabled and an empty `DATABASE_URL` environment value.
- PASS: 5 validation tests, 6 analytics/search/sort tests, 3 demo safety/data unit tests.
- PASS: demo HTTP integration test, including ten mutation attempts across valid/unknown IDs, same/foreign origins and malformed bodies. All returned 403; records were unchanged.
- PASS: production demo page and GET route returned HTTP 200 with `VERCEL=1`, `APPLYFLOW_DEMO=0` and an unusable database path. No database directory was created.
- PASS: existing CRUD/validation and analytics HTTP integration suites against an isolated migrated SQLite QA database. Personal records were not used.
- The initial sandbox build failed with a generated-file permission error and initial loopback tests were denied. Both passed when rerun with the required execution permissions.
- NOT TESTED: the actual Vercel Linux build/runtime, public URL, hosted browser interactions, and a new visual/mobile accessibility review. Browser automation was unavailable during this preparation. Existing Phase 4A checks are historical, not a substitute for checking the eventual live demo.

After deployment approval, verify the real URL: banner and eight fictional rows, correct totals (8 applications, 2 interviews, 1 offer, 1 rejection), 38% conversion, search/status/sort, chart data and read-only notes. Check keyboard and mobile layouts. Confirm POST/PATCH/DELETE return 403 and refresh still shows only demo rows. Record the actual URL only after it responds successfully.
