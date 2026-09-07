# Arquitectura

## Visión General

Tobimarks es una API REST modular. Su implementación sigue una separación por
capas inspirada en Clean Architecture, aunque no existe una capa de dominio
independiente estricta: parte de la lógica vive en casos de uso y parte en
servicios de módulo.

```text
Cliente HTTP
    |
    v
Express: middlewares -> routes -> controllers
                              |
                              v
                    use-cases / services
                       |       |       |
                       v       v       v
                 repositories  queues  servicios externos
                       |
                       v
             DatabaseContext / UnitOfWork
                       |
                       v
                    PostgreSQL
```

Las tareas pesadas de scraping y procesamiento de IA se ejecutan de forma
asíncrona mediante BullMQ y Redis. Los workers se inicializan en el mismo proceso
que la API desde `src/index.ts`.

## Entrada Y Arranque

- `src/index.ts` carga `reflect-metadata` y dotenv, registra el contenedor,
  inicializa jobs y arranca el servidor.
- `src/container.ts` compone los contenedores de `core` y de cada módulo.
- `src/app.ts` crea Express, registra CORS, rate limiting, Helmet, cookies,
  logging HTTP, JSON parsing, Scalar, rutas y el manejador global de errores.
- Todas las rutas de negocio se montan bajo `/api`.
- La documentación interactiva está disponible en `/api-docs` cuando el servidor
  está ejecutándose.

La configuración de entorno se valida al importar
`src/core/config/env.config.ts`. Las credenciales de PostgreSQL, JWT, Google y
Gemini deben estar presentes según `.env.example`.

## Módulos De Negocio

Los módulos viven en `src/modules/` y encapsulan sus rutas, controladores,
servicios o casos de uso, repositorios, modelos, esquemas, tipos, excepciones y
registro de dependencias.

- `auth`: Google OAuth, JWT, refresh tokens y sesiones.
- `bookmark`: bookmarks, extracción de metadatos, websites y jobs de IA.
- `collection`: creación, consulta y organización de colecciones.
- `statistics`: métricas agregadas del usuario.
- `tag`: etiquetas y búsqueda de etiquetas similares.
- `user`: perfil y configuración del usuario.

La estructura típica de un módulo es:

```text
src/modules/<module>/
├── controllers/       # Adaptación HTTP y códigos de estado
├── routes/            # Endpoints, middleware y validación
├── use-cases/         # Flujos de negocio explícitos, cuando aplica
├── services/          # Reglas o integraciones del módulo
├── repositories/      # Persistencia detrás de interfaces
├── models/            # Entidades y DTOs internos
├── schemas/           # Esquemas Valibot de entrada
├── types/             # Tipos de transporte y dominio
├── exceptions/        # Errores de dominio del módulo
└── di/                # Tokens y registro de implementaciones
```

No todos los módulos contienen todas las carpetas. Reutiliza la forma existente
del módulo más cercano en lugar de crear una variante innecesaria.

## Responsabilidades Por Capa

### Routes

Declaran el contrato HTTP y el orden de middlewares. Las rutas protegidas aplican
`authMiddleware` y las entradas conocidas deben pasar por `validateRequest` con
esquemas Valibot.

### Controllers

Traducen `Request` a llamadas de aplicación y convierten el resultado a una
respuesta HTTP. Deben mantenerse delgados: no deben contener SQL ni reglas de
negocio complejas. Los controladores actuales usan `try/catch`, mapean errores de
dominio conocidos y delegan errores desconocidos a `next(error)`.

### Use Cases Y Services

Orquestan el comportamiento de negocio y coordinan repositorios, servicios
externos, caché y colas. Reciben datos ya validados y el usuario autenticado
cuando la operación depende de identidad o permisos.

### Repositories

Contienen SQL y el mapeo entre `snake_case` de PostgreSQL y `camelCase` de
TypeScript. Se accede a la base mediante `IDatabaseContext` o un `IQueryRunner`
de transacción; las interfaces permiten sustituir implementaciones.

### Core Y Common

- `src/core/`: infraestructura transversal: configuración, PostgreSQL, Unit of
  Work, Redis/cache, colas, embeddings, logging y DI.
- `src/common/`: middleware, respuestas, errores y tipos compartidos que no
  pertenecen a un módulo de negocio.
- `DATABASE.md`: mapa del esquema, relaciones, índices y ciclo de migraciones.

Un módulo puede depender de abstracciones de `core` y de contratos de otros
módulos. Evita que `core` conozca reglas de negocio concretas.

## Persistencia

PostgreSQL se accede con `pg`, sin ORM. `DatabaseContext` administra el pool y
libera clientes tras cada consulta. Las operaciones que necesitan una conexión
compartida usan `UnitOfWork`:

```text
begin -> consultas con el mismo IQueryRunner -> commit
                                      \-> rollback ante error
```

Las migraciones SQL numeradas están en `migrations/` y se aplican mediante
`scripts/migrate.ts`, que registra el historial en `schema_migrations`. Una
migración nueva debe ser posterior a las existentes y no debe reescribir el
historial.

Los bookmarks usan soft delete mediante `deleted_at`; las consultas normales
deben excluir registros eliminados. Los refresh tokens se almacenan como hashes
SHA-256, no como valores en texto plano.

## Cache, Colas E IA

- `CacheService` usa Redis con el prefijo `tobimarks:` y TTLs definidos por el
  servicio.
- `QueueService` encapsula BullMQ, usa Redis dedicado para colas, concurrencia
  predeterminada de 5, tres reintentos y backoff exponencial.
- `BookmarkJobProcessor` registra `ai-tags-generation` y
  `ai-collections-generation`.
- `EmbeddingService` usa Gemini para embeddings de dimensión 1536 y cálculo de
  similitud en los casos de uso relacionados.

El productor debe persistir primero el estado requerido y después publicar el
job. El payload debe contener identificadores estables, normalmente `bookmarkId`
y `userId`; el consumidor debe tolerar que el bookmark ya no exista o que el job
se reprocese.

## Seguridad Y Errores

Las rutas protegidas validan el Bearer token y adjuntan el payload a `req.user`.
La API aplica CORS, Helmet y rate limiting global. Toda operación de datos debe
filtrar por el usuario autenticado y validar ownership antes de modificar
recursos.

Las respuestas de aplicación intentan seguir este contrato:

```text
Éxito: { success: true, data, message?, meta? }
Error: { success: false, message, errorCode }
```

Los errores de dominio derivan de `BaseException`; el middleware global registra
errores inesperados y evita exponer detalles internos al cliente.

## Cambiar La Arquitectura

Al añadir una funcionalidad:

1. Identifica el módulo dueño del concepto.
2. Añade el esquema de entrada, tipos, caso de uso o servicio, repositorio y
   endpoint solo si son necesarios.
3. Define una excepción de dominio para errores esperados.
4. Registra tokens e implementaciones en el DI del módulo.
5. Añade migración si cambia el modelo persistente.
6. Actualiza OpenAPI y README si cambia el contrato público.
7. Verifica tanto la ruta síncrona como los jobs o efectos secundarios asociados.

## Estado Conocido

Estas son características actuales, no objetivos ya garantizados por el diseño:

- No hay suite de tests automatizados ni pipeline CI en el repositorio.
- Los workers de BullMQ comparten proceso con la API.
- La cobertura de anotaciones OpenAPI es parcial.
- Existen diferencias históricas de nombres como `squemas/`, `token.ts` frente a
  `tokens.ts` y `base-erxception.ts`; no las propagues a código nuevo.