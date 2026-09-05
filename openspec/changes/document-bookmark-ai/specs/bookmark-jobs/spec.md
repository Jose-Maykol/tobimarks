## Purpose

Define the BullMQ queues and worker behavior that decouple automatic bookmark classification from the synchronous bookmark transaction.

## ADDED Requirements

### Requirement: Publish stable AI jobs after bookmark commit
The system SHALL publish AI jobs only after the bookmark transaction commits. Auto-tagging SHALL use queue `ai-tags-generation` and job `generate-tags`; auto-collection SHALL use queue `ai-collections-generation` and job `generate-collections`. Each payload SHALL contain serializable `bookmarkId` and `userId` identifiers.

#### Scenario: Settings select jobs
- **WHEN** a bookmark is committed and the user's profile enables auto-tags or auto-collections without a supplied collection
- **THEN** the corresponding job is enqueued with the bookmark and user identifiers

#### Scenario: Queue publish failure
- **WHEN** persistence commits but publishing an AI job fails
- **THEN** the bookmark remains persisted, the enqueue error is logged, and the HTTP creation operation is not rolled back

### Requirement: Retry transient job failures
The system SHALL process registered queues with a default worker concurrency of five and three attempts using exponential backoff. AI processors SHALL rethrow unexpected processing errors so BullMQ can retry them and SHALL log job context without sensitive payloads.

#### Scenario: Failed AI processing
- **WHEN** Gemini or persistence fails during an AI processor execution
- **THEN** the processor rejects the job, BullMQ records the failure, and retries according to the configured attempts and exponential backoff

#### Scenario: Completed job
- **WHEN** an AI processor finishes successfully or intentionally skips
- **THEN** the job is marked completed and its structured result is returned to BullMQ

### Requirement: Tolerate repeated and stale jobs
The system SHALL handle sequential repeated jobs through processor state checks. A stale or already changed bookmark SHALL produce a skip result rather than an unhandled not-found failure; a collection job SHALL skip an already assigned bookmark; and a user with no candidate labels SHALL not cause an invalid write. These checks are not distributed locks, so concurrent duplicate jobs are not guaranteed to be race-free.

#### Scenario: Reprocessed collection job
- **WHEN** the same collection job runs after its bookmark was assigned
- **THEN** it completes with an already-in-collection result and does not increment a second collection counter

#### Scenario: Deleted or missing bookmark
- **WHEN** a queued job cannot find the non-deleted bookmark
- **THEN** it returns a not-found skip result and does not write tags, collection assignments, or counters

### Requirement: Initialize workers and expose shutdown
The system SHALL initialize both AI workers through the application job initializer. Queue infrastructure SHALL expose an orderly shutdown operation that closes workers and queues after in-progress jobs finish, but the current application bootstrap does not invoke that operation from signal handlers or an integrated shutdown lifecycle.

#### Scenario: Application startup
- **WHEN** the application initializes jobs
- **THEN** both named AI queues are registered once and their workers begin listening

#### Scenario: Duplicate queue registration
- **WHEN** initialization attempts to register an already registered queue
- **THEN** registration is skipped without creating another worker

#### Scenario: Explicit queue shutdown
- **WHEN** the queue service shutdown operation is called
- **THEN** workers and queues are closed according to the service implementation
