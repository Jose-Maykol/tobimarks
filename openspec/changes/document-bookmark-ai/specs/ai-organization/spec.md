## Purpose

Define Gemini-backed normalized embeddings, per-user similarity matching, and automatic tag or collection suggestions for bookmark text.

## ADDED Requirements

### Requirement: Generate normalized Gemini embeddings
The system SHALL generate normalized 1536-dimensional embeddings for single or multiple text inputs using the configured Gemini embedding model and document retrieval task. Missing provider output or provider failures SHALL be propagated as errors.

#### Scenario: Embed one or many texts
- **WHEN** a tag, collection, or similarity operation supplies one or more texts
- **THEN** the system returns one unit-normalized vector per input with the requested 1536-dimensional output configuration

#### Scenario: Embedding provider failure
- **WHEN** Gemini fails or returns no usable embedding values
- **THEN** the operation fails and the error is logged without silently creating or updating the dependent resource

### Requirement: Persist and search user-owned semantic labels
The system SHALL generate embeddings from tag and collection names plus available descriptions, persist them with the resource, and find matching tag or collection IDs only within the requested user's resources at a default similarity threshold of 0.7. Collection name/description changes SHALL regenerate the corresponding embedding. Tag update embedding persistence follows the current repository path and is recorded as an implementation detail requiring verification, rather than a stronger guarantee.

#### Scenario: Similar tags or collections
- **WHEN** text is searched for a user without an explicit threshold
- **THEN** matching IDs are returned in descending similarity order for that user using threshold 0.7

#### Scenario: Cross-user semantic isolation
- **WHEN** text is searched for a user who has labels with matching embeddings
- **THEN** IDs belonging to other users are excluded

#### Scenario: Create or update semantic resource
- **WHEN** an authenticated user creates or changes a tag or collection's semantic text
- **THEN** the resource is stored with the embedding behavior implemented for that resource type, and duplicate names are reported as the existing conflict error where applicable

### Requirement: Apply automatic bookmark organization asynchronously
The system SHALL analyze non-empty bookmark title, description, Open Graph title, and Open Graph description text and apply matching user-owned tags or the best matching collection when the corresponding auto setting enabled the job. Collection automation SHALL not replace an existing collection.

#### Scenario: Assign similar tags
- **WHEN** tag automation processes a bookmark with textual content and the user has matching tags
- **THEN** all matching tag IDs at threshold 0.7 are assigned to the bookmark

#### Scenario: Assign best collection
- **WHEN** collection automation processes an unassigned bookmark with textual content and similar collections exist
- **THEN** only the first, highest-ranked collection ID is assigned and its bookmark counter is incremented

#### Scenario: Skip without prerequisites
- **WHEN** the user has no labels, the bookmark is missing, the bookmark has no text, or collection automation finds the bookmark already assigned
- **THEN** processing completes with a documented success or skip result and makes no invalid assignment
