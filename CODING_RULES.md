# Reglas De Código

Estas reglas consolidan las convenciones usadas por Tobimarks. Cuando el código
existente difiera, aplica la convención aquí descrita al código nuevo y evita
refactors no relacionados.

## TypeScript

- Mantén `strict: true` y escribe código compatible con
  `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`.
- Usa clases y decoradores solo donde encajen con el patrón existente de DI.
- Declara interfaces para contratos de repositorios y servicios reemplazables.
- Usa `import type` para imports usados únicamente como tipos.
- Usa `readonly` para dependencias y valores que no deben reasignarse.
- Prefiere tipos derivados (`Pick`, `Partial` y tipos inferidos de Valibot) antes
  que duplicar estructuras.
- Evita `any`; si una librería obliga a usarlo, limita el alcance y justifica la
  excepción. Prefiere `unknown` y narrowing.
- No uses non-null assertions (`!`) salvo que el middleware o una validación
  previa garantice formalmente el valor y la alternativa complique el contrato.

## Formato Y Nombres

- Prettier: ancho de línea 100, comillas simples, sin punto y coma y sin trailing
  commas.
- Los archivos TypeScript usan tabs de dos espacios lógicos según
  `.prettierrc.json`; Markdown, JSON, YAML y TOML usan espacios.
- Clases, enums y tipos principales: `PascalCase`.
- Variables, funciones, métodos y propiedades: `camelCase`.
- Archivos y carpetas: `kebab-case`.
- Interfaces existentes usan el prefijo `I` (`ILogger`, `IUnitOfWork`). Mantén
  esa convención en nuevos contratos de infraestructura.
- Casos de uso usan el sufijo `.use-case.ts`, repositorios `.repository.ts`,
  servicios `.service.ts`, controladores `.controller.ts` y rutas `.routes.ts`.
- Mantén los comentarios JSDoc para clases, métodos públicos y middleware cuyo
  contrato no sea evidente. Escribe comentarios sobre decisiones, no sobre
  operaciones obvias.

## Imports Y Dependencias

- Ordena imports con ESLint: built-in/external, internos mediante `@/*`, y luego
  parent/sibling/index; separa los grupos con una línea en blanco.
- Usa el alias `@/*` para imports desde `src` cuando mejore la claridad; usa
  imports relativos dentro del módulo cuando expresen una relación local clara.
- No resuelvas implementaciones concretas desde un módulo si existe un contrato
  registrado en DI.
- Toda clase inyectable debe usar `@injectable()` y cada token nuevo debe
  registrarse en el contenedor apropiado.

## Express Y API

- Mantén las rutas declarativas: autenticación, validación, handler enlazado y
  nada de reglas de negocio complejas.
- Valida `body`, `params` y `query` con Valibot mediante `validateRequest` antes
  de entrar al controlador.
- En rutas protegidas usa `req.user` después de `authMiddleware` y pasa la
  identidad al caso de uso para aplicar ownership.
- Los controladores deben devolver una sola respuesta. Ante errores conocidos,
  responde con el código HTTP específico; ante errores desconocidos llama a
  `next(error)` y no continúes ejecutando el handler.
- Usa `StatusCodes` en lugar de números HTTP literales.
- Construye respuestas con `ApiResponseBuilder` y conserva el contrato
  `success/data/message/meta` o `success/message/errorCode`.
- Si cambia un endpoint, actualiza sus esquemas, tipos, documentación OpenAPI y
  la tabla de endpoints del README cuando corresponda.

## Casos De Uso Y Errores

- Coloca la orquestación de negocio en casos de uso o servicios, no en rutas,
  middleware ni repositorios.
- Usa excepciones específicas del módulo derivadas de `BaseException` para
  condiciones esperadas como recurso inexistente, conflicto o URL inválida.
- No captures un error para ignorarlo. Regístralo y relánzalo, o conviértelo en
  una excepción de dominio con contexto suficiente.
- Conserva el comportamiento de rollback si una operación transaccional falla.
- Evita dependencias circulares entre módulos; extrae contratos a una ubicación
  compartida solo si son realmente transversales.

## PostgreSQL Y SQL

- Usa `IDatabaseContext` para consultas normales y `IUnitOfWork`/`IQueryRunner`
  para operaciones que deban compartir transacción.
- Parametriza todos los valores con `$1`, `$2`, etc. Nunca interpoles entradas del
  usuario en SQL.
- Para `ORDER BY`, usa una lista blanca de columnas y deriva la dirección de un
  conjunto cerrado (`asc`/`desc`).
- Mapea explícitamente columnas `snake_case` a propiedades `camelCase` con alias
  SQL.
- Comprueba la propiedad del usuario en consultas y mutaciones, no solo la
  existencia del UUID.
- Respeta el soft delete de bookmarks filtrando `deleted_at IS NULL` en lecturas
  normales.
- Libera conexiones y clientes mediante las abstracciones existentes. No crees
  pools adicionales desde módulos de negocio.
- Los cambios de esquema van en una migración SQL nueva, numerada y descriptiva.
  No edites una migración aplicada.

## Cache, Jobs E Integraciones

- Trata la caché como optimización: un fallo de Redis no debe perder datos
  persistentes salvo que el caso de uso lo exija explícitamente.
- Usa nombres de cola estables y payloads serializables, pequeños y versionables.
- Configura reintentos y backoff para llamadas externas o trabajos transitorios.
- Haz los consumidores idempotentes: pueden recibir el mismo job más de una vez.
- Registra `jobId`, identificadores de entidad y contexto, pero nunca tokens,
  contraseñas ni payloads sensibles.
- Aísla llamadas a Gemini, scraping HTTP y Redis en servicios; los casos de uso
  no deben conocer detalles de clientes externos.
- Define timeout y manejo explícito para URLs externas y errores del proveedor.

## Logging Y Configuración

- Usa `ILogger`/Pino y loggers hijos con `context` en servicios y workers.
- Usa niveles coherentes: `debug` para diagnóstico, `info` para ciclo normal,
  `warn` para condiciones recuperables y `error` para fallos.
- Valida variables de entorno con la configuración existente y añade nuevas
  variables a `.env.example` y a `env.config.ts`.
- Nunca comitees `.env` ni valores reales de credenciales.
- No dependas de estado global mutable si puede resolverse con DI.

## Verificación

Antes de entregar código, ejecuta al menos:

```text
npm run build
npx tsc --noEmit -p tsconfig.json
npx eslint src scripts
```

Si una verificación no puede ejecutarse por servicios externos o por una
limitación ya existente, indícalo. Actualmente no hay framework ni script de
tests automatizados; los nuevos comportamientos deberían introducir pruebas
cuando se incorpore una infraestructura de testing.

## Excepciones Heredadas

No copies estas inconsistencias en código nuevo:

- `src/modules/auth/squemas/` debería seguir la forma `schemas/`.
- Algunos módulos tienen `di/token.ts` y otros `di/tokens.ts`; usa el nombre
  predominante del módulo que estés modificando sin renombrar todo el proyecto.
- `src/common/errors/base-erxception.ts` tiene un nombre histórico; reutiliza su
  export existente, pero no crees nuevos nombres con el mismo error.
- `eslint.config.js` aún contiene estilo antiguo en algunos separadores frente a
  Prettier; la configuración efectiva de TypeScript/Prettier es la referencia
  para código nuevo.
