## Why

La plataforma y sus controles de seguridad ya están implementados, pero su
comportamiento está repartido entre el arranque, `core`, `common`, autenticación,
README y configuración local. Esta propuesta crea una referencia auditable basada
solo en comportamiento comprobable, y separa explícitamente los riesgos y gaps
conocidos de las garantías actuales.

## What Changes

- Documentar el bootstrap de Express, el orden de middleware, el prefijo `/api`,
  la ruta raíz y `/api-docs`.
- Documentar el arranque de `src/index.ts`, la validación de entorno, el registro
  de dependencias con tsyringe y la inicialización de workers en el mismo proceso.
- Documentar configuración y límites observables de PostgreSQL, Redis de caché,
  Redis de colas, Pino y despliegue local con Docker/npm.
- Documentar autenticación Google, JWT de acceso, refresh tokens opacos con hash,
  rotación, expiración, revocación y metadatos de dispositivo.
- Documentar CORS, Helmet, rate limiting, `cookie-parser`, validación de entrada,
  autenticación Bearer, logging HTTP y manejo global de errores.
- Registrar como tareas de documentación y verificación los gaps comprobables,
  sin implementar fixes ni cambiar contratos de la aplicación.
- No se introducen cambios funcionales, endpoints, dependencias, migraciones ni
  modificaciones de código de aplicación.

## Capabilities

### New Capabilities

None. This is a documentation-only change and does not introduce application
behavior.

### Modified Capabilities

None. No existing application requirement changes.

This change opts out of spec deltas with `skip_specs: true`; creating a behavior
spec would incorrectly present documentation work as a new runtime capability.

## Impact

- Artefactos OpenSpec bajo `openspec/changes/document-platform-security/`.
- Fuentes consultadas como evidencia: `src/app.ts`, `src/index.ts`,
  `src/container.ts`, `src/core`, `src/common`, autenticación, jobs,
  `.env.example`, `docker-compose.yml` y `README.md`.
- No hay impacto en APIs, base de datos, dependencias, despliegues ni archivos de
  código de aplicación.
- Los riesgos documentados incluyen cobertura OpenAPI parcial, ausencia de tests
  y CI, workers en el proceso de API, ausencia de PostgreSQL en compose, ausencia
  de configuración explícita de cookies de tokens y límites de seguridad que no
  están parametrizados por entorno.
