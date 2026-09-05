## Why

La API ya expone operaciones de autenticación, organización y consulta de bookmarks, pero su contrato HTTP está distribuido entre rutas, esquemas Valibot, controladores y anotaciones OpenAPI parciales. Esta propuesta consolida el contrato realmente implementado para que clientes y mantenedores conozcan métodos, paths, autenticación, validaciones, respuestas, errores y paginación sin cambiar el comportamiento.

## What Changes

- Documentar los endpoints implementados bajo `/api` para auth, bookmarks, collections, tags, websites, users y statistics.
- Documentar cuerpos, parámetros, queries transformadas, valores por defecto, respuestas exitosas y metadatos de paginación.
- Documentar autenticación Bearer JWT y el formato de errores de middleware, dominio e inesperados.
- Registrar discrepancias observadas entre rutas, validación, controladores y Swagger, sin corregirlas en código de aplicación.
- No se modifican endpoints, esquemas, controladores, dependencias ni migraciones.

## Capabilities

### New Capabilities

- `auth-http-contract`: Contrato HTTP implementado para Google auth, refresh y logout.
- `bookmarks-http-contract`: Contrato HTTP implementado para crear, listar y operar bookmarks.
- `collections-http-contract`: Contrato HTTP implementado para colecciones paginadas y CRUD parcial.
- `tags-http-contract`: Contrato HTTP implementado para listar, crear, actualizar y eliminar tags.
- `websites-http-contract`: Contrato HTTP implementado para listar websites del usuario.
- `user-http-contract`: Contrato HTTP implementado para perfil y configuración del usuario.
- `statistics-http-contract`: Contrato HTTP implementado para el resumen estadístico.

### Modified Capabilities

Ninguna. No existe una especificación previa de estas capacidades en `openspec/specs/`.

## Impact

- Añade únicamente artefactos OpenSpec en este cambio.
- Fuentes inspeccionadas: `src/app.ts`, `src/modules/**/routes`, `schemas`/`squemas`, `controllers`, `src/common/{middlewares,types,utils}` y `src/swagger.ts`.
- No requiere cambios de runtime ni nuevas dependencias.
- Las discrepancias documentadas pueden requerir una decisión posterior si se desea alinear implementación y OpenAPI.
