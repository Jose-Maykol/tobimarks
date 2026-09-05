## Why

El modelo de persistencia está repartido entre las migraciones SQL, los modelos TypeScript y los repositorios, sin un contrato único que explique sus relaciones, límites de ownership y reglas transaccionales. Esta propuesta crea una referencia OpenSpec basada en el estado implementado en PostgreSQL y en `src`, sin alterar el comportamiento ni el historial de migraciones.

## What Changes

- Documentar PostgreSQL como almacén relacional accedido mediante consultas SQL parametrizadas, incluyendo `schema_migrations` y el orden de las migraciones 001-010.
- Documentar las tablas `users`, `refresh_tokens`, `websites`, `collections`, `bookmarks`, `tags`, `bookmark_tags`, `bookmark_access_logs` y `allowed_emails`.
- Documentar claves primarias, restricciones únicas, claves foráneas, acciones `ON DELETE`, timestamps, contadores, soft delete e índices, incluidos GIN, trigramas, full-text y `ivfflat`.
- Documentar el uso de `VECTOR(1536)` para embeddings y las consultas de similitud de colecciones y etiquetas.
- Documentar los contratos de `DatabaseContext`, `IQueryRunner`, repositorios de módulos y `IUnitOfWork`, incluyendo adquisición/liberación de clientes, `BEGIN`, `COMMIT` y `ROLLBACK`.
- Registrar como hechos las divergencias observadas entre SQL, modelos y DTOs, sin proponer corregirlas en este change.
- No modificar código de aplicación, migraciones existentes, dependencias ni endpoints.

## Capabilities

### New Capabilities

- `persistence-model`: Referencia verificable del esquema PostgreSQL y de sus contratos de persistencia, ownership, soft delete, vectores y transacciones.

### Modified Capabilities

## Impact

- Nuevos artefactos OpenSpec bajo `openspec/changes/document-persistence-model/`.
- Fuentes inspeccionadas: `migrations/`, `scripts/migrate.ts`, `src/core/database/`, modelos y repositorios de `auth`, `bookmark`, `collection`, `tag`, `user` y `statistics`.
- No hay impacto en runtime, API pública, esquema de base de datos, datos existentes o despliegue.
