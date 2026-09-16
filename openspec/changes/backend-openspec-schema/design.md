## Context

OpenSpec resuelve el schema en este orden: opción `--schema`, metadata del
change, `openspec/config.yaml` y default del paquete. El schema instalado
`spec-driven` solo ofrece una plantilla general para `design.md`; sus reglas
pueden orientar al agente, pero no crean secciones backend ni validan que cada
superficie haya sido considerada.

OpenSpec permite hacer fork de un schema a
`openspec/schemas/<nombre>/`, donde `schema.yaml` y `templates/` quedan bajo
control de versiones. La plantilla se inyecta en el prompt del agente. No hay
un motor de renderizado condicional para Markdown, por lo que la condición debe
expresarse como una decisión explícita del agente guiada por la instrucción y
por marcadores de plantilla.

El repositorio es una API Node.js/TypeScript con Express, PostgreSQL, Redis,
BullMQ, integraciones Google y workers dentro del mismo proceso. Estas
superficies no aparecen en todos los cambios, pero cuando aparecen requieren
decisiones y verificaciones distintas.

## Goals / Non-Goals

**Goals:**

- Mantener los artifacts, dependencias y flujo de `spec-driven`.
- Hacer que todo `design.md` backend empiece clasificando las superficies
  afectadas.
- Incluir detalles específicos solo cuando la superficie sea aplicable.
- Convertir API, ownership, persistencia, transacciones, jobs, integraciones,
  configuración, seguridad, observabilidad y rendimiento en puntos revisables.
- Exigir fuentes, alternativas, riesgos, rollback y verificación trazable.
- Mantener los changes existentes sin migrarlos ni reescribir sus metadata.

**Non-Goals:**

- No crear un motor nuevo que interprete `IF`/`END IF` en Markdown.
- No convertir la plantilla en un contrato de runtime ni añadir capabilities.
- No cambiar endpoints, esquemas Valibot, migraciones, dependencias o código de
  aplicación.
- No forzar secciones irrelevantes en cambios puramente documentales o de
  tooling.

## Decisions

### Schema Local Derivado

Se hará fork de `spec-driven` con el nombre `backend-spec-driven`. Solo se
especializarán la instrucción y la plantilla de `design`; proposal, specs,
tasks, dependencias y reglas estructurales se conservarán salvo los ajustes
necesarios para describir el nuevo schema.

Se seleccionará como default en `openspec/config.yaml` porque este repositorio
es backend-only. Los cambios existentes mantendrán `schema: spec-driven` en sus
`.openspec.yaml`; un futuro cambio fuera del backend podrá seleccionar
explícitamente `--schema spec-driven`.

**Alternativas consideradas:**

- Añadir únicamente reglas `design` en `openspec/config.yaml`: menor cambio,
  pero no proporciona una plantilla especializada ni queda aislado del schema
  general.
- Usar el schema especializado solo con `--schema`: evita cambiar el default,
  pero deja la cobertura dependiente de que cada autor recuerde la opción en un
  repositorio que actualmente solo contiene backend.
- Crear un artifact adicional por superficie: aumenta el coste y rompe la
  simplicidad del flujo sin necesidad de separar artifacts todavía.

### Perfil De Aplicabilidad

La plantilla incluirá una matriz obligatoria. El agente marcará `Sí` o `No`
según proposal, specs y código afectado antes de escribir el resto del diseño:

| Superficie                | Aplicar cuando...                                                   |
| ------------------------- | ------------------------------------------------------------------- |
| API/HTTP                  | Se añade o modifica una ruta, request, response, error u OpenAPI.   |
| Auth/Authorization        | Cambian identidad, tokens, sesiones, roles, ownership o permisos.   |
| Persistence               | Cambian SQL, modelos persistentes, tablas, índices o transacciones. |
| Jobs/Queues               | Cambian productores, consumidores, payloads, reintentos o workers.  |
| External Integrations     | Cambian Google, Gemini, scraping, Redis externo u otro proveedor.   |
| Config/Infrastructure     | Cambian env, Docker, conexiones, TLS, despliegue o límites.         |
| Security/Privacy          | Cambian secretos, exposición, datos personales o trust boundaries.  |
| Observability/Performance | Cambian logs, métricas, caché, concurrencia o tiempos.              |

La matriz evita inferir que una superficie fue revisada solo porque el template
la contiene. Una superficie marcada `Sí` exige su bloque; una marcada `No` no
debe generar una sección vacía.

### Bloques Condicionales De `design.md`

El template mantendrá las secciones generales del schema y añadirá bloques con
la convención siguiente:

```markdown
## Change Profile

| Surface                   | Applies | Evidence                         |
| ------------------------- | ------- | -------------------------------- |
| API/HTTP                  | Yes/No  | proposal.md, src/...             |
| Auth/Authorization        | Yes/No  | src/...                          |
| Persistence               | Yes/No  | migrations/..., src/...          |
| Jobs/Queues               | Yes/No  | src/...                          |
| External Integrations     | Yes/No  | src/...                          |
| Config/Infrastructure     | Yes/No  | .env.example, docker-compose.yml |
| Security/Privacy          | Yes/No  | SECURITY.md, src/...             |
| Observability/Performance | Yes/No  | src/...                          |

<!-- IF: API/HTTP -->

### API/HTTP

- Routes and middleware order
- Request schemas, response envelopes, status and error codes
- OpenAPI annotations, JSDoc and compatibility impact
- Ownership and authorization boundary
<!-- END IF: API/HTTP -->
```

Los bloques condicionales previstos serán:

- **API/HTTP:** routes, middleware, Valibot, respuestas, errores, OpenAPI,
  JSDoc y compatibilidad.
- **Auth/Authorization:** actor, credenciales, tokens/sesiones, ownership,
  permisos, revocación y abuso esperado.
- **Persistence:** tablas y migraciones, constraints, índices, queries,
  ownership, soft delete, Unit of Work, backfill y rollback.
- **Jobs/Queues:** producer/consumer, nombre, payload versionable, job ID,
  idempotencia, reintentos, backoff, concurrencia y shutdown.
- **External Integrations:** proveedor, datos enviados, secretos, timeout,
  retries, rate limits, errores, fallback y límites de red.
- **Config/Infrastructure:** variables, defaults, `.env.example`, TLS,
  Docker, health checks, orden de despliegue y cambios reversibles.
- **Security/Privacy:** activos, trust boundaries, amenazas, datos sensibles,
  SSRF/CSRF cuando corresponda, redacción de logs y mitigaciones.
- **Observability/Performance:** logs estructurados, métricas/tracing si
  existen, límites, caché, latencia, carga, concurrencia y degradación.

Después de los bloques se conservarán secciones obligatorias de decisiones con
alternativas, riesgos en formato `[Risk] -> Mitigation`, plan de migración y
rollback, y una matriz de verificación con fuente o comando por superficie.

### Instrucción Del Artifact `design`

La instrucción del schema exigirá este orden operativo:

1. Leer proposal y specs, y localizar las fuentes primarias afectadas.
2. Completar `Change Profile` con evidencia concreta.
3. Incluir únicamente los bloques cuya columna `Applies` sea `Yes`.
4. Para cada bloque aplicable, explicar decisiones y alternativas, no repetir la
   implementación línea por línea.
5. Registrar explícitamente por qué una superficie relevante no aplica cuando
   pueda confundirse con otra.
6. Cerrar con riesgos, migración/rollback y verificaciones ejecutables.

La instrucción también recordará que `@openapi` debe actualizarse para cambios
HTTP, que JSDoc debe cubrir contratos públicos no evidentes y que los cambios
de jobs, SQL o entorno deben revisar sus productores, consumidores y fuentes de
configuración.

### Compatibilidad Con Cambios Existentes

La metadata de cada change fija el schema usado al crearlo. Por tanto, cambiar
el default no altera la interpretación de los cuatro changes actuales. No se
copiarán ni modificarán sus artifacts para adaptarlos retroactivamente.

## Risks / Trade-offs

- [Los marcadores pueden quedar en el documento final] -> La instrucción debe
  exigir eliminar los bloques no aplicables y la revisión debe buscar
  `<!-- IF:` y `<!-- END IF:` sin resolver.
- [El agente puede marcar una superficie como No incorrectamente] -> Cada fila
  exige evidencia y la revisión debe contrastar proposal, specs y código fuente.
- [El schema local puede divergir del schema oficial] -> Mantener el fork mínimo,
  documentar su origen y revisar cambios de OpenSpec antes de actualizarlo.
- [El default backend puede ser incómodo si el repositorio incorpora frontend]
  -> Permitir `--schema spec-driven` explícito y revisar el default si cambia el
  alcance del repositorio.
- [Una plantilla extensa puede producir diseños burocráticos] -> Mantener los
  bloques condicionales fuera del resultado final cuando no apliquen y exigir
  detalle solo con evidencia.

## Migration Plan

1. Ejecutar `openspec schema fork spec-driven backend-spec-driven`.
2. Editar el `schema.yaml` y `templates/design.md` del fork; no editar el schema
   instalado globalmente.
3. Configurar `schema: backend-spec-driven` en `openspec/config.yaml`.
4. Añadir a `AGENTS.md` la selección del schema y la opción explícita para
   cambios no backend.
5. Ejecutar `openspec schema validate backend-spec-driven` y verificar la
   resolución con `openspec schema which backend-spec-driven`.
6. Crear un change temporal con el schema nuevo y comprobar que `design.md`
   recibe la instrucción y plantilla condicionales.
7. Si el schema causa problemas, restaurar `schema: spec-driven`; los changes
   existentes y sus artifacts no requieren rollback.

No hay migración de base de datos, despliegue de runtime ni cambio de API.

## Open Questions

No quedan preguntas que cambien el alcance o la estructura propuesta. La
selección del schema como default queda justificada por el alcance backend-only
del repositorio; si eso cambia, se revisará como un cambio posterior.
