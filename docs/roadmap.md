# Delivery roadmap

## Phase 1: wallet analytics MVP

Replace fixtures with a single-chain vertical slice: authenticated project membership, tracked contracts/wallets, PostgreSQL migrations, confirmed-event indexing, wallet activity queries, segmentation and explicitly defined retention windows. Add replay/reorg integration tests and tenant isolation tests. Move web to Next.js/TypeScript and API to NestJS if the team adopts the spec's recommended frameworks. Keep workspace names and package boundaries stable.

## Phase 2: attribution

Add a consent-aware event collection SDK, campaign/referral IDs, verified wallet linkage, identity graph and attribution models. Define attribution windows and duplicate handling. Social integrations require separate provider credentials and consent flows.

## Phase 3: advanced intelligence

Add wallet-value features, churn modelling, Sybil signals and experiment comparisons. Version models and datasets, measure precision/recall and report confidence. No model training, AI requests or classifications are implemented by this scaffold.

## Deferred infrastructure

Provider choice (Alchemy/Infura/QuickNode), indexer vendor, auth provider, hosted database, queue and deployment platform remain decisions. No empty vendor integrations, smart-contract package or deployment workflow has been added because the supplied repository has no code requiring them.

