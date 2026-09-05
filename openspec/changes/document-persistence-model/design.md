## Context

Según `ARCHITECTURE.md`, Tobimarks usa PostgreSQL mediante `pg`, sin ORM. Las migraciones numeradas viven en `migrations/` y `scripts/migrate.ts` mantiene `schema_migrations`; `DatabaseContext` administra el pool y `UnitOfWork` comparte un cliente para transacciones. El conocimiento de columnas y relaciones está distribuido entre SQL y los repositorios de los módulos.

La propuesta es documental. No se debe inferir un comportamiento no expresado por el SQL o por las consultas actuales. Las diferencias entre esquema y tipos, y las consultas que no filtran ownership o soft delete, se conservarán como observaciones fechadas por el estado inspeccionado.

## Goals / Non-Goals

**Goals:**

- Crear una capability OpenSpec autocontenida que cubra esquema, relaciones, restricciones, índices, vectores, ownership, repositorios y transacciones.
- Usar las migraciones como fuente de verdad para el esquema y los repositorios como fuente de verdad para el acceso efectivo.
- Hacer verificable el inventario mediante escenarios concretos y trazabilidad a archivos fuente.

**Non-Goals:**

- Corregir SQL, modelos, DTOs, repositorios, UnitOfWork o migraciones.
- Añadir tablas, índices, triggers, RLS, ORM, pruebas o dependencias.
- Convertir observaciones de divergencia en requisitos de refactor o promesas de runtime.

## Decisions

- **Una capability nueva `persistence-model`.** No existen specs base de persistencia en `openspec/specs/`; una capability única evita fragmentar un modelo que cruza core y módulos.
- **SQL como autoridad estructural.** Tipos, defaults, FK, `ON DELETE`, extensiones e índices se derivan de 001-010. Los modelos y DTOs se documentan como contratos de aplicación, no como alteraciones del esquema.
- **Repositorios como autoridad de comportamiento de lectura/escritura.** Las reglas efectivas de filtros, alias, joins, parámetros y runners se extraen de las consultas actuales. Esto permite registrar explícitamente métodos que no incluyen ownership o soft delete.
- **Divergencias en una sección factual.** Se describen casos como columnas no proyectadas, tipos vectoriales representados por arrays, retornos parciales y conteos que no excluyen eliminados. No se añade una migración de compatibilidad ni código puente.
- **Transacciones descritas como contrato de infraestructura.** La secuencia y el ciclo de vida se documentan desde `IUnitOfWork`, `DatabaseContext` y sus usos en casos de uso; no se rediseña el patrón.
- **Sin cambios de despliegue.** La documentación no requiere ejecutar migraciones ni modificar la base de datos.

## Persistence Inventory

| Objeto | Persistencia y relaciones observadas |
| --- | --- |
| `users` | UUID; `google_id` y `email` únicos; configuración JSONB; estado activo y timestamps. Es padre de `refresh_tokens`, `collections`, `bookmarks` y `tags`, todos con `ON DELETE CASCADE`. |
| `refresh_tokens` | Hash único, expiración, estado activo, datos de dispositivo/red y unicidad `(user_id, device_id)`; la 009 agrega los campos de sesión y recrea esa constraint. |
| `websites` | Dominio único, metadatos y contador; padre de bookmarks mediante `website_id` sin acción `ON DELETE` explícita. Incluye índice de nombre, trigram, creación y contador. |
| `collections` | Pertenece a un usuario; nombre, metadatos, contador y `VECTOR(1536)`. `bookmarks.collection_id` usa `ON DELETE SET NULL`; embedding tiene índice `ivfflat` L2. |
| `bookmarks` | Pertenece a usuario y website, puede pertenecer a colección; URL/metadatos, favoritos, archivado, acceso, `VECTOR(1536)`, `tsvector`, timestamps y `deleted_at`. Tiene unicidad parcial activa por usuario. |
| `tags` | Pertenece a usuario; nombre, slug único por usuario, color, descripción y `VECTOR(1536)`. Embedding tiene índice `ivfflat` L2. |
| `bookmark_tags` | Tabla puente con UUID propio, FKs a bookmark/tag en cascada, timestamp y unicidad del par. |
| `bookmark_access_logs` | Accesos de bookmark con timestamp; FK en cascada e índices por bookmark y fecha. |
| `allowed_emails` | Lista global de emails únicos con UUID y timestamp; no tiene FK a users. |

Extensiones declaradas: `uuid-ossp`, `vector` y `pg_trgm`. `scripts/migrate.ts` crea `schema_migrations` con `filename` único y `applied_at`, ordena archivos `.sql` alfabéticamente y hace `BEGIN`/`COMMIT` por archivo; ante error hace `ROLLBACK` y no registra el archivo.

## Observed Divergences

Estas observaciones son parte del registro del estado inspeccionado y no tareas de corrección:

- `Bookmark` declara `searchVector` y `deletedAt`, pero `findById` no proyecta `deleted_at` y `create` devuelve solo `id`, `url`, `title` y `description`; además, el embedding de la tabla no forma parte del DTO de creación.
- `Collection.embedding` es opcional y `Tag.embedding` es `number[] | null`, mientras SQL exige `VECTOR(1536)` cuando hay valor; los repositorios serializan explícitamente algunos arrays a la sintaxis vectorial, pero no todos los retornos proyectan el embedding.
- `Website` modela `createdAt`/`updatedAt` como fechas de la entidad, pero `findByUserId` los deriva de `MAX` sobre bookmarks; `CreateWebsiteDto` no incluye `primaryColor`.
- Las lecturas normales de bookmarks y websites filtran `deleted_at IS NULL`, pero `existsByIdAndUserId`, `softDelete`, `updateFavoriteStatus`, `registerAccess` y las estadísticas no añaden ese filtro en sus consultas observadas.
- Varias mutaciones de bookmark/tag reciben solo un UUID en el repositorio; los casos de uso pueden validar ownership antes, pero el límite no está expresado uniformemente en cada SQL. `CollectionRepository.update` y varias operaciones de tags también actualizan por UUID sin `user_id` en la sentencia.
- `TagRepository.findById` no filtra por usuario y algunos retornos de tags omiten `color` o `embedding` pese a que el modelo los declara.

## Risks / Trade-offs

- [Riesgo] El esquema y los repositorios pueden divergir después de crear la referencia → Mitigación: declarar el SQL y las consultas fuente, y tratar el documento como snapshot verificable del cambio.
- [Riesgo] Una observación puede interpretarse como una garantía de seguridad → Mitigación: etiquetar claramente el comportamiento esperado frente a las consultas que actualmente carecen de filtro.
- [Riesgo] Los índices `ivfflat` pueden requerir configuración/condiciones de operación no capturadas por el DDL → Mitigación: documentar únicamente extensión, operador, listas y consulta implementada.
- [Riesgo] El runner opcional puede hacer que una operación relacionada quede fuera de una transacción → Mitigación: registrar qué repositorios aceptan `IQueryRunner` y limitar la afirmación transaccional a los usos observados.

## Migration Plan

1. Crear y validar los cuatro artefactos del change con OpenSpec.
2. Revisar que el diff solo contenga `openspec/changes/document-persistence-model/`.
3. No ejecutar `db:migrate`: no hay cambio de esquema.
4. Para rollback documental, eliminar o archivar este change; no revertir ni editar migraciones aplicadas.

## Open Questions

No quedan preguntas que cambien el alcance, la especificación o el desglose de tareas.
