## 1. Operación de eliminación

- [x] 1.1 Añadir al repositorio la eliminación de una colección filtrada por identificador y propietario, con un resultado que permita detectar si se eliminó una fila.
- [x] 1.2 Incorporar al servicio la operación de eliminación, el registro estructurado y la conversión de un resultado vacío en `CollectionNotFoundError`.
- [x] 1.3 Exponer `DELETE /api/collections/:id` con autenticación, validación UUID existente y respuestas de éxito o colección no encontrada conforme al módulo.

## 2. Contrato y verificación

- [x] 2.1 Documentar el endpoint DELETE, sus respuestas y la conservación de bookmarks en las anotaciones OpenAPI y en el resumen de endpoints del README.
- [ ] 2.2 Verificar con una colección propia que contiene bookmarks que la colección se elimina, los bookmarks siguen existiendo y quedan con `collection_id` en nulo.
- [ ] 2.3 Verificar que eliminar una colección inexistente o de otro usuario devuelve el error de colección no encontrada y no modifica datos.
- [ ] 2.4 Ejecutar `npm run build`, `npx tsc --noEmit -p tsconfig.json` y `npx eslint src scripts`.
