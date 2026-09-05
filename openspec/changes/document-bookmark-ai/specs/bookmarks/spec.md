## Purpose

Define the authenticated bookmark lifecycle, organization, access tracking, filtering, and persistence guarantees already provided by the API.

## ADDED Requirements

### Requirement: Authenticated bookmark lifecycle
The system SHALL expose authenticated endpoints to create, list, update, delete, favorite, access, assign, and remove collections from bookmarks. Bookmark creation SHALL accept a valid URL and an optional nullable collection ID, and SHALL return the created bookmark summary with HTTP 201. Normal bookmark reads SHALL exclude soft-deleted records. Collection ownership validation for supplied collection IDs is a known runtime gap and is not guaranteed by this documentation.

#### Scenario: Create bookmark with optional collection
- **WHEN** an authenticated user posts a valid URL and optional collection ID
- **THEN** the system creates a bookmark owned by that user and returns its ID, URL, title, and description

#### Scenario: Duplicate active URL
- **WHEN** the user creates a URL already held by one of their non-deleted bookmarks
- **THEN** the system returns a conflict error and does not create another bookmark

#### Scenario: List bookmarks with filters
- **WHEN** an authenticated user requests bookmarks with pagination and supported favorite, collection, tag, sort, or access-period filters
- **THEN** the system returns only that user's non-deleted bookmarks, tag summaries, and pagination metadata

#### Scenario: Update bookmark and tags
- **WHEN** the owner submits a title, nullable collection ID, or tag ID list
- **THEN** the system updates the supplied fields, verifies every supplied tag belongs to the owner, and maintains collection counters according to the current repository behavior; supplied collection ownership is not independently guaranteed

#### Scenario: Mutate another user's bookmark
- **WHEN** a user attempts to update, delete, favorite, access, or organize a bookmark they do not own
- **THEN** the system treats it as not found and does not mutate it

#### Scenario: Soft delete bookmark
- **WHEN** the owner deletes an existing bookmark
- **THEN** the system records deletion logically, removes it from normal reads, and attempts to decrement its collection counter; the current implementation does not guarantee that both repository writes use the same database transaction

### Requirement: Bookmark access and organization consistency
The system SHALL increment access count, set the last-access timestamp, and append an access log atomically for an existing bookmark. Collection reassignment SHALL decrement the previous collection and increment the new one, and repeating assignment to the current collection SHALL be a no-op.

#### Scenario: Register access
- **WHEN** an owner registers access for an existing bookmark
- **THEN** the bookmark count and timestamp are updated and one access log is recorded

#### Scenario: Remove collection
- **WHEN** an owner removes a bookmark's collection
- **THEN** the bookmark collection becomes null and the previous collection counter is decremented transactionally

#### Scenario: Invalid bookmark input
- **WHEN** a request contains an invalid URL, UUID, title, tag list, pagination value, or unsupported filter choice
- **THEN** request validation rejects it before the business operation
