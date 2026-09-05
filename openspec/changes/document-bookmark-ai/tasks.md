## 1. Contract Inventory

- [x] 1.1 Verify bookmark routes, schemas, controllers, use cases, repository filters, ownership checks, transactions, and soft-delete behavior against `bookmarks/spec.md`.
- [x] 1.2 Verify website listing, domain reuse, metadata extraction fields, timeout, URL normalization, and typed fetch errors against `websites-metadata/spec.md`.
- [x] 1.3 Verify tag and collection creation/update embeddings, similarity threshold, per-user filtering, and automatic assignment behavior against `ai-organization/spec.md`.
- [x] 1.4 Verify queue registration, producer settings, payloads, worker results, retries, stale-job handling, repeated-job behavior, and shutdown against `bookmark-jobs/spec.md`.
- [x] 1.5 Verify migrations `003` through `008` support every persistence statement without adding or editing migrations.

## 2. OpenSpec Artifacts

- [x] 2.1 Review `proposal.md` capability paths and confirm they match the four generated spec directories.
- [x] 2.2 Review all capability requirements for normative SHALL/MUST language and at least one four-hash scenario per requirement.
- [x] 2.3 Review `design.md` for source-backed decisions, explicit non-goals, risks, and absence of unresolved implementation questions.
- [x] 2.4 Keep the change limited to proposal, specs, design, and tasks; do not edit application code or generated `dist` output.

## 3. Verification

- [x] 3.1 Run `openspec status --change document-bookmark-ai` and confirm all four artifacts are complete.
- [x] 3.2 Run `openspec validate document-bookmark-ai --type change --strict` and resolve any structural or scenario-format errors.
- [x] 3.3 Inspect the final diff and confirm no unrelated files, secrets, or invented features are included.
