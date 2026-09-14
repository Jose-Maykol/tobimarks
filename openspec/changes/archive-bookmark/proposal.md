## Why

Los bookmarks ya persisten el estado `isArchived`, pero la API no ofrece una operación
dedicada para archivarlos. Además, la ruta de eliminación se registra dos veces, lo que
duplica innecesariamente el endpoint y puede confundir su mantenimiento.

## What Changes

- Añadir una operación autenticada para archivar un bookmark del usuario.
- Persistir el cambio de estado únicamente para bookmarks activos que pertenezcan al
  usuario autenticado y devolver la respuesta estándar del recurso actualizado.
- Rechazar solicitudes sobre bookmarks inexistentes, eliminados o de otro usuario con
  el error de dominio existente.
- Eliminar la declaración duplicada de `DELETE /api/bookmarks/:id`.
- Documentar el nuevo endpoint de archivado en OpenAPI y en el resumen de endpoints.

## Capabilities

### New Capabilities
- `bookmark-archiving`: Archivar bookmarks propios mediante una operación HTTP autenticada.

### Modified Capabilities

- Ninguna.

## Impact

- Afecta las rutas, controlador, caso de uso o servicio y repositorio del módulo
  `bookmark`.
- Añade un endpoint bajo `/api/bookmarks/:id` sin cambios de esquema, porque
  `bookmarks.is_archived` ya existe.
- Actualiza la documentación OpenAPI y `README.md`.
