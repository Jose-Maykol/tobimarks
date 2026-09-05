## 1. Artefactos Y Trazabilidad

- [x] 1.1 Revisar `proposal.md` y confirmar que el cambio está marcado como documental, sin cambios funcionales.
- [x] 1.2 Mantener `skip_specs: true` y verificar que no se hayan inventado capacidades ni deltas de comportamiento.
- [x] 1.3 Vincular cada afirmación de plataforma y seguridad con su archivo fuente del repositorio.

## 2. Bootstrap Y Plataforma

- [x] 2.1 Documentar el orden comprobable de `src/index.ts`: metadatos, dotenv, DI, jobs, logger, importación de app y `listen`.
- [x] 2.2 Documentar en `src/app.ts` el orden de CORS, rate limiting, Helmet, cookies, logging HTTP, JSON, Scalar, rutas y errores.
- [x] 2.3 Documentar el prefijo `/api`, la ruta raíz y `/api-docs`, sin ampliar la cobertura OpenAPI existente.
- [x] 2.4 Documentar el registro de dependencias core y de módulos en `src/container.ts` y los contenedores asociados.
- [x] 2.5 Documentar PostgreSQL, Unit of Work, Redis de caché, Redis de colas, prefijos, TTL, reintentos y cierre según el código actual.
- [x] 2.6 Documentar workers, colas `ai-tags-generation` y `ai-collections-generation`, payload observable y ejecución en el mismo proceso.

## 3. Configuración Y Despliegue Local

- [x] 3.1 Catalogar las variables de `.env.example`, defaults, variables obligatorias y transformaciones observables de Valibot sin exponer secretos.
- [x] 3.2 Documentar Pino por entorno, niveles configurables, logging HTTP y campos registrados, excluyendo tokens y credenciales de ejemplos.
- [x] 3.3 Documentar `docker-compose.yml`: dos Redis, puertos, volúmenes, healthchecks y políticas de memoria/persistencia.
- [x] 3.4 Documentar el flujo local de `npm install`, `.env`, PostgreSQL externo, Compose o Redis equivalente, migraciones, `npm run dev`, build y start.
- [x] 3.5 Registrar como gap que Compose no define PostgreSQL y que el arranque local depende de credenciales/servicios externos.

## 4. Seguridad Y Contratos De Error

- [x] 4.1 Documentar CORS, credenciales, Helmet y rate limit global con sus valores actuales y respuesta configurada.
- [x] 4.2 Documentar que `cookie-parser` parsea cookies, pero no afirmar que los tokens se emiten en cookies.
- [x] 4.3 Documentar validación Valibot de body/params/query y la respuesta 400 observable para errores de validación.
- [x] 4.4 Documentar Bearer auth, `req.user`, respuestas 401 y códigos `ACCESS_HEADER_MISSING`, `ACCESS_TOKEN_MISSING` y `ACCESS_TOKEN_INVALID`.
- [x] 4.5 Documentar JWT de acceso, secreto/expiración configurados por entorno y refresh token aleatorio con hash SHA-256.
- [x] 4.6 Documentar expiración de 30 días, rotación, revocación y metadatos por dispositivo de refresh tokens.
- [x] 4.7 Documentar manejo global de errores de dominio e inesperados, logging asociado y contrato `success/data` o `success/message/errorCode`.
- [x] 4.8 Registrar como gaps la ausencia de cookies de tokens configuradas, límites específicos por endpoint, pruebas automatizadas/CI y cobertura OpenAPI parcial.

## 5. Verificación Final

- [x] 5.1 Ejecutar `openspec status --change document-platform-security` y confirmar los artefactos esperados.
- [x] 5.2 Ejecutar `openspec validate document-platform-security --type change --strict` y resolver errores de formato sin tocar código de aplicación.
- [x] 5.3 Revisar el diff para confirmar que solo contiene artefactos bajo `openspec/changes/document-platform-security/`.
