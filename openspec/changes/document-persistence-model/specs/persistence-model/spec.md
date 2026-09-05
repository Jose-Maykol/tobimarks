## Purpose

Esta capability establece una referencia verificable del modelo PostgreSQL implementado y de los contratos que usan los repositorios, para que relaciones, ownership, eliminación, vectores e integridad transaccional puedan entenderse y comprobarse sin inferencias.

## ADDED Requirements

### Requirement: Documented migration history
La documentación SHALL describir las migraciones SQL 001 a 010 en orden, sus tablas, extensiones, restricciones e índices, y SHALL indicar que `scripts/migrate.ts` registra archivos aplicados en `schema_migrations` y ejecuta cada migración pendiente dentro de una transacción.

#### Scenario: Migration inventory is complete
- **WHEN** se revisa la referencia de persistencia
- **THEN** aparecen las diez migraciones numeradas y cada una se vincula con los objetos que crea o altera

#### Scenario: Applied migrations are not rewritten
- **WHEN** se incorpora una migración futura
- **THEN** la referencia indica que debe conservar el historial y usar un número posterior, sin editar 001-010

### Requirement: Documented relational model
La documentación SHALL enumerar las entidades y relaciones implementadas: usuario a refresh tokens, colecciones y bookmarks; website a bookmarks; colección a bookmarks; bookmarks y tags mediante `bookmark_tags`; y bookmark a `bookmark_access_logs`. SHALL incluir las acciones de borrado declaradas: `CASCADE`, `SET NULL` y la ausencia de acción explícita donde corresponda.

#### Scenario: Entity relationship can be reconstructed
- **WHEN** un lector consulta la referencia
- **THEN** puede identificar la clave primaria UUID, las columnas de relación y la cardinalidad operativa de cada tabla sin leer el código fuente

#### Scenario: Referential deletion behavior is explicit
- **WHEN** se evalúa borrar un usuario, colección, bookmark o tag
- **THEN** la referencia distingue los efectos declarados por SQL, incluidos refresh tokens en cascada, bookmarks que dejan `collection_id` en `NULL` y filas puente/log que siguen al bookmark en cascada

### Requirement: Documented persistence constraints and indexes
La documentación SHALL registrar unicidad, nulabilidad, valores por defecto y todos los índices definidos por las migraciones, incluyendo la unicidad parcial `(user_id, url)` para bookmarks no eliminados, índices de refresh token, búsquedas de websites, ordenamiento de bookmarks, `search_vector`, colecciones por `collection_id` y la unicidad `(user_id, slug)` de tags.

#### Scenario: Active bookmark URL uniqueness is explained
- **WHEN** se comparan dos bookmarks del mismo usuario
- **THEN** la referencia explica que URLs iguales solo pueden coexistir si al menos uno tiene `deleted_at` distinto de `NULL`

#### Scenario: Index purpose is traceable
- **WHEN** se analiza una consulta de búsqueda, filtro u ordenamiento documentada
- **THEN** la referencia permite localizar el índice SQL relacionado y señala si es parcial, GIN, trigram o `ivfflat`

### Requirement: Documented soft delete and ownership boundaries
La documentación SHALL describir `bookmarks.deleted_at` como soft delete, las lecturas normales que excluyen `deleted_at IS NULL` y el requisito de filtrar recursos por el usuario autenticado. SHALL distinguir este contrato esperado de los puntos donde el código inspeccionado actualmente consulta o muta solo por UUID o cuenta eliminados.

#### Scenario: Normal bookmark reads exclude deleted rows
- **WHEN** se consulta un bookmark por usuario o se listan sus websites
- **THEN** la referencia identifica el filtro `deleted_at IS NULL` presente en esos caminos

#### Scenario: Ownership divergence is factual
- **WHEN** se revisan operaciones de existencia, borrado, favorito, acceso, tags, colecciones o estadísticas
- **THEN** la referencia marca como observación los métodos que no incluyen `user_id` o `deleted_at` en su SQL, sin presentarlos como comportamiento corregido

### Requirement: Documented vector and search representation
La documentación SHALL indicar que collections, bookmarks y tags almacenan `VECTOR(1536)`, que bookmarks también tiene `tsvector search_vector`, y que collections/tags exponen búsquedas de similitud mediante distancia `<=>`, umbral de similitud y aislamiento por `user_id` donde el repositorio lo implementa.

#### Scenario: Vector dimension is consistent in SQL
- **WHEN** se inspeccionan las tablas con embeddings
- **THEN** la referencia identifica dimensión 1536, extensión `vector` e índices `ivfflat` existentes para collections y tags

#### Scenario: SQL and DTO representation divergence is recorded
- **WHEN** se comparan columnas vectoriales con modelos/DTOs
- **THEN** la referencia declara como hecho que TypeScript usa `number[]` (y que collection lo marca opcional), sin afirmar que exista conversión tipada completa ni proponer cambios

### Requirement: Documented repository and transaction contract
La documentación SHALL explicar que las operaciones normales usan `IDatabaseContext`, que los repositorios traducen `snake_case` a `camelCase` mediante alias SQL y que algunos métodos aceptan `IQueryRunner` para compartir conexión. SHALL describir que `UnitOfWork` mantiene un cliente, ejecuta `BEGIN`, confirma con `COMMIT`, revierte con `ROLLBACK` ante error y libera el cliente con `dispose`.

#### Scenario: Shared transaction boundary is identifiable
- **WHEN** un caso de uso modifica varias entidades relacionadas
- **THEN** la referencia describe el flujo `begin -> repository queries with the same runner -> commit`, con rollback si falla la unidad

#### Scenario: Pool resources are released
- **WHEN** termina una consulta normal o una unidad de trabajo
- **THEN** la referencia indica que el cliente normal vuelve al pool y que `commit`, `rollback` o `dispose` liberan el cliente transaccional
