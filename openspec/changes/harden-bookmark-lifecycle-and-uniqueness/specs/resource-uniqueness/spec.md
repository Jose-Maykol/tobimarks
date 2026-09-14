## Purpose

Keep user-scoped collection and tag names semantically unique while returning deterministic business errors instead of database failures.

## ADDED Requirements

### Requirement: Normalized collection name uniqueness
The system SHALL permit at most one collection per user for each name after trimming leading and trailing whitespace and comparing case-insensitively. Collection names belonging to different users SHALL remain independent.

#### Scenario: Case and whitespace variant is rejected on creation
- **WHEN** a user creates ` work ` while that user already owns collection `Work`
- **THEN** the system SHALL return `409 Conflict` with error code `COLLECTION_ALREADY_EXISTS`

#### Scenario: Case and whitespace variant is rejected on update
- **WHEN** a user renames a collection to a normalized name used by another collection owned by that user
- **THEN** the system SHALL return `409 Conflict` with error code `COLLECTION_ALREADY_EXISTS` and leave the target collection unchanged

#### Scenario: Same normalized name for different users
- **WHEN** different users create collections with the same normalized name
- **THEN** the system SHALL create both collections

#### Scenario: Migration detects historical normalized duplicates
- **WHEN** existing collection rows contain duplicate normalized names for one user during migration
- **THEN** the migration SHALL fail before enforcing the new uniqueness rule and SHALL identify that duplicate cleanup is required

### Requirement: Canonical tag slug uniqueness errors
The system SHALL derive tag slugs from names using one canonical normalization for creation and update, including lowercase and strict character normalization. A duplicate owner-and-slug conflict SHALL return `409 Conflict` with error code `TAG_ALREADY_EXISTS`.

#### Scenario: Equivalent tag name is rejected on update
- **WHEN** a user renames a tag to a name whose canonical slug belongs to another tag owned by that user
- **THEN** the system SHALL return `409 Conflict` with error code `TAG_ALREADY_EXISTS` and leave the target tag unchanged

#### Scenario: Equivalent tag name is rejected on creation
- **WHEN** a user creates a tag whose canonical slug is already owned by that user
- **THEN** the system SHALL return `409 Conflict` with error code `TAG_ALREADY_EXISTS`

#### Scenario: Canonical slugs remain user-scoped
- **WHEN** different users create tags with the same canonical slug
- **THEN** the system SHALL create both tags

### Requirement: Constraint-aware resource conflict mapping
The system SHALL map a database uniqueness violation to a domain conflict only when the violated constraint belongs to the resource operation being performed.

#### Scenario: Recognized collection constraint maps to conflict
- **WHEN** collection creation or update violates the collection normalized-name uniqueness constraint
- **THEN** the system SHALL return `409 Conflict` with error code `COLLECTION_ALREADY_EXISTS`

#### Scenario: Unrecognized tag database failure is not misclassified
- **WHEN** tag creation or update encounters a database failure other than its owner-and-slug uniqueness constraint
- **THEN** the system SHALL NOT return `TAG_ALREADY_EXISTS` and SHALL delegate the failure to global error handling
