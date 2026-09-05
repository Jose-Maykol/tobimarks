## Context

El contrato se reconstruye desde el montaje real de Express y el flujo route -> middleware -> controller. Todas las rutas de negocio se montan bajo `/api`; los routers de bookmarks, collections, tags, users, websites y statistics aplican `authMiddleware` a nivel de router. Auth no aplica autenticación Bearer.

## Goals / Non-Goals

**Goals:**

- Mantener una referencia verificable del contrato observable por clientes HTTP.
- Separar el contrato por módulo y conservar las discrepancias como notas explícitas.

**Non-Goals:**

- Resolver inconsistencias de runtime u OpenAPI durante este cambio.
- Crear pruebas de integración o alterar la implementación.

## Decisions

- Crear una especificación independiente por superficie pública para que cada módulo pueda evolucionar de forma aislada.
- Usar los esquemas Valibot como fuente de verdad para entradas validadas y anotar expresamente las rutas que no pasan por `validateRequest`.
- Usar `ApiResponseBuilder` y las ramas de los controladores para describir cuerpos y status reales.
- Describir tipos de entidad solo hasta los campos que el controlador serializa; no inferir campos no expuestos.
- Describir errores conocidos con sus status y `errorCode`, y separar validación (`errors`) del formato estándar de errores.

### Fuentes Y Decisiones

- Prefijo efectivo: `src/app.ts` monta cada router en `/api/<recurso>`.
- Éxito estándar: `{ success: true, data, message?, meta? }`.
- Error de aplicación: `{ success: false, message, errorCode }`.
- Error de validación: `{ success: false, message: "Validation failed", errors: [...] }`; no incluye `errorCode`.
- Error inesperado: HTTP 500 con `INTERNAL_ERROR` mediante el manejador global.
- `page` y `limit` se reciben como query strings, se transforman a números y por defecto son `1` y `10`; `limit` admite 1..100. `meta` usa `page`, `perPage`, `total` y `totalPages`.

### Discrepancias Registradas

- `src/swagger.ts` define seguridad global y respuestas `ErrorResponse` con `error`, mientras la implementación devuelve `message` y `errorCode`; las anotaciones existentes son parciales.
- Las anotaciones OpenAPI de auth no reflejan completamente los cuerpos reales ni el formato de éxito en refresh/logout.
- `PATCH /bookmarks/:id`, `PATCH /bookmarks/:id/access`, favoritos, eliminación y varias operaciones de tags no tienen validación explícita de params/body en las rutas.
- `tag.routes.ts` registra `authMiddleware` dos veces; el segundo registro no agrega una superficie nueva.
- `bookmark.routes.ts` registra `DELETE /:id` dos veces; la especificación lo documenta una sola vez porque Express expone el mismo path dos veces con el mismo handler.
- `CollectionController.create` responde al conflicto y luego llama a `next(error)`, y `UserController.getProfile` hace algo análogo para not-found; esto puede producir intento de doble manejo. Se registra, no se interpreta como comportamiento adicional garantizado.

## Risks / Trade-offs

- [Implementación y Swagger pueden divergir] -> Las especificaciones citan el runtime como fuente de verdad y conservan la discrepancia para una futura alineación explícita.
- [La validación incompleta puede sorprender a clientes] -> Cada spec identifica las rutas sin `validateRequest`; no se inventan restricciones de UUID.
- [Un cambio de runtime puede dejar obsoleta la documentación] -> La verificación compara el cambio con rutas, schemas y controllers antes de archivarlo.

## Migration Plan

No hay migración de runtime. Al completarse la revisión, los artefactos pueden archivarse como especificaciones base; si se corrige el comportamiento después, deberá abrirse otro cambio que modifique la capacidad correspondiente.
