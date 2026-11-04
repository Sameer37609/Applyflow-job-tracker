# Phase 2 verification — November 3, 2026

Environment: Windows x64, Node 24.22.1, Next.js 16.4.4, Prisma 7.10.1, SQLite through better-sqlite3 12.11.1.

## Passed

- Before changes: browser add, edit, delete, company search and combined status filtering in Phase 1.
- Prisma schema validation, client generation and migration creation/application (`20261103175941_init`).
- Fresh migration deployment and migration-status check on a separate disposable SQLite file.
- TypeScript, ESLint (zero warnings), production build with dynamic database-backed page and API routes.
- Five validation tests: trimming, optional fields, malformed/oversized input, unsupported statuses, invalid/future dates and unsafe URLs.
- HTTP integration test: create (201), list (200), update (200), delete (204), missing-record update/delete (404), malformed JSON/invalid data (400), cross-origin write rejection (403).
- Browser empty state, create, edit, URL persistence, KPI updates, search/status combination and filtered empty state.
- Saved application, edited status and URL survived browser refresh and a full development-server restart.
- Browser delete cancellation preserved its record; confirmed deletion removed it and a later refresh showed the empty database.
- Rapid double-click of Add created one row. Pending mutation guards and disabled controls are implemented.
- Stopped-server submission displayed a friendly network error and retained the form fields.
- Escape dismissed the form and restored focus to its opener.
- Desktop visual review at 1440px; mobile at 390px had no page-level horizontal overflow.
- Optional seed run twice against the separate test database produced eight labeled examples, without duplicates. The normal application database was not seeded.

## Failures encountered and resolved

- pnpm package downloads repeatedly failed; dependencies were installed using a temporary npm launcher, then the canonical pnpm lockfile was synchronized.
- npm 12 blocked package install scripts; the official SQLite native binding was installed explicitly. Native SQLite query verification then passed.
- Prisma migration initially reported a generic schema-engine error when the database file was absent. A non-destructive file initialization step was added to migration scripts and fresh setup was retested successfully.
- During browser testing, an immediate reload raced an unfinished delete request. After the completed request, the database record was gone; a stale view correctly received a missing-record error on a second delete. Completed deletions and refresh were verified separately.

## Limitations and remaining findings

- `pnpm audit` reports one moderate minimatch advisory through development lint tooling (versions 3.1.5 and 10.2.6); no high/critical advisories. Not fixed with a breaking major override. npm's install-time audit reported 16 moderate affected packages; the canonical lockfile audit groups these under one advisory.
- No exhaustive screen-reader/browser compatibility audit, concurrency/load test, real disk-full/corrupt-database test, or production hosting test was performed. Production build passed; production server runtime was not separately exercised.
- Loading/error boundaries exist; page-level database failure was not artificially injected. Network failure feedback was exercised.
- SQLite is local and single-user. No authentication, production deployment, external APIs, AI features or GitHub push was added.

Disposable API/browser test records were removed. The separate setup/seed verification database was removed after testing. The development server is left running at http://localhost:3000; its final response was checked from the same host environment.
