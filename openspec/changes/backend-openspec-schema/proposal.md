## Why

El `design.md` de `spec-driven` es deliberadamente genérico y no obliga a
revisar las superficies que distinguen un cambio backend en Tobimarks: contrato
HTTP, ownership, PostgreSQL, transacciones, Redis, BullMQ, integraciones
externas, configuración y observabilidad. Esto permite que una propuesta omita
riesgos o decisiones importantes aunque el cambio termine implementándose en
varios módulos.

Se necesita un schema local especializado que conserve el flujo OpenSpec actual,
pero convierta esas revisiones en una estructura repetible y condicional.

## What Changes

- Crear un schema local `backend-spec-driven` derivado del schema oficial
  `spec-driven` mediante `openspec schema fork`.
- Reemplazar su plantilla e instrucciones de `design.md` por un diseño backend
  con un perfil de aplicabilidad explícito.
- Incluir bloques condicionales para API/HTTP, autenticación y autorización,
  persistencia, jobs/colas, integraciones externas, configuración/infraestructura,
  seguridad/privacidad y rendimiento/observabilidad.
- Exigir trazabilidad a archivos fuente, decisiones con alternativas, riesgos,
  estrategia de migración/rollback y verificación por superficie afectada.
- Configurar `backend-spec-driven` como schema predeterminado del repositorio.
- Documentar en `AGENTS.md` cuándo usar el schema backend y cómo conservar el
  schema base para cambios que no pertenezcan a la aplicación backend.
- Validar el schema y probar la generación de un cambio de ejemplo sin modificar
  código de runtime.
- No se cambian endpoints, requisitos funcionales, dependencias, migraciones ni
  comportamiento de la aplicación.

La condicionalidad será guiada por instrucciones y marcadores `IF`/`END IF` en
la plantilla. OpenSpec no interpreta bloques Markdown condicionales por sí
mismo; el agente debe clasificar las superficies según la propuesta y conservar
solo las secciones aplicables, dejando la clasificación registrada.

## Capabilities

### New Capabilities

Ninguna. Este cambio modifica tooling, plantillas y documentación del flujo, no
el comportamiento observable de Tobimarks.

### Modified Capabilities

Ninguna. No existen requisitos de runtime que modificar.

Este cambio usa `skip_specs: true` porque no introduce una capability de producto
ni altera contratos funcionales.

## Impact

- Añade `openspec/schemas/backend-spec-driven/` con `schema.yaml` y sus plantillas
  derivadas del schema oficial.
- Modifica `openspec/config.yaml` para seleccionar el schema local como default.
- Modifica `AGENTS.md` para describir la selección y el alcance del workflow.
- Los cambios OpenSpec existentes conservan su schema fijado en sus respectivos
  `.openspec.yaml` y no se migran automáticamente.
- No hay impacto en APIs, base de datos, workers, dependencias ni despliegues.
