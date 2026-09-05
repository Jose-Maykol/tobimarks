## Purpose

Define synchronous URL metadata extraction and the user-scoped website view used when bookmarks are created and displayed.

## ADDED Requirements

### Requirement: Extract page metadata synchronously
The system SHALL fetch the submitted URL with a three-second timeout and parse HTML metadata for title, description, Open Graph title, description and image, favicon, and canonical URL. Relative image, favicon, and canonical links SHALL be resolved to absolute URLs; absent values SHALL be null.

#### Scenario: Successful metadata extraction
- **WHEN** the URL responds with parseable HTML before the timeout
- **THEN** the system returns the extracted metadata and bookmark creation continues using it

#### Scenario: Metadata fetch errors
- **WHEN** the remote URL returns 403, 404, another HTTP failure, or times out
- **THEN** the system reports respectively forbidden, not found, fetch-failed, or timeout domain errors and does not persist the bookmark

#### Scenario: Canonical URL from another host
- **WHEN** extracted canonical metadata names a different hostname than the submitted URL
- **THEN** bookmark URL normalization retains the submitted URL

### Requirement: Unify websites by domain
The system SHALL create or reuse one website record per unique domain when creating a bookmark and SHALL associate the bookmark with that website. The authenticated website listing SHALL return only domains represented by that user's non-deleted bookmarks, ordered by domain, with favicon, color, bookmark count, and timestamps.

#### Scenario: Reuse existing website
- **WHEN** a bookmark is created for a domain already present in the website table
- **THEN** the existing website is reused instead of creating a duplicate domain record

#### Scenario: User website ownership boundary
- **WHEN** a user lists websites
- **THEN** the response contains no website grouping derived solely from another user's bookmarks
