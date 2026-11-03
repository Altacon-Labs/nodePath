# Validation for guided-journey release

Environment: Windows, Node 24.12.0, npm 11.7.0.

- npm run check: JavaScript syntax checks.
- npm test: 12 tests passed, covering API responses, shared primitives, project validation, CSV scope/date/deduplication, idempotent merge, period metrics/drilldown consistency, retention maturity, sample consistency, backup validation and storage failure fallback.
- Isolated DOM integration using the real frontend modules: sample exploration, metric drilldown, search empty state, cohort inspection, project creation, initial empty state, invalid/valid CSV imports, source status, backup download, restore and guarded deletion passed.
- Single-icon appearance behavior checked separately for both directions, saved choice, tab sync and storage failure fallback.
- Local web routing/asset checks and Git archive integrity verification recorded at packaging.

The DOM integration used a simulated document, not a full browser engine. The in-app browser preview failed with a browser-session binding error, so no real-browser visual, mobile viewport or file-picker verification is claimed. CDN font/icon files require network access and were not downloaded here. Node 22, hosted GitHub Actions, Docker, production authentication and live blockchain indexing were not run. They are not claimed as implemented/verified.


Packaging checks: guided HTML, all new local modules/styles and account preview routes returned HTTP 200. Isolated journey and theme checks passed after the final navigation change.

## Backend fallback and reusable UI revision

18 automated tests pass. New cases cover shared mock snapshots, network fallback, local/cached preservation, valid empty live results, authorization failures and malformed responses. Real HTTP integration started web/API on isolated ports, read the snapshot through the proxy, checked new assets, stopped the API and confirmed populated mock fallback. Isolated journey and theme checks passed. Forms are preserved during background connection updates, and per-project tokens discard stale requests. Responsive CSS was reviewed/extended for 320px through wide desktop screens; real-browser viewport/visual verification remains unavailable and is not claimed.

Additional isolated async integration passed: out-of-order backend responses retain the newest snapshot and background refresh preserves the active data-import form.
