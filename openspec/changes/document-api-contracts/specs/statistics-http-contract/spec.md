## Purpose

Documenta el resumen estadístico HTTP que muestra las métricas agregadas del usuario autenticado.

## ADDED Requirements

### Requirement: General statistics summary
The API SHALL expose `GET /api/statistics/summary` with Bearer JWT authentication and no request parameters.

#### Scenario: Summary is returned
- **WHEN** an authenticated user requests the summary
- **THEN** HTTP 200 returns `{ success: true, data: { summary }, message: "General statistics summary retrieved successfully" }`.
- **AND** `summary` contains numeric `totalBookmarks`, `totalCollections`, and `totalTags`.

## Errors

Missing or invalid Bearer credentials return HTTP 401 with the standard error envelope. Unhandled failures use HTTP 500 and `INTERNAL_ERROR`.

## Discrepancies

The route has no route-specific OpenAPI annotation and does not declare an explicit `next` error handler in its controller adapter.
