## Purpose

Permitir que cada usuario archive sus propios bookmarks para conservarlos sin
eliminarlos ni modificar los bookmarks de otros usuarios.

## ADDED Requirements

### Requirement: Archive a bookmark
The system SHALL provide an authenticated `PATCH /api/bookmarks/:id/archive` operation
that marks the identified active bookmark as archived when it belongs to the authenticated
user.

#### Scenario: Successfully archive an owned active bookmark
- **WHEN** an authenticated user sends `PATCH /api/bookmarks/:id/archive` for an active bookmark they own
- **THEN** the system returns HTTP 200 with the standard success response containing the bookmark ID and `isArchived: true`

#### Scenario: Archive request is repeated
- **WHEN** an authenticated user sends `PATCH /api/bookmarks/:id/archive` for a bookmark they already archived
- **THEN** the system returns HTTP 200 with the bookmark ID and `isArchived: true`

#### Scenario: Bookmark is unavailable to the user
- **WHEN** an authenticated user sends `PATCH /api/bookmarks/:id/archive` for a nonexistent, deleted, or other user's bookmark
- **THEN** the system returns HTTP 404 using the existing bookmark-not-found error response

### Requirement: Preserve bookmark deletion endpoint behavior
The system SHALL register `DELETE /api/bookmarks/:id` exactly once and preserve its
existing authenticated deletion behavior.

#### Scenario: Delete an owned bookmark
- **WHEN** an authenticated user sends `DELETE /api/bookmarks/:id` for a bookmark they own
- **THEN** the system processes the deletion through the single registered endpoint and returns the existing successful deletion response
