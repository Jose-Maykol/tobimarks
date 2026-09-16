## 1. Schema Local

- [x] 1.1 Ejecutar `openspec schema fork spec-driven backend-spec-driven` y verificar que `openspec/schemas/backend-spec-driven/` contiene `schema.yaml` y las cuatro plantillas heredadas.
- [x] 1.2 Actualizar el nombre, descripción y referencias del fork sin alterar el grafo de artifacts; verificar que `openspec schema validate backend-spec-driven` acepta el schema.

## 2. Diseño Backend Condicional

- [x] 2.1 Reemplazar `templates/design.md` por la estructura con `Context`, `Goals / Non-Goals`, `Change Profile`, bloques condicionales, decisiones, riesgos, migración/rollback y verificación; comprobar que están representadas las ocho superficies backend.
- [x] 2.2 Actualizar la instrucción del artifact `design` en `schema.yaml` para exigir evidencia, selección `Yes/No`, eliminación de bloques no aplicables, alternativas y trazabilidad a JSDoc/OpenAPI; verificarlo con `openspec instructions design --change <change> --json`.
- [x] 2.3 Mantener intactas las plantillas y dependencias de `proposal`, `specs` y `tasks` salvo ajustes de descripción necesarios; verificar que el schema conserva el flujo `proposal -> specs -> design -> tasks`.

## 3. Integración Del Proyecto

- [x] 3.1 Configurar `schema: backend-spec-driven` en `openspec/config.yaml` y documentar en `AGENTS.md` el uso del default y la opción `--schema spec-driven`; verificar la resolución con `openspec schema which backend-spec-driven`.
- [x] 3.2 Confirmar que los changes existentes mantienen su schema fijado y no se modifican; verificarlo con `openspec status --change document-api-contracts --json` y los demás changes existentes.

## 4. Verificación

- [x] 4.1 Crear un change temporal en un directorio desechable con `--schema backend-spec-driven` y verificar que su `design.md` recibe la plantilla y la instrucción condicionales.
- [x] 4.2 Verificar que un diseño de ejemplo puede marcar una superficie como `No` sin dejar marcadores `IF`/`END IF` sin resolver y que conserva la matriz de evidencia.
- [x] 4.3 Ejecutar `openspec schema validate backend-spec-driven`, `openspec validate backend-openspec-schema --type change --strict` y `npx prettier --check "**/*.{md,yml,yaml}"`; resolver cualquier error sin tocar código de runtime.
