# Architecture and implementation boundaries

Browser -> web development server -> API -> future tenant-scoped PostgreSQL repositories.
RPC/indexing provider -> indexer -> normalized confirmed chain events -> analytics worker -> metric snapshots -> API.

Current behavior: demo HTTP endpoints, browser rendering, shared pure functions, fixture workers. No database reads/writes, live chain calls, authentication, queue, identity graph or AI integration exist. The development servers bind to loopback by default. Do not expose them as a hosted multi-tenant product.

## Ownership

- Web owns presentation; it should consume API contracts rather than database tables.
- API will own authentication, project authorization, wallet queries and metric reads.
- Indexer will own provider adapters, pagination, block ranges, normalized logs and durable checkpoints.
- Analytics will own versioned metric definitions and materialized project snapshots.
- Domain owns portable validation and calculation rules; SDK owns transport contracts.
- Infrastructure owns deployment configuration; docs own decisions and product scope.

## Data design before persistence

Use project_id on tenant-owned entities: projects, project_members, tracked_wallets, campaigns, touchpoints, identity_links, cohort_snapshots and metric_snapshots. Chain events may be stored globally but must be joined through authorized project contracts/wallets. Never infer authorization from a caller-supplied project ID.

Record chain_id, block_number, block_hash, transaction_hash, log_index, occurred_at and ingested_at. Uniqueness is (chain_id, transaction_hash, log_index). Normalize addresses for lookup and retain display/checksum representation separately. Large blockchain integers and token values must use exact numeric or string representations, never floating-point money.

Before a live worker: implement bounded batches, backoff, provider rate limits, finality thresholds, reorg rollback, replay, idempotent writes and atomic checkpoint advancement. Analytics must tolerate replay and update snapshots deterministically. Add a queue only when scheduling and scale require it.

## Metric definitions

An active wallet needs a documented qualifying event and time window. Retention needs a cohort start rule and exact return window; the shared retention function computes set overlap only. The demo's 38% is a fixture, not a result of that function. Define valuation currency and price timestamps before adding wallet value. Wallet identity does not prove a unique person. Sybil outputs must carry uncertainty and evidence.

## Production requirements

Add tenant authorization tests, signed wallet proof with nonce/expiry, secret storage, request validation, quotas, observability, backups, schema migrations and consent/retention/deletion controls before real data. Social-to-wallet linking must be consent based. Do not store private keys. Do not implement predictive scores without a documented evaluation method.

