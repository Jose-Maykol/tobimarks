## Context

<!-- Current state and constraints needed to explain the approach. Reference proposal.md for motivation. -->

## Goals / Non-Goals

**Goals:**

<!-- Design-level outcomes. Do not repeat the proposal verbatim. -->

**Non-Goals:**

<!-- Explicit exclusions and boundaries. -->

## Change Profile

<!-- Mark every row with exactly Yes or No and cite concrete source paths. -->

| Surface                   | Applies | Evidence                                      |
| ------------------------- | ------- | --------------------------------------------- |
| API/HTTP                  | Yes/No  | proposal.md, src/...                          |
| Auth/Authorization        | Yes/No  | proposal.md, src/...                          |
| Persistence               | Yes/No  | proposal.md, migrations/..., src/...          |
| Jobs/Queues               | Yes/No  | proposal.md, src/...                          |
| External Integrations     | Yes/No  | proposal.md, src/...                          |
| Config/Infrastructure     | Yes/No  | proposal.md, .env.example, docker-compose.yml |
| Security/Privacy          | Yes/No  | proposal.md, SECURITY.md, src/...             |
| Observability/Performance | Yes/No  | proposal.md, src/...                          |

## File Plan

<!-- List every affected file in a tree. Mark each path with [NEW], [MOD], [DELETE] or [MOVE], and give every entry a short reason. Use concrete repository-relative paths. Exclude dist/, node_modules/ and generated outputs. -->

```text
<repository-root>/
├── src/
│   └── <affected-path>  [MOD]  # <reason>
└── <new-or-affected-path>  [NEW]  # <reason>
```

| Action                       | Path                              | Reason                             |
| ---------------------------- | --------------------------------- | ---------------------------------- |
| <!-- NEW/MOD/DELETE/MOVE --> | <!-- Repository-relative path --> | <!-- Why this file is affected --> |

<!-- IF: API/HTTP -->

## API/HTTP

- **Affected routes and middleware order:**
- **Request schemas and transformations:**
- **Response envelopes, status codes and error codes:**
- **Controller/use-case/service boundary:**
- **Authentication, authorization and ownership:**
- **OpenAPI annotations and JSDoc updates:**
- **Compatibility and deprecation impact:**
- **Verification:**
<!-- END IF: API/HTTP -->

<!-- IF: Auth/Authorization -->

## Auth/Authorization

- **Actor and trust boundary:**
- **Credential, token or session flow:**
- **Claims, expiry, rotation and revocation:**
- **Ownership and permission checks:**
- **Abuse controls and failure responses:**
- **Secret handling:**
- **Verification:**
<!-- END IF: Auth/Authorization -->

<!-- IF: Persistence -->

## Persistence

- **Tables, models and schema changes:**
- **Constraints, indexes and query plan impact:**
- **SQL parameterization and ownership filters:**
- **Soft delete and data lifecycle:**
- **Unit of Work and transaction boundaries:**
- **Backfill, deployment order and rollback:**
- **Verification:**
<!-- END IF: Persistence -->

<!-- IF: Jobs/Queues -->

## Jobs/Queues

- **Producer, consumer and execution boundary:**
- **Queue/job names and payload version:**
- **Job ID, deduplication and idempotency:**
- **Retries, backoff and failure handling:**
- **Concurrency, ordering and shutdown:**
- **Repeated or stale job behavior:**
- **Verification:**
<!-- END IF: Jobs/Queues -->

<!-- IF: External Integrations -->

## External Integrations

- **Provider contract and data exchanged:**
- **Credentials and configuration:**
- **Timeouts, retries and rate limits:**
- **Errors, fallback and degradation:**
- **Privacy, SSRF and egress boundaries:**
- **Verification:**
<!-- END IF: External Integrations -->

<!-- IF: Config/Infrastructure -->

## Config/Infrastructure

- **Environment variables, defaults and validation:**
- **Secret delivery and TLS:**
- **Docker/services, health checks and resources:**
- **Startup, shutdown and deployment order:**
- **Reversible configuration and rollback:**
- **Verification:**
<!-- END IF: Config/Infrastructure -->

<!-- IF: Security/Privacy -->

## Security/Privacy

- **Assets and trust boundaries:**
- **Threats and mitigations:**
- **Input validation and authorization:**
- **Sensitive or personal data and retention:**
- **CSRF, SSRF, injection and abuse considerations:**
- **Log redaction and incident impact:**
- **Verification:**
<!-- END IF: Security/Privacy -->

<!-- IF: Observability/Performance -->

## Observability/Performance

- **Structured logs and sensitive fields:**
- **Metrics, tracing and alerts:**
- **Cache behavior and invalidation:**
- **Latency, limits and resource usage:**
- **Concurrency, load and degradation:**
- **Verification:**
<!-- END IF: Observability/Performance -->

## Decisions

<!-- For each material decision, explain why it was chosen and which alternatives were considered. -->

### Decision: <!-- Short decision name -->

- **Choice:**
- **Rationale:**
- **Alternatives considered:**

## Risks / Trade-offs

<!-- Every item must use the format: [Risk] -> Mitigation -->

- [Risk] <!-- Concrete risk --> -> <!-- Mitigation -->

## Migration Plan

- **Deployment order:**
- **Data migration or backfill:**
- **Compatibility window:**
- **Rollback:**

<!-- Explicitly state when no migration is required. -->

## Verification

### Test Strategy

- **Current test architecture:** <!-- Existing runner, test directories, fixtures, mocks and CI. State "none" when absent. -->
- **Available checks:** <!-- Build, typecheck, lint, OpenSpec, manual smoke checks or existing test commands. -->
- **Unavailable checks:** <!-- Unit, integration, HTTP, E2E or other levels that cannot run. Explain why. -->
- **Test levels selected:** <!-- Levels used by this change and reason for each. -->
- **Dependencies and isolation:** <!-- PostgreSQL, Redis, external providers, test data and cleanup. -->
- **Full available suite:** <!-- Exact command(s), or explicit statement that no suite exists. -->

### Verification Matrix

<!-- Add one row for every scenario in each changed or added spec. For skip_specs: true, reference the affected artifact or risk instead. Add cross-cutting cases for validation, authentication, ownership, failure handling, rollback, retries, idempotency, concurrency and data isolation when applicable. Use repository-relative paths and exact commands. -->
<!-- Status MUST be one of: AUTOMATED, MANUAL, STATIC, BLOCKED. -->

| ID    | Source requirement / scenario / artifact | Surface           | Level                                            | Preconditions / fixtures | Action / input     | Expected observable result | Command / source                | Status                                   |
| ----- | ---------------------------------------- | ----------------- | ------------------------------------------------ | ------------------------ | ------------------ | -------------------------- | ------------------------------- | ---------------------------------------- |
| V-001 | <!-- Concrete source reference -->       | <!-- API/HTTP --> | <!-- unit/integration/HTTP/E2E/manual/static --> | <!-- Required state -->  | <!-- Operation --> | <!-- Concrete result -->   | <!-- Command or source path --> | <!-- AUTOMATED/MANUAL/STATIC/BLOCKED --> |

### Coverage Gaps

- <!-- Missing runner, service, fixture, environment or other limitation. -->
- <!-- Future work needed to move a MANUAL, STATIC or BLOCKED row to AUTOMATED. -->

## Open Questions

<!-- Include only questions that can be answered later without changing specs, architecture or tasks. Omit this section when none remain. -->
