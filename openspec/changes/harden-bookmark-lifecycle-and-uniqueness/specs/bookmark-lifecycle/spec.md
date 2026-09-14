## Purpose

Define un ciclo de vida explícito para bookmarks que evite URLs duplicadas y permita recuperar de forma segura bookmarks archivados por su propietario.

## ADDED Requirements

### Requirement: Bookmark URL uniqueness across active and archived records
The system SHALL allow at most one non-deleted bookmark for a given owner and normalized URL, regardless of its archived state. Soft-deleted records SHALL NOT participate in this uniqueness rule.

#### Scenario: Active duplicate URL is rejected
- **WHEN** an authenticated user creates a bookmark whose normalized URL matches that user's non-deleted, non-archived bookmark
- **THEN** the system SHALL return `409 Conflict` with error code `BOOKMARK_ALREADY_EXISTS` and SHALL NOT modify the existing bookmark

#### Scenario: Another user saves same URL
- **WHEN** a user creates a bookmark whose normalized URL is owned by a different user
- **THEN** the system SHALL create a separate bookmark for that user

#### Scenario: Soft-deleted URL is saved again
- **WHEN** a user creates a bookmark whose normalized URL only matches bookmarks with `deleted_at` set
- **THEN** the system SHALL create a new non-deleted bookmark

### Requirement: Automatic restoration during duplicate creation
The system SHALL restore an archived bookmark when its owner submits a create request with the same normalized URL. The system SHALL return the restored bookmark without creating a second non-deleted record.

#### Scenario: Create request restores archived bookmark
- **WHEN** an authenticated user creates a bookmark whose normalized URL matches that user's archived, non-deleted bookmark
- **THEN** the system SHALL set its archived state to `false`, return `200 OK`, include the restored bookmark and an outcome identifying it as restored

#### Scenario: Restoration applies requested collection
- **WHEN** a create request restores an archived bookmark and contains a collection identifier
- **THEN** the system SHALL associate the restored bookmark with that collection only if the collection belongs to the authenticated user

#### Scenario: Restoration without collection preserves association
- **WHEN** a create request restores an archived bookmark without a collection identifier
- **THEN** the system SHALL preserve its existing collection association

#### Scenario: Concurrent archived restoration
- **WHEN** concurrent create requests target the same archived bookmark URL for the same owner
- **THEN** exactly one non-deleted bookmark SHALL remain for that URL and every successful response SHALL reference that same bookmark identifier

### Requirement: Explicit archive state transitions
The system SHALL expose authenticated operations to archive and restore a bookmark owned by the caller. Both operations SHALL return the final archive state.

#### Scenario: Archive owned bookmark
- **WHEN** a user requests archival of an owned non-deleted bookmark
- **THEN** the system SHALL set `isArchived` to `true` and return `200 OK` with that bookmark identifier and `isArchived: true`

#### Scenario: Restore owned bookmark
- **WHEN** a user requests restoration of an owned archived bookmark
- **THEN** the system SHALL set `isArchived` to `false` and return `200 OK` with that bookmark identifier and `isArchived: false`

#### Scenario: State transition is idempotent
- **WHEN** a user requests archive for an already archived bookmark or restore for an already restored bookmark
- **THEN** the system SHALL return `200 OK` with the requested final state and SHALL NOT create records or change collection counts

#### Scenario: Foreign or deleted bookmark cannot transition
- **WHEN** a user requests an archive-state transition for a bookmark not owned by that user or already soft-deleted
- **THEN** the system SHALL return `404 Not Found` with error code `BOOKMARK_NOT_FOUND`

### Requirement: Bookmark mutation request validation
The system SHALL validate bookmark identifiers as UUIDs before archive, restore, delete, favorite, collection, access, and update operations execute.

#### Scenario: Invalid bookmark identifier is rejected
- **WHEN** a bookmark mutation request contains a non-UUID identifier
- **THEN** the system SHALL return the standard validation error and SHALL NOT invoke bookmark business logic

### Requirement: Constraint-aware bookmark conflict response
The system SHALL translate only the bookmark owner-and-URL uniqueness conflict into `BOOKMARK_ALREADY_EXISTS`. Other database uniqueness conflicts SHALL remain unexpected errors and follow global error handling.

#### Scenario: Website constraint failure is not reported as duplicate bookmark
- **WHEN** bookmark creation encounters a uniqueness violation unrelated to the bookmark owner-and-URL rule
- **THEN** the system SHALL NOT return `BOOKMARK_ALREADY_EXISTS`
