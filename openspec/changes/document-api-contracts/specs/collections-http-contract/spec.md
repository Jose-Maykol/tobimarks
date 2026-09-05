## Purpose

Documenta la creación, consulta paginada y actualización HTTP de colecciones pertenecientes al usuario.

## ADDED Requirements

All endpoints require `Authorization: Bearer <JWT>`.

### Requirement: Collection CRUD and pagination
The API SHALL expose `POST /api/collections/`, `GET /api/collections/`, `GET /api/collections/:id`, and `PATCH /api/collections/:id`.

#### Scenario: Create collection
- **WHEN** the body contains `name` as a non-empty string of at most 100 characters
- **THEN** HTTP 201 returns `data.collection` with `id`, `name`, `description`, `color`, `icon` and message `Collection created successfully`.
- **AND** `description` MAY be string or null, `color` MAY be null or an allowed app color, and `icon` defaults to `folder` when omitted.

#### Scenario: List collections
- **WHEN** pagination query is used or omitted
- **THEN** HTTP 200 returns `data.collections` with the serialized collection fields and pagination `meta`; defaults are page 1 and limit 10, maximum limit 100.

#### Scenario: Read or update owned collection
- **WHEN** a valid UUID identifies an owned collection
- **THEN** GET returns HTTP 200 with `data.collection` including `bookmarksCount`, timestamps; PATCH accepts optional name, description, color and icon and returns HTTP 200 with a success message.

## Errors

Unknown collection is HTTP 404 `COLLECTION_NOT_FOUND`; duplicate name is HTTP 409 `COLLECTION_ALREADY_EXISTS`. Invalid body/query/UUID validation is HTTP 400 with `errors`; missing or invalid Bearer credentials are HTTP 401.

## Discrepancies

Update validates the body but does not validate `:id`; the public OpenAPI annotations do not cover these routes.
