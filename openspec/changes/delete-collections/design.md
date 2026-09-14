## Context

El módulo `collection` ya dispone de rutas, controlador, servicio y repositorio para operaciones protegidas por propietario. La clave foránea de `bookmarks.collection_id` ya usa `ON DELETE SET NULL`, por lo que PostgreSQL libera los bookmarks al borrar la colección.

## Goals / Non-Goals

**Goals:**

- Incorporar la eliminación de una colección del usuario autenticado.
- Conservar la integridad de los bookmarks asociados al liberar su referencia a la colección.
- Mantener los formatos de respuesta y error existentes del módulo.

**Non-Goals:**

- Eliminar, archivar, reasignar o modificar los bookmarks liberados.
- Cambiar el esquema, las relaciones de tags, websites o el historial de accesos.
- Añadir borrado masivo de colecciones.

## Decisions

### Eliminar con una mutación condicionada por propietario

La persistencia eliminará usando el identificador de colección y el identificador del usuario autenticado en la misma operación. Así se preserva el aislamiento de datos y una colección inexistente o ajena tiene el mismo resultado observable. Alternativamente, se podría comprobar la colección y borrarla en dos consultas, pero añade una ventana entre ambas consultas sin aportar comportamiento adicional.

### Delegar la liberación de bookmarks a la clave foránea

La operación borrará únicamente la fila de `collections`. La restricción `ON DELETE SET NULL` actualizará atómicamente `bookmarks.collection_id` a `NULL`, sin eliminar bookmarks ni sus relaciones. Alternativamente, el servicio podría ejecutar un `UPDATE bookmarks` antes del `DELETE`, pero duplicaría una garantía ya impuesta por la base de datos y requeriría una transacción explícita.

### Reutilizar el error de colección no encontrada

Si la mutación no elimina una fila, el servicio devolverá el error de dominio existente para colección no encontrada. Esto evita revelar la existencia de recursos de otros usuarios y conserva el comportamiento de lectura y actualización del módulo.

## Risks / Trade-offs

- [Una migración futura podría alterar la acción de la clave foránea] → Mantener la semántica `ON DELETE SET NULL` documentada y verificarla al cambiar la relación.
- [Un contador de colección queda eliminado junto con su colección] → Es intencional; los bookmarks liberados no requieren actualizar otro contador de colección.

## Migration Plan

1. Desplegar la ruta y la lógica de aplicación, sin migración porque la clave foránea ya cumple el comportamiento requerido.
2. Verificar mediante una colección con y sin bookmarks que los bookmarks permanecen y su `collection_id` queda en nulo.
3. Si fuera necesario revertir, retirar la ruta y la lógica de la aplicación; no hay datos ni esquema que revertir.
