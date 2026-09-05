## Why

Las capacidades de bookmarks, extracción de metadatos, organización y clasificación asistida por IA ya están implementadas, pero sus contratos operativos no están recogidos en OpenSpec. Documentarlas ahora permite hacer explícitos los flujos HTTP y de workers, sus límites, errores, ownership y comportamiento ante reintentos sin cambiar la aplicación.

## What Changes

- Documentar la creación, consulta, actualización, organización, favoritos, accesos y soft delete de bookmarks.
- Documentar la extracción síncrona de metadatos HTML y la unificación de websites por dominio.
- Documentar tags y collections por usuario, sus payloads, validaciones, embeddings Gemini y búsquedas por similitud.
- Documentar las colas BullMQ, sus payloads, workers, reintentos, backoff, resultados de omisión y tolerancia al reprocesamiento.
- Documentar las tablas e índices PostgreSQL que sustentan bookmarks, websites, collections, tags, relaciones y accesos.
- No modificar código de aplicación, migraciones ni comportamiento existente.

## Capabilities

### New Capabilities

- `bookmarks`: Contrato HTTP y persistencia de bookmarks, incluyendo ownership, filtros, colecciones, tags, favoritos, accesos y eliminación lógica.
- `websites-metadata`: Scraping síncrono de metadatos de URL y consulta de websites asociados al usuario.
- `ai-organization`: Embeddings Gemini para tags y collections, similitud y clasificación automática de bookmarks.
- `bookmark-jobs`: Infraestructura BullMQ, colas de generación AI, payloads, reintentos, errores y procesamiento repetido.

### Modified Capabilities

## Impact

- Documentación OpenSpec en `openspec/changes/document-bookmark-ai/`.
- Implementación de referencia: `src/modules/bookmark`, `src/modules/tag`, `src/modules/collection`, `src/core/embedding`, `src/core/queue` y `src/jobs.ts`.
- Persistencia documentada: migraciones `003` a `008`, con `pgvector` para embeddings de dimensión 1536.
- No se añaden dependencias, endpoints, migraciones ni cambios de runtime.
