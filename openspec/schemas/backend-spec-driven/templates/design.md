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

| Surface                     | Source or check                             | Expected result            |
| --------------------------- | ------------------------------------------- | -------------------------- |
| <!-- Applicable surface --> | <!-- File, command, test or smoke check --> | <!-- Observable result --> |

## Open Questions

<!-- Include only questions that can be answered later without changing specs, architecture or tasks. Omit this section when none remain. -->
