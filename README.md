# ApplyFlow — Smart Job Application Tracker

A focused workspace for organizing a job search: track applications, keep notes, and understand progress through clear, database-backed analytics.

ApplyFlow is a single-user, local portfolio application. It uses a real SQLite database and preserves records across browser refreshes and server restarts. It is not currently a public multi-user service.

## Features

- Create, view, edit, and delete applications, with deletion confirmation.
- Store company, job title, location, status, date applied, application URL, and notes.
- Search company, role, location, and notes; combine search with status filtering.
- Sort by newest, oldest, company name, or status.
- View saved-record totals, current interviews, offers, and rejections.
- Explore status distribution and six calendar months of application activity.
- Open and edit notes directly from the list.
- Responsive desktop/tablet dashboard and mobile application cards.
- Required-field, date, length, status, and HTTP/HTTPS URL validation on client and server.
- Pending submission guards, success messages, friendly errors, and useful empty states.
- Keyboard-accessible dialogs, visible focus, text status labels, and a monthly chart-data disclosure.

## Screenshot

![ApplyFlow dashboard using labeled fictional demo records](docs/screenshots/dashboard.jpg)

Captured from the actual application with explicitly labeled `[Demo]` records in a separate QA database. No personal application data is included. The screenshot illustrates a sample dataset, not the user's results.

## Technology

| Layer | Implementation |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, TypeScript, Tailwind CSS 4, Lucide React |
| Backend | Next.js Node.js route handlers |
| Database | Prisma ORM 7, SQLite, better-sqlite3 adapter |
| Charts | Lightweight HTML and SVG; no chart library |
| Verification | ESLint, TypeScript, Node test runner, tsx, HTTP integration tests |

The checked-in pnpm lockfile records exact dependency resolutions. Node.js 24 LTS and pnpm 11.25.0 are the supported project toolchain; see `package.json`.

## Local setup

Open a terminal in the repository root after cloning or downloading it. The suggested repository name is `applyflow-job-tracker`.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env
pnpm db:generate
pnpm db:deploy
pnpm dev
```

On macOS/Linux, use `cp .env.example .env` instead of `Copy-Item`. Copy the example only on first setup; preserve an existing `.env`.

Open the printed Local URL, normally **http://127.0.0.1:3000**. `http://localhost:3000` also works when that port is free. Keep the terminal open; Ctrl+C stops the server, and `pnpm dev` restarts it. Default launch scripts bind to loopback because this app has no authentication.

If port 3000 is occupied, Next.js may select another port for development. You can request one explicitly with `pnpm dev --port 3001`; use the URL it prints.

Prisma and SQLite have native setup steps. The pnpm configuration allows the required `better-sqlite3`, Prisma engine, and esbuild scripts. If installation reports blocked scripts or missing native bindings, review those named packages rather than bypassing all package safeguards. Native builds may require vendor build tools if a prebuilt binary is unavailable for your platform. Only the Windows x64 toolchain has been exercised in this audit.

### Environment configuration

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Required, server-only SQLite file location. See the non-secret local example in `.env.example`. |
| `TEST_BASE_URL` | Optional test-runner setting for the local HTTP server under test; not needed by the application. |

No API key or authentication secret is required. Never add `NEXT_PUBLIC_` to a database setting. `.env` files and local databases are excluded from Git; `.env.example` contains configuration guidance, not credentials.

## Database workflow

```powershell
pnpm db:generate
pnpm db:deploy
pnpm db:migrate --name describe_your_change
```

- `db:generate` creates the ignored, typed Prisma client from the schema.
- `db:deploy` applies checked-in migrations. Despite the script name, this command only updates the configured database; it does not publish a website.
- `db:migrate` creates/applies migrations while developing schema changes.
- The migration scripts create a missing SQLite file without clearing existing tables. This avoids the missing-file schema-engine failure observed on the audited Windows environment.
- Do not run `prisma migrate reset` on records you want to keep. Stop the application before taking a simple file-copy backup of SQLite.

Optional fictional development records:

```powershell
pnpm db:seed
```

Seeding is explicit, uses `[Demo]` labels, preserves existing records, avoids duplicate seed IDs, and refuses production mode. The normal app starts empty. Seed records persist until deleted.

## How the application works

The server page reads `JobApplication` rows through Prisma and passes plain data to the dashboard. The browser sends create/update/delete requests to `/api/applications`. Route handlers validate input, write to SQLite, and return confirmed results. React updates the list and metrics after a successful response; refreshing reads the database again.

One database row represents one application. It has a stable ID, required company/job title/status/applied date, optional location/URL/notes, and created/updated timestamps. Duplicate companies are allowed. Applied dates represent calendar days, stored at UTC midnight.

### Analytics definitions

- Status distribution uses each record's **current** status. Percentages are rounded separately and may not sum to exactly 100%.
- Activity groups `appliedDate` into the current calendar month and five preceding months, including zero-count months. The current month is partial. Older records remain in all-time totals.
- Interview conversion is `(current Interview + Offer) / all applications × 100`, rounded to a whole percentage. No records produces a dash.
- This conversion is a current-status proxy, not a historical funnel: past interviews for rejected applications cannot be inferred without status history.
- Analytics use all saved records. Search/status filters affect only the list. Refresh after the month changes to refresh the reporting window.

### Source map

```text
src/app/                     Pages, route handlers, loading and error boundaries
src/components/              Dashboard, application table/form, analytics
src/lib/applications.ts      Shared application types, statuses and date helpers
src/lib/validation.ts        Shared runtime validation
src/lib/db.ts                Server-only Prisma connection
src/lib/application-store.ts Database mapping and reads
src/lib/analytics.ts         Pure calculations, search and sorting
prisma/                      Schema, migrations and optional demo seed
scripts/ensure-database.mjs   Non-destructive local SQLite initialization
tests/                       Validation, analytics and HTTP integration tests
docs/                        Audit results and deployment assessment
```

## Checks

```powershell
pnpm lint
pnpm typecheck
pnpm test:validation
pnpm test:analytics
pnpm build
```

Run `db:generate` before type checking a fresh checkout. To inspect the production build locally, stop the dev server first, then run `pnpm start`. This also binds to loopback.

With a server running, `pnpm test:api` verifies CRUD and validation. It creates/removes only its own disposable record. Set `TEST_BASE_URL` if the server uses a different local port.

### Isolated database integration tests

Use a new disposable database filename, not your personal database. In terminal A:

```powershell
$env:DATABASE_URL = "file:./prisma/qa.db"
pnpm db:deploy
pnpm build
pnpm start --port 3001
```

In terminal B, also at the repository root:

```powershell
$env:TEST_BASE_URL = "http://127.0.0.1:3001"
pnpm test:api
pnpm test:analytics-api
```

The analytics integration test requires an empty database, inserts known records, verifies calculations, and cleans up its fixtures. Stop the test server and close the test terminals afterward so temporary environment settings do not affect normal development. A populated test database must be handled intentionally; the test will not clear it for you.

For macOS/Linux, set equivalent shell environment variables before the commands. No hosted service is contacted by the application's tests, except the package registry when installing tools.

### Manual acceptance checklist

1. Add an application; refresh and restart the server to confirm persistence.
2. Edit its status, notes, and URL. Confirm the list and analytics update.
3. Combine a notes/company search with a status filter and exercise all sorting options.
4. Cancel deletion, then confirm deletion; verify the record stays removed after refresh.
5. Try blank/whitespace names, an impossible/future date, and a non-HTTP URL.
6. Stop the server while a form is open; submission should retain the form and show a friendly error.
7. Check mobile cards, Tab/Shift+Tab/Escape, and the monthly chart-data disclosure.

See [the Phase 4A audit](docs/AUDIT-PHASE4A.md) for checks actually performed, findings, and verification limits.

## GitHub and deployment status

Suggested repository name: **applyflow-job-tracker**. Local preparation is not publication. No remote repository, push, visibility change, hosted database, or deployment is performed by the application scripts.

The current local-file SQLite version is **not ready for reliable Vercel persistence**. See [deployment readiness](docs/DEPLOYMENT.md) for the recommended path, required changes, environment names, and approval gates.

## Limitations and possible next steps

- Single-user, local-only application; no accounts, authentication or authorization. Do not expose personal records through a public writable deployment.
- SQLite requires persistent writable disk and has limited concurrent writes. Independent serverless instances do not share a durable local file.
- No status history, reminders, attachments, email integrations, live cross-tab synchronization, pagination, or AI features.
- All saved rows are loaded into memory; server-side aggregation/pagination may help larger datasets.
- Keyboard/responsive checks are not a claim of complete WCAG conformance or cross-browser coverage.
- The audit documents a remaining moderate development-tooling dependency advisory.
- Future work could add a production database, access control, status history, and broader automated browser/accessibility testing. None is implemented or promised by this README.

No license has been selected yet. Choose one explicitly before presenting the repository as licensed open source.
