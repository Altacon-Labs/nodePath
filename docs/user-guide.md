# Follow a question from setup to evidence

## First visit

Open http://localhost:3000. The welcome screen asks what project you want to understand. Choose Explore sample project to start with a consistent, populated dataset, or Create a project to import your own data. No account is required. You can return to this screen by clicking NodePath.

## Explore a sample

1. Open the sample project. The top bar explicitly says Sample data.
2. Change the analysis period between 7, 30 and 60 days. Windows end at the latest dataset day, rather than today's date, so old imports remain useful. Dates are UTC.
3. Inspect active, new or returning wallets from the corresponding metric. These lists use the same period and definitions as the overview.
4. Search a wallet address and select a wallet row to see its most recent transactions. Sample hashes are labelled and are not linked to real chain explorers.
5. Open Retention. Unavailable cells are immature observations, not zero retention. Inspect a cohort to see its wallets over the full imported history.
6. Export matching wallets or retention results as CSV.

## Create your project

1. Click Create a project. Enter a name, select Ethereum/Base/Arbitrum/Polygon and enter an EVM contract address.
2. Continue to Data sources. The project starts with no metrics and an honest Awaiting first import state.
3. Download the CSV template. Replace the example row with confirmed transaction records from your data source; the template is not a chain export.
4. Import a CSV. Rows must match the chosen chain and contract. Errors identify the offending row. Imports are atomic: a validation failure does not partially add data. Reimporting identical wallet/transaction pairs does not duplicate them.
5. A successful import takes you to Overview. All numbers now use your imported data. No sample numbers are mixed into a personal project.

## Understand the numbers

- Active: distinct wallets transacting inside the selected period.
- New: active wallets whose first observed transaction is inside that period.
- Returning: active wallets first observed before the period. Active = new + returning.
- Previous period: the equally long immediately preceding UTC window.
- Wallet records: distinct wallet/transaction pairs; a transaction involving two observed wallets produces two records.
- Retention: first-observation cohorts, grouped into seven-day UTC buckets. Follow-up week 1 is days 7–13 after each wallet's own first transaction; week 2 is days 14–20, and so forth. A cohort cell remains unavailable until every member has a complete follow-up window.

The app cannot infer missing history or distinguish inactivity from missing ingestion. Import a complete, continuous observation range and validate conclusions against your source. Wallets are not verified humans. No LTV, price estimates, Sybil verdicts or predictive recommendations are fabricated.

## Keep your work safe

Use the project selector to switch projects. Filters reset when changing projects. Settings allows renaming, JSON workspace backup and backup restore. Restoring replaces the current local workspace and requires a checked confirmation. Export first. Project deletion requires typing its exact name.

Browser data is local to the browser/origin. Moving between localhost and 127.0.0.1 creates separate stores. Moving to a new computer, clearing site data or private browsing can lose work. If storage is unavailable or full, a persistent footer warning explains that changes are temporary. Backups contain wallet data; keep them private.

## Troubleshooting

- Empty project: use Data sources to import CSV, or explore the sample from the welcome screen.
- No matching wallets: clear filters or choose a larger period.
- Unavailable retention: import more follow-up history; do not interpret it as churn.
- Import rejected: check the exact headers, chain, contract, timezone and row limit in csv-import.md.
- Old dates: periods intentionally end at the latest imported transaction day. Import newer activity to advance the window.
- Missing font/icon: permit access to the pinned CDN or vendor assets as described in THIRD_PARTY_NOTICES.md.

## Real accounts and live data

Account pages are UI previews only. Live RPC ingestion, secure sessions, multi-tenant project access and automatic background refresh need backend implementation. Data sources makes this status visible instead of showing fictitious connection progress.


## When the backend is offline

The app checks the selected project endpoint with a bounded timeout. Sample projects continue with labelled mock transactions from the shared fixture package. Your own projects retain local CSV history or cached backend records; the source status explains which is shown. A successful backend snapshot becomes the data source. A connected project with no records shows an empty activity state. Authentication failures and malformed responses show a persistent source error. Use Refresh data source after starting/reconnecting the backend. Account authentication itself is still not implemented by this scaffold.
