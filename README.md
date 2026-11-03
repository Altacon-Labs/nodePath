# NodePath

Understand which wallets become active and keep returning. NodePath now provides a guided, local analytics workflow: explore a complete sample project or create a project and analyse your own transaction CSV.

## Run

Requires Node.js 22+ and npm 10+. Extract the repository, open a terminal in the nodePath folder containing package.json, then:

~~~sh
npm ci
npm run dev
~~~

Open http://localhost:3000. Choose **Explore sample project** for the fastest tour. No account, RPC key or database is required. Press Ctrl+C to stop.

## Complete local journey

1. Start: explore a sample or create your project.
2. Define scope: project name, EVM chain and contract; activation means first observed transaction with that contract.
3. Add data: import confirmed transaction CSVs. Status reflects real imported records; no simulated provider connection.
4. Review Overview: active, new and returning wallets, previous-period comparison and daily activity, all computed from one dataset.
5. Investigate Wallets: inspect a metric's wallets, search, filter, view transaction history and export matching rows.
6. Investigate Retention: examine mature weekly cohorts, inspect a cohort's wallets and export results.
7. Settings: rename projects, export/restore a workspace backup or delete a project with typed confirmation.

Projects and transactions persist in this browser. Project switching resets filters. Export backups before clearing browser data. If storage is blocked/full, the app warns that changes are temporary. Browser storage is not shared, encrypted account storage.

Read the [user guide](docs/user-guide.md), [CSV format](docs/csv-import.md), [architecture](docs/architecture.md), [validation](docs/validation.md) and [migration](docs/migration.md).

## What is and is not connected

The sample uses illustrative transactions; imported projects calculate from the CSV rows you provide. No live blockchain provider, authenticated account, multi-user workspace, continuous indexing, monetary valuation or AI prediction is connected. Uploaded data is validated structurally and scoped to your project; it is not independently verified against a chain.

The /login and /sign-up routes remain optional account-interface previews. They do not create accounts/sessions and are not a prerequisite for using the app. The main navigation focuses on working analytics instead.

The API and worker scaffolds remain extension boundaries. The guided local UI does not call the old fixed-metric demo API. See docs/roadmap.md before extending to live data.

## Development

~~~sh
npm run check
npm test
npm run build
npm run worker:indexer
npm run worker:analytics
~~~

Build validates syntax; there is no compilation step. CI runs checks and tests on Node 22 and 24. Optional PostgreSQL: docker compose -f infrastructure/compose.yaml up -d (not used by the local journey).

## Repository layout

~~~text
apps/web/          guided dashboard, onboarding, account previews, analytics model and local storage
apps/api/          demonstration HTTP API and future backend boundary
workers/           indexing and analytics fixture entry points
packages/domain/   shared validation and retention primitives
packages/sdk/      future API client
infrastructure/    optional development PostgreSQL
scripts/           dev launcher and syntax checks
.github/           CI, issue templates and PR template
docs/              product spec, architecture, contribution-related and user documentation
~~~

## Design and contribution

Manrope typography, Phosphor icons, an 8-point layout scale, borderless cards, reusable components, accessible toasts and useful empty states. One sun/moon button switches light/dark; your choice persists. Fonts/icons currently require network access to pinned CDN assets.

See [CONTRIBUTING.md](CONTRIBUTING.md), [design system](docs/design-system.md), [community conduct](CODE_OF_CONDUCT.md), [security reporting](SECURITY.md) and [third-party notices](THIRD_PARTY_NOTICES.md). The owner must choose a project license before this can be represented as licensed open source. Original Git history and origin are preserved; no commit or push has been made.


## Backend-aware data and offline mocks

The frontend now reads GET /v1/projects/{id} through the web proxy. The demo API serves the sample project using the shared packages/mock-data generator; when the API is off, the sample falls back to the same mock-data contract. Personal projects keep their own imports or cached backend snapshots and never receive invented sample activity. Valid empty backend data stays empty; unauthorized/invalid responses show errors. The source indicator distinguishes backend, mock, local and cached data. Use Refresh data source to retry. See docs/api.md for the integration contract.

Run npm run dev for web + demo API, or npm run dev:web to use the frontend with the API offline. No external service is needed for sample fallback.
