## Context

See `proposal.md` for motivation and the two delta specifications for observable behavior. The current database already defines a partial unique index on `(user_id, url)` for all non-deleted bookmarks, so archived bookmarks are intentionally still unique but the application only detects its collision after metadata scraping and reports a generic duplicate. Collections have no database uniqueness constraint despite services attempting to map one. Tags enforce `(user_id, slug)`, but creation and update produce slugs differently and update does not map unique violations.

The implementation must preserve PostgreSQL as source of truth under concurrent requests, ownership checks in every mutation, parameterized SQL, and the response envelope used by `ApiResponseBuilder`.

## Goals / Non-Goals

**Goals:**

- Make archive state a first-class, idempotent bookmark transition.
- Restore, rather than duplicate, an archived bookmark submitted through bookmark creation.
- Enforce normalized collection uniqueness at database level.
- Make resource conflict classification depend on PostgreSQL constraint identity, not SQLSTATE `23505` alone.
- Keep tag slug derivation deterministic across write paths.

**Non-Goals:**

- Restore soft-deleted bookmarks or introduce a recycle-bin endpoint.
- Merge duplicate historical bookmarks or collections automatically.
- Treat URL variants differing after current canonicalization as equivalent.
- Change collection hierarchy, bookmark deletion semantics, or asynchronous AI job behavior.
- Add testing framework or dependencies; tasks define test coverage only if repository tooling is introduced separately.

## Decisions

### Preserve one non-deleted bookmark per normalized URL

Keep existing bookmark partial unique invariant: `(user_id, url) WHERE deleted_at IS NULL`. `is_archived` is a visibility/lifecycle state, not a second copy namespace. This prevents ambiguity in access counters, tag associations, AI jobs, and collection counts.

Alternative rejected: include `is_archived = false` in the unique index. It allows duplicate records and requires future selection/merge rules when restoring.

### Return restoration as a distinct successful create outcome

`POST /api/bookmarks` returns `201 Created` with `outcome: "created"` for inserts and `200 OK` with `outcome: "restored"` for an archived URL. The returned object must carry the persistent bookmark ID and final archive state. This makes behavior machine-readable without asking clients to infer it from status alone.

Alternative rejected: respond `409` and require clients to call a restore endpoint. It adds a race-prone two-step client flow for a common recovery action.

### Use atomic database writes for create-or-restore

Normalize the final URL before resolving persistence. Implement a repository operation with PostgreSQL conflict handling for the existing partial unique index: it inserts if no non-deleted URL exists, restores only when the conflicting row is archived, and reports active conflict otherwise. The operation must return both the bookmark and outcome in one transaction.

For a restoration with `collectionId`, validate collection ownership before persistence and update association atomically. Update `collections.bookmarks_count` only when association changes and only once; archive/restore itself does not affect counts. Database conditional update or UPSERT semantics must be the concurrency boundary, not a preceding `SELECT` alone.

Alternative rejected: find then insert/update in application code. Two simultaneous create requests can both observe no record or stale archive state and violate intended behavior.

### Add explicit archive-state endpoints

Use `PATCH /api/bookmarks/:id/archive` to archive and `DELETE /api/bookmarks/:id/archive` to restore. This follows existing favorite state route semantics and makes the resource state explicit. Both routes require auth and UUID parameter validation. A user cannot transition another user's record and cannot transition a soft-deleted record.

Alternative rejected: overload generic bookmark update with `isArchived`. It makes lifecycle transitions less discoverable and would widen generic editable fields unnecessarily.

### Enforce collection uniqueness with normalized expression index

Add a numbered migration creating a unique expression index on `(user_id, lower(btrim(name)))`. The application does not need a duplicate pre-check; PostgreSQL resolves races and the repository translates the identified index conflict. Request validation retains user-entered display casing, while the index defines equivalence.

Before creating the index, migration checks grouped normalized names. If collisions exist, it raises a clear error and creates no index. This is safer than silently renaming or deleting user data. Operators resolve records intentionally, rerun migration, then application code gains the invariant.

Alternative rejected: `UNIQUE(user_id, name)`. It fails to block spacing and case variants requested by the contract.

### Carry PostgreSQL constraint identity through persistence exceptions

Extend `UniqueConstraintViolationError` with optional `constraint` from `pg.DatabaseError`. Repositories preserve SQLSTATE mapping but pass constraint name. Use cases compare against named expected constraints before translating to domain exceptions. Unknown `23505` errors propagate to global error handling.

Alternative rejected: infer origin from `detail` text. PostgreSQL messages are not stable contracts and can vary by server locale/version.

### Centralize tag slug normalization locally in module

Extract a small tag-module function used by create and update with `lower: true`, `strict: true`, and trimming. Validate that resulting slug is non-empty before persistence, returning the module's existing validation-response mechanism. Existing `UNIQUE(user_id, slug)` remains authoritative.

Alternative rejected: use the raw name for uniqueness. Existing tag identity and downstream lookup depend on slug.

## Risks / Trade-offs

- [Canonical URL is only known after metadata extraction] -> Keep current extraction sequence; use final canonical URL in atomic persistence and document that source URL variants can still fetch before restoration is known.
- [Historical collection duplicates block deployment] -> Migration fails before index creation, emits actionable duplicate count/sample, and deployment runbook includes a query to resolve them.
- [Collection count can drift during restore with reassignment] -> Execute association update and both affected count changes inside same `IUnitOfWork`; only modify counts when old and new IDs differ.
- [Existing unnamed PostgreSQL constraints complicate classification] -> Use exact generated name for existing tag constraint and explicit name for each newly added index/constraint; confirm names in migration and repository constants.
- [Archived bookmark jobs may be pending] -> Archive state transition does not cancel jobs in this scope; job consumers must continue tolerating a bookmark that is present but archived.

## Migration Plan

1. Query production collections for `(user_id, lower(btrim(name)))` duplicates and resolve them with product-owner approval before deployment.
2. Deploy migration adding the named normalized collection unique index. It must run the preflight check and fail atomically if duplicates remain.
3. Deploy application changes that recognize named constraints, then expose archive endpoints and create-or-restore behavior.
4. Update OpenAPI, README, and DATABASE.md with response outcomes, state endpoints, uniqueness expression, and operator remediation query.
5. Verify production with create/archive/create, active duplicate, collection spacing/case duplicate, and tag rename conflict cases.

Rollback: application code can be rolled back independently while database constraint remains stricter and safe. If schema rollback is necessary, use a new forward migration dropping only the named collection unique index after explicit approval; never edit an applied migration. Existing restored bookmarks need no data rollback.
