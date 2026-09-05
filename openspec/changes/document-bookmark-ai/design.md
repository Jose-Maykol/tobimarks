## Context

The proposal is documentation-only. The current API is layered into authenticated Express routes, controllers, use cases/services, repositories, PostgreSQL migrations, and core infrastructure. Bookmark creation performs metadata scraping before a transaction, commits bookmark and collection-counter state, and then optionally publishes AI jobs. Gemini embeddings are stored in `VECTOR(1536)` fields for tags and collections; BullMQ workers run in the API process through `src/jobs.ts`.

The documentation must describe observable behavior rather than class structure. It must also preserve current edge behavior: queue publication is best effort after commit, processors return skip results for missing data, queue registration is guarded by name, and no producer currently supplies a custom `jobId` for deduplication.

## Goals / Non-Goals

**Goals:**

- Create four independently archivable capability specs matching the proposal paths.
- Capture HTTP inputs and outputs at the behavior level, ownership boundaries, domain errors, transactions, and soft-delete semantics.
- Capture synchronous scraping and asynchronous classification as separate flows.
- Record queue names, job names, payload shape, retry defaults/overrides, concurrency, shutdown, and repeated-job behavior.
- Provide a design rationale and a traceable documentation task list without changing runtime files.

**Non-Goals:**

- Add or change endpoints, schemas, database migrations, workers, Gemini configuration, or dependencies.
- Promise stronger concurrency idempotency or queue deduplication than the current processors provide.
- Document unimplemented bookmark embeddings, public ownership bypasses, or automatic recovery mechanisms.

## Decisions

### Use four flat capability specs

The specs are split into `bookmarks`, `websites-metadata`, `ai-organization`, and `bookmark-jobs`. This mirrors the proposal and keeps synchronous resource contracts separate from infrastructure contracts. A single combined spec would make queue retry behavior and HTTP behavior harder to validate independently. No existing specs exist, so all files use `ADDED Requirements` and a `Purpose` section.

### Describe contracts, not implementation names

Requirements use user-visible operations, payload fields, status/error outcomes, and data isolation. Source paths are retained in this design and task traceability, while internal repository and service names are intentionally omitted from requirements. This allows implementation refactoring without changing the documented contract.

### Treat post-commit enqueue as non-transactional

The bookmark transaction and AI publication are documented as two phases because the current code commits before loading settings and calling the queue service. If publication fails, the persisted bookmark remains and the request still returns success. A transactional outbox or rollback-on-enqueue-failure was considered but rejected because it would describe a feature that is not implemented.

### State retry and repeat semantics separately

BullMQ's queue defaults are three attempts with exponential backoff, while bookmark creation explicitly uses a two-second exponential delay for AI jobs. The specs mention both levels. Repeated jobs are documented through the processors' existing state checks and skip returns; a uniqueness key or custom job ID is not documented because producers do not set one. Concurrent duplicate assignment remains an implementation limitation, not a guaranteed behavior.

### Use migrations as persistence evidence

The persistence contract references the active schema represented by migrations `003` through `008`: unique websites by domain, per-user collections and tags with 1536-dimensional vectors, active bookmark URL uniqueness, soft delete, bookmark-tag uniqueness, and access logs. No migration is added because this change does not alter the schema.

## Risks / Trade-offs

- [Documentation drift] Runtime behavior may change after this change → validate the four specs against the listed source paths and migrations before archive.
- [External scraping/Gemini availability] URL or provider failures prevent synchronous creation or cause job retries → document the existing typed errors and retry propagation rather than inventing fallback data.
- [Post-commit queue gap] A persisted bookmark may have no AI job if Redis publication fails → explicitly document best-effort enqueue and the logged failure.
- [Repeated concurrent jobs] State checks are not a distributed lock → avoid claiming universal deduplication; document only the sequential stale/already-assigned skip behavior implemented by processors.
- [Partial HTTP annotations] OpenAPI coverage is incomplete → use routes, schemas, controllers, and response builders as the source of truth for this documentation.

## Migration Plan

No runtime migration is required. Create and validate the proposal, four capability specs, design, and tasks under the generated change directory. Review the final status with `openspec status --change document-bookmark-ai` and validate the change. If the documentation is rejected, remove or revise only these unarchived artifacts; no database rollback or application rollback is involved.
