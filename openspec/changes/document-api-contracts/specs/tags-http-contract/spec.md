## Purpose

Documenta las operaciones HTTP disponibles para administrar etiquetas propias y sus datos visibles.

## ADDED Requirements

All endpoints require `Authorization: Bearer <JWT>`.

### Requirement: Tag operations
The API SHALL expose `GET /api/tags/`, `POST /api/tags/`, `PATCH /api/tags/:id`, and `DELETE /api/tags/:id`.

#### Scenario: List tags
- **WHEN** the authenticated user requests the collection
- **THEN** HTTP 200 returns `{ success: true, data: { tags } }`.

#### Scenario: Create tag
- **WHEN** body has non-empty `name` up to 100 characters, optional `description` up to 500 characters, and `color` from the app color list
- **THEN** HTTP 201 returns `data.tag` with `id`, `name`, `slug` and message `Tag created successfully`.

#### Scenario: Update or delete tag
- **WHEN** an existing owned tag is targeted
- **THEN** PATCH returns HTTP 200 with `data.tag` (`id`, `name`, `slug`) and message `Tag updated successfully`; DELETE returns HTTP 200 with `data: null` and message `Tag deleted successfully`.

## Errors

Known missing tags return HTTP 404 `TAG_NOT_FOUND`. Validation failures on create return HTTP 400 with `errors`; other domain errors use the global HTTP 400 envelope.

## Discrepancies

`UpdateTagSchema` exists but is not attached to PATCH, and neither tag id route validates UUID params. The router applies auth middleware twice.
