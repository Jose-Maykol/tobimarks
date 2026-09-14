## Why

La API tiene reglas de unicidad incompletas e inconsistentes: las colecciones permiten nombres duplicados pese a que el servicio espera rechazarlos, y una URL de bookmark archivada se reporta como duplicado sin ofrecer recuperación. Además, conflictos de restricciones no se clasifican por constraint y la actualización de tags puede responder con un error interno ante un slug duplicado.

Corregir estas reglas protege la integridad de datos, da una recuperación predecible a recursos archivados y mantiene respuestas HTTP de negocio estables para clientes concurrentes.

## What Changes

- Al crear un bookmark cuya URL normalizada ya pertenece al usuario y está archivado, restaurar el mismo registro en vez de crear uno duplicado o responder `409`.
- Mantener `409 BOOKMARK_ALREADY_EXISTS` para una URL ya activa y diferenciar conflictos de bookmark de restricciones no relacionadas.
- Añadir una operación autenticada para archivar y restaurar bookmarks, con respuesta que devuelva el estado final.
- Hacer único por usuario el nombre normalizado de collections, mediante migración y validación de conflictos en creación y actualización.
- Unificar la normalización de slugs de tags y traducir conflictos de slug en creación y actualización a `409 TAG_ALREADY_EXISTS`.
- Eliminar la declaración duplicada de la ruta `DELETE /api/bookmarks/:id` y validar parámetros UUID en todas las mutaciones de bookmark afectadas.
- **BREAKING**: la creación de collections con un nombre que ya existe para el mismo usuario pasará a devolver `409` cuando la base contenga datos sin duplicados; los duplicados históricos deberán resolverse antes de aplicar la restricción.

## Capabilities

### New Capabilities
- `bookmark-lifecycle`: archivado, restauración automática durante creación y manejo de duplicados de bookmarks.
- `resource-uniqueness`: reglas de unicidad normalizada y respuestas de conflicto para collections y tags.

### Modified Capabilities

- Ninguna. El repositorio no contiene especificaciones principales existentes.

## Impact

- Código: módulo `bookmark` (schema, rutas, controller, use cases, repositorio, excepciones y DI), módulo `collection` (migración, repositorio y servicio) y módulo `tag` (use case de actualización y normalización).
- API: se añaden endpoints de archive/restore; `POST /api/bookmarks` puede devolver bookmark restaurado con `200` en vez de crear uno con `201`; collections duplicadas responden `409`.
- Persistencia: nueva migración para detectar y bloquear duplicados normalizados de collections; posibles índices de soporte para lookup de URL y estado de bookmarks.
- Documentación: OpenAPI, README y `DATABASE.md` deben reflejar contratos e invariantes nuevos.
