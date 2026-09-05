## 1. Proposal And Scope

- [x] 1.1 Confirmar el alcance documental y la ausencia de cambios de aplicación o migraciones existentes
- [x] 1.2 Revisar que la capability `persistence-model` sea nueva y esté declarada con la ruta exacta

## 2. Schema Inventory

- [x] 2.1 Registrar migraciones 001-010, extensiones, tablas, columnas, defaults, constraints y acciones `ON DELETE`
- [x] 2.2 Registrar `schema_migrations`, orden de ejecución, idempotencia y rollback transaccional ante fallo del script `migrate.ts`
- [x] 2.3 Registrar índices B-tree, parciales, GIN, trigram, full-text e `ivfflat` junto con su propósito observable

## 3. Application Persistence Contracts

- [x] 3.1 Contrastar entidades y DTOs de user, auth, bookmark, collection y tag con sus columnas SQL
- [x] 3.2 Documentar repositorios de módulos, alias `snake_case`/`camelCase`, queries, joins y runners opcionales
- [x] 3.3 Documentar ownership, soft delete de bookmarks y cada divergencia observada como hecho, no como corrección
- [x] 3.4 Documentar `VECTOR(1536)`, `tsvector`, serialización desde `number[]` y consultas de similitud con aislamiento por usuario

## 4. Transactions And Verification

- [x] 4.1 Documentar `DatabaseContext`, `IQueryRunner`, pool, liberación de clientes y `UnitOfWork` con begin/commit/rollback/dispose
- [x] 4.2 Ejecutar `openspec validate document-persistence-model --strict` y corregir únicamente errores de artefactos
- [x] 4.3 Ejecutar `openspec status --change document-persistence-model` y confirmar los cuatro artefactos completos
- [x] 4.4 Revisar `git diff --stat` y `git status` para confirmar que no se modificaron código ni migraciones existentes
