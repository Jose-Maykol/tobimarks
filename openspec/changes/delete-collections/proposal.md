## Why

La API permite crear y administrar colecciones, pero no eliminarlas. Los usuarios deben poder retirar una colección sin perder los bookmarks que organizaron dentro de ella.

## What Changes

- Añadir una operación autenticada para eliminar una colección por su identificador.
- Limitar la eliminación a colecciones que pertenezcan al usuario autenticado.
- Liberar los bookmarks asociados estableciendo su colección en nulo, sin eliminarlos ni eliminar sus relaciones con websites, tags o historial.
- Devolver el error de colección no encontrada cuando el identificador no exista o no pertenezca al usuario.

## Capabilities

### New Capabilities

- `collection-deletion`: Eliminación de colecciones propiedad del usuario y liberación segura de sus bookmarks asociados.

### Modified Capabilities

<!-- Ninguna. -->

## Impact

- Afecta las rutas, controlador, servicio, repositorio, tipos y documentación OpenAPI del módulo `collection`.
- Expone `DELETE /api/collections/:id`.
- Reutiliza la relación existente `bookmarks.collection_id ... ON DELETE SET NULL`; no requiere cambios de esquema ni dependencias nuevas.
