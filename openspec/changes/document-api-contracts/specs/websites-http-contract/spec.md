## Purpose

Documenta la consulta HTTP de los sitios web asociados a los bookmarks del usuario autenticado.

## ADDED Requirements

### Requirement: List user websites
The API SHALL expose `GET /api/websites/` with Bearer JWT authentication.

#### Scenario: Websites are returned
- **WHEN** an authenticated user requests websites
- **THEN** HTTP 200 returns `data.websites` and message `Se han cargado los sitios web exitosamente`.
- **AND** each item contains `id`, `domain`, `name`, `faviconUrl`, `primaryColor`, `bookmarkCount`, `createdAt`, and `updatedAt`.

## Errors

Missing or invalid Bearer credentials return HTTP 401 using the standard error envelope. Unexpected service failures are handled as HTTP 500 `INTERNAL_ERROR`.

## Discrepancies

This route has no request body, query, or params validation and has no route-specific OpenAPI annotation.
