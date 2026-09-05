## Purpose

Documenta la lectura del perfil autenticado y la actualización de sus preferencias de IA vía HTTP.

## ADDED Requirements

All endpoints require `Authorization: Bearer <JWT>`.

### Requirement: User profile and settings
The API SHALL expose `GET /api/users/me` and `PATCH /api/users/me/settings`.

#### Scenario: Read profile
- **WHEN** the authenticated user requests `/me`
- **THEN** HTTP 200 returns `data.user` with the profile returned by the service: `id`, `email`, `displayName`, `avatarUrl`, and `settings`.

#### Scenario: Update settings
- **WHEN** the body contains optional boolean `aiAutoTags` and/or `aiAutoCollections`
- **THEN** HTTP 200 returns the updated `data.user` and message `User settings updated successfully`.

## Errors

Known missing users return HTTP 404 `USER_NOT_FOUND`; invalid settings return HTTP 400 with `errors`; auth failures return HTTP 401.

## Discrepancies

There are no route OpenAPI annotations. The profile controller's not-found branch sends a response and then calls `next`, so double handling is possible; this documentation does not promise a second response.
