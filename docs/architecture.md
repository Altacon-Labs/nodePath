# Architecture

## Current working path

Browser onboarding -> project setup -> local CSV import -> validated normalized transaction records -> shared browser analytics model -> Overview / Wallets / Retention -> CSV exports and JSON backup/restore.

apps/web/public/model.mjs owns CSV parsing, project scope validation, deduplication, period metrics, cohort follow-up windows and backup validation. store.mjs owns the versioned local-storage workspace and in-memory fallback. app.mjs composes screens and routes via URL hashes. components.mjs owns reusable safe DOM factories, cards, charts, tables, empty states, icons and toasts. theme.mjs applies persistent appearance before CSS loads. All user-provided text is rendered with textContent.

The UI computes from actual imported records or a clearly labelled sample dataset. There are no mixed hard-coded headline metrics. Hash routes support welcome, setup, overview, wallets, retention, data and settings; filters reset on project changes. Dynamic routes can be reloaded. Account previews remain separate and do not gate the local workflow.

Local storage is versioned. Backup restoration validates project shape and transaction records before replacing state. Failed storage writes keep in-memory data and show a persistent warning. No passwords, RPC credentials or social identities are collected by the analytics journey.

## Backend boundaries

apps/api is an independent demonstration HTTP service with fixed fixtures; the guided local UI does not use its overview data. workers/indexer and workers/analytics are dry-run entry points. PostgreSQL infrastructure is optional and not wired into the local journey. packages/domain and packages/sdk are future shared backend/transport foundations.

## Path to hosted multi-tenant operation

Replace the local store with authenticated, tenant-scoped repositories while preserving model semantics. Implement project memberships and server-side authorization for all queries. Select an auth provider, add secure sessions, verification and recovery. Do not use browser project IDs as proof of access.

Implement durable chain events including chain_id, contract, block_number/hash, transaction_hash, log_index, occurred_at and ingested_at. Distinguish transaction-level UI records from log-level event uniqueness. Add bounded ingestion batches, rate limits, finality thresholds, reorg rollback, replay, atomic checkpoints and idempotent writes. Materialize versioned metric snapshots only after the event model is stable.

Require consent-based identity linking, tenant isolation tests, signed wallet proof if needed, secrets management, observability, backups and retention/deletion controls before customer data is hosted. Use exact numeric types for future monetary values. No private keys belong in this platform.


## Backend-aware read adapter

public/data-source.mjs validates project snapshots, chooses backend/local/cache/mock results and classifies failure states. packages/mock-data is the single fixture generator used by both browser fallback and the demo API. Browser import maps resolve that workspace package through an allowlisted local asset. No external runtime dependencies were added. public/ui.mjs centralizes reusable buttons, links and panels alongside the shared chart/table/empty-state/toast components. Per-project request tokens suppress stale responses; source refreshes do not rebuild setup/import/settings forms. Successful local imports invalidate pending reads, and restored workspaces reset connection state.
