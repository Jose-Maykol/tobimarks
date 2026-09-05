## Purpose

Documenta la gestión HTTP de bookmarks del usuario, incluyendo filtros, estados y relaciones.

## ADDED Requirements

All endpoints below require `Authorization: Bearer <JWT>`.

### Requirement: Bookmark operations
The API SHALL expose `POST /api/bookmarks/`, `GET /api/bookmarks/`, `DELETE /api/bookmarks/:id`, `PATCH /api/bookmarks/:id`, `PATCH /api/bookmarks/:id/collection`, `DELETE /api/bookmarks/:id/collection`, `PATCH /api/bookmarks/:id/access`, `PATCH /api/bookmarks/:id/favorite`, and `DELETE /api/bookmarks/:id/favorite`.

#### Scenario: Create bookmark
- **WHEN** the body contains non-empty valid URL `url` and optional UUID-or-null `collectionId`
- **THEN** HTTP 201 returns `data.bookmark` with `id`, `url`, `title`, `description`, plus message `Bookmark created successfully`; the supplied collection ID is not documented as ownership-validated by the current implementation.

#### Scenario: List bookmarks
- **WHEN** `GET /api/bookmarks/` is called with optional pagination and filters
- **THEN** HTTP 200 returns `data.bookmarks` and `meta` with `page`, `perPage`, `total`, `totalPages`.

#### Scenario: Bookmark list query
- **WHEN** query values are supplied
- **THEN** `page`/`limit` become numbers (defaults 1/10, limit 1..100); `isFavorite` converts from string to boolean, `collectionId` converts `null` to null, `tags` splits comma-separated values, `sortBy` is `createdAt|lastAccessedAt|accessCount`, `sortDirection` is `asc|desc`, and `accessedWithin` is `week|month|all`.

#### Scenario: Bookmark state mutation succeeds
- **WHEN** an existing owned bookmark is targeted
- **THEN** the relevant PATCH/DELETE returns HTTP 200 with a success envelope and the controller's operation message; favorite operations include `data.bookmark.id` and `isFavorite`.

## Errors

Create maps URL forbidden/not found/timeout/fetch failure to 403/404/408/500 with codes `URL_FORBIDDEN`, `URL_NOT_FOUND`, `URL_TIMEOUT`, `URL_FETCH_FAILED`; duplicate creation is 409 `BOOKMARK_ALREADY_EXISTS`. Known missing bookmarks are 404 `BOOKMARK_NOT_FOUND`; missing tags during update are 404 `TAG_NOT_FOUND`. Missing/invalid Bearer credentials are 401 with `ACCESS_HEADER_MISSING`, `ACCESS_TOKEN_MISSING`, or `ACCESS_TOKEN_INVALID`.

## Discrepancies

The update, id-param, access, favorite and collection-removal routes do not attach Valibot validation. The router contains `DELETE /:id` twice; this spec records one public operation.
