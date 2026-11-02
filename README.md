# NodePath

Web3 Growth Intelligence Platform monorepo. This is a runnable development scaffold, not a production analytics service. All dashboard and API metrics are explicitly sample data; workers only process fixtures.

## Quick start

Requires Node.js 22+ and npm 10+. From the repository root:

~~~sh
npm ci
# Optional: copy .env.example to .env (PowerShell: Copy-Item .env.example .env)
npm run dev
~~~

Open http://localhost:3000. API: http://localhost:4000/health. Stop both with Ctrl+C.

~~~sh
npm run check
npm test
npm run build
npm run worker:indexer
npm run worker:analytics
# Optional database only; not used by the demo:
docker compose -f infrastructure/compose.yaml up -d
# Stop the database while keeping its data:
docker compose -f infrastructure/compose.yaml down
~~~

## Layout

~~~text
apps/web/             browser dashboard + development server
apps/api/             HTTP API; demo overview and wallet endpoints
workers/indexer/      onchain ingestion boundary; dry-run entry point
workers/analytics/    cohort and metrics processing boundary; dry-run entry point
packages/domain/     shared validation, event identity and retention functions
packages/sdk/        shared API client for future consumers
infrastructure/      optional local PostgreSQL environment
scripts/             development and validation commands
.github/workflows/   CI checks on Node 22 and 24
docs/                architecture, API, roadmap, migration and original spec
~~~

The uploaded repository had only a README and Git metadata. There was no existing frontend, backend, dependency setup or framework to migrate. This scaffold uses Node built-ins and npm workspaces to remain runnable without selecting service vendors. Next.js/TypeScript and NestJS remain the spec's recommended next implementation choices; they are not installed or claimed as implemented here.

See [architecture](docs/architecture.md), [API](docs/api.md), [roadmap](docs/roadmap.md), [migration](docs/migration.md), and [original specification](docs/product-spec-original.txt).


## Contributors and design

See [contribution guide](CONTRIBUTING.md), [design system](docs/design-system.md), [community conduct](CODE_OF_CONDUCT.md) and [security reporting](SECURITY.md). The UI uses Manrope, Phosphor icons, 8-point spacing, reusable components, toasts and empty states. Cards are borderless; no pills or badges are used.

Licensing: the original repository contains no license. The owner must choose a license before this can be represented as a licensed open-source project. Third-party fonts and icons retain their upstream licenses; see THIRD_PARTY_NOTICES.md.
