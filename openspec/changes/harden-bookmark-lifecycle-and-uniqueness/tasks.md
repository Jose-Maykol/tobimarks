## 1. Database Integrity

- [ ] 1.1 Add migration `011` that preflights duplicate `(user_id, lower(btrim(name)))` collection names, fails with actionable diagnostics when any exist, and creates a named unique expression index only when preflight passes.
- [ ] 1.2 Update `DATABASE.md` with normalized collection-name invariant, index name, duplicate remediation query, and existing bookmark archive uniqueness semantics.
- [ ] 1.3 Extend `UniqueConstraintViolationError` and repository SQLSTATE handling to preserve PostgreSQL `constraint` identity without exposing database details in API responses.

## 2. Bookmark Lifecycle

- [ ] 2.1 Add validated UUID route schemas and remove duplicate `DELETE /api/bookmarks/:id` route declaration.
- [ ] 2.2 Add authenticated `PATCH /api/bookmarks/:id/archive` and `DELETE /api/bookmarks/:id/archive` routes, controller methods, use cases, DI tokens, and repository operation enforcing ownership, non-deletion, idempotency, and final-state response.
- [ ] 2.3 Replace bookmark insert-only persistence with an atomic create-or-restore operation that preserves one non-deleted `(user_id, normalized_url)` record and reports `created`, `restored`, or active duplicate outcome under concurrency.
- [ ] 2.4 Update create-bookmark orchestration to validate requested collection ownership, apply restore association semantics, keep collection counters transactionally correct, skip new AI jobs for restored records, and map only the bookmark URL constraint to `BookmarkAlreadyExistsError`.
- [ ] 2.5 Update create response contract: `201` plus `outcome: "created"` for inserts, `200` plus `outcome: "restored"` for restoration, both with bookmark ID and archive state.

## 3. Collection And Tag Uniqueness

- [ ] 3.1 Map only named normalized-collection index violations in collection create/update to `CollectionAlreadyExistsError`; propagate unrelated persistence failures.
- [ ] 3.2 Add one shared tag slug-normalization function using lowercase, strict, trimmed normalization; use it for create and update and reject an empty normalized slug through validation.
- [ ] 3.3 Map the named `(user_id, slug)` tag constraint in both create and update to `TagAlreadyExistsError`; preserve existing record on failed update and propagate unrelated failures.

## 4. API Documentation

- [ ] 4.1 Add or update OpenAPI annotations for bookmark archive, restore, create outcomes, UUID validation, and all applicable `404`/`409` responses.
- [ ] 4.2 Update README endpoint table and behavior notes for archive/restore, automatic archived-bookmark restoration, collection name equivalence, and tag slug equivalence.

## 5. Verification

- [ ] 5.1 Add focused automated coverage if project test infrastructure is available for active duplicate rejection, archived create restoration, soft-delete recreation, concurrent create-or-restore, archive transition idempotency, ownership failures, collection case/space conflicts, and tag rename conflicts.
- [ ] 5.2 Manually validate migration preflight on a disposable database with and without normalized collection duplicates; verify index creation is atomic and idempotent where applicable.
- [ ] 5.3 Run `npx tsc --noEmit -p tsconfig.json`, `npx eslint src scripts`, `npx prettier --check "**/*.{ts,js,json,md,yml,yaml}"`, and `npm run build`; record unavailable verification or existing failures.
