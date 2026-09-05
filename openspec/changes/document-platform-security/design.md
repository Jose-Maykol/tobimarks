## Context

El repositorio es una API Node.js/TypeScript con Express 5 y módulos registrados
en un contenedor tsyringe. `src/index.ts` carga metadatos y dotenv, configura DI,
inicializa jobs, resuelve el logger y escucha en `env.PORT`; `src/app.ts` crea la
aplicación, instala middleware global, monta rutas bajo `/api` y registra el
manejador de errores.

La configuración se valida al importar `src/core/config/env.config.ts`. Hay una
instancia Redis para caché con prefijo `tobimarks:` y otra conexión para BullMQ.
Pino cambia entre salida legible en desarrollo y JSON en otros entornos. La
autenticación expone Google, refresh y logout; los access tokens son JWT y los
refresh tokens se generan aleatoriamente, se almacenan como SHA-256 y se rotan.

La evidencia también tiene límites: `docker-compose.yml` define dos Redis pero no
PostgreSQL; `cookie-parser` solo parsea cookies y los controladores devuelven los
tokens en JSON; no existe una suite automatizada ni CI; y los workers se arrancan
en el mismo proceso que la API.

## Goals / Non-Goals

**Goals:**

- Producir documentación trazable al código y a los archivos de operación.
- Describir entradas, salidas, códigos de error, orden de arranque y valores
  predeterminados solo cuando están comprobados.
- Mantener un inventario claro de riesgos y gaps como trabajo documental o de
  verificación pendiente.
- Permitir revisar el cambio con `openspec status` y `openspec validate`.

**Non-Goals:**

- No cambiar middleware, autenticación, cookies, JWT, Redis, logging o workers.
- No añadir tests, CI, dependencias, variables, migraciones o servicios Docker.
- No afirmar que existe aislamiento de workers, cookies HttpOnly/Secure, límites
  por endpoint, protección CSRF o PostgreSQL administrado por Compose.
- No crear specs de comportamiento nuevas para una implementación que no cambia.

## Decisions

### Optar por `skip_specs`

Se usa `skip_specs: true` porque el trabajo no altera requisitos observables.
Alternativa descartada: crear una capacidad de “documentación” como spec, porque
la convertiría artificialmente en comportamiento del producto y no aportaría un
contrato ejecutable.

### Separar estado actual de gaps

La documentación distinguirá hechos observables de riesgos pendientes. Por
ejemplo, se documenta que CORS usa `env.CORS_ORIGIN` y credenciales habilitadas,
pero no se convierte eso en una recomendación de endurecimiento. Alternativa
descartada: mezclar recomendaciones con garantías, por riesgo de inducir
configuraciones operativas incorrectas.

### Usar fuentes primarias del repositorio

El orden y comportamiento de runtime se derivan de `src/app.ts`, `src/index.ts`,
configuraciones y servicios; README y Compose se usan para operación local. Cuando
hay discrepancias, se registran como gap en lugar de resolverlas editando código.

### Mantener tareas documentales verificables

Cada tarea apunta a una sección o evidencia concreta y puede comprobarse mediante
revisión de archivos, `openspec validate` o una ejecución no destructiva. No se
incluyen tareas de implementación disfrazadas de documentación.

## Risks / Trade-offs

- [La documentación puede quedar obsoleta] → Incluir rutas/archivos fuente y
  exigir revisión al cambiar bootstrap, auth o configuración.
- [README y runtime pueden divergir] → Registrar discrepancias explícitas y no
  elegir silenciosamente una versión como garantía.
- [No hay tests automatizados] → Marcar escenarios como verificables por revisión
  o smoke checks manuales, no como cobertura existente.
- [Compose no levanta toda la plataforma] → Documentar que PostgreSQL sigue siendo
  un prerrequisito externo y no prometer `docker compose up` completo.
- [La seguridad efectiva depende del entorno] → Documentar defaults y variables,
  evitando afirmar controles no configurados explícitamente.

## Migration Plan

1. Revisar los artefactos OpenSpec contra las fuentes indicadas.
2. Validar el cambio con `openspec status --change document-platform-security` y
   `openspec validate --change document-platform-security`.
3. No hay migración de runtime ni rollback técnico: retirar este directorio de
   cambio revierte únicamente la propuesta documental.

## Open Questions

No quedan preguntas que requieran decisiones para este cambio. La configuración
de cookies, separación de workers, cobertura de tests/CI y alcance de OpenAPI se
registran como gaps para futuros cambios independientes, no se resuelven aquí.
