# Guía para agentes de código

## Contexto

Tobimarks es una API REST de Node.js y TypeScript para gestionar bookmarks. Usa
Express 5, PostgreSQL mediante `pg`, Redis, BullMQ, `tsyringe`, Valibot y Google
Gemini. La aplicación está organizada por módulos de negocio y se ejecuta como
API HTTP más workers de BullMQ dentro del mismo proceso.

Consulta estos documentos antes de cambiar código:

- `ARCHITECTURE.md`: límites, flujo de ejecución y responsabilidades de cada capa.
- `CODING_RULES.md`: convenciones de TypeScript, Express, SQL, errores y logging.
- `DATABASE.md`: tablas, relaciones, migraciones y reglas de persistencia.
- `README.md`: instalación local, variables de entorno y endpoints públicos.
- `openspec/config.yaml`: configuración del flujo OpenSpec del repositorio.

## Flujo De Trabajo

1. Inspecciona el módulo y las interfaces relacionadas antes de editar.
2. Mantén el cambio dentro del módulo afectado; modifica `common` o `core` solo
   cuando la funcionalidad sea realmente transversal.
3. Si cambia el esquema PostgreSQL, crea una nueva migración numerada en
   `migrations/`; no edites migraciones ya aplicadas.
4. Si cambia un endpoint, actualiza validación, respuestas, errores y anotaciones
   OpenAPI que correspondan.
5. Si cambia un job o su payload, revisa productor, consumidor, nombre de cola,
   reintentos y comportamiento ante trabajos repetidos.
6. Ejecuta las verificaciones disponibles y describe cualquier limitación en el
   resultado final.

Para cambios no triviales, usa OpenSpec:

- `/opsx-explore` para entender el problema.
- `/opsx-propose "descripción del cambio"` para crear la propuesta.
- `/opsx-apply` para implementar las tareas aprobadas.
- `/opsx-update` para revisar el plan durante la implementación.
- `/opsx-sync` para sincronizar cambios de especificación.
- `/opsx-archive` para archivar un cambio terminado.

## Comandos

```text
npm install
npm run dev
npm run build
npm run start
npm run db:migrate
npm run db:reset
```

`npm run db:reset` es destructivo: elimina el esquema `public` con `CASCADE`.
No lo ejecutes salvo que sea intencional y el entorno sea desechable.

No existen actualmente scripts npm ni configuración de tests, CI o typecheck
independientes. Como verificaciones adicionales pueden ejecutarse:

```text
npx tsc --noEmit -p tsconfig.json
npx eslint src scripts
npx prettier --check "**/*.{ts,js,json,md,yml,yaml}"
```

## Reglas Operativas

- No inspecciones ni expongas valores de `.env`; usa `.env.example` como referencia.
- No hardcodees secretos, credenciales, tokens ni URLs sensibles.
- Usa consultas SQL parametrizadas. Los nombres de columnas usados para ordenar
  deben salir de una lista blanca.
- Respeta la propiedad del usuario en todas las lecturas y mutaciones de datos.
- Usa `req.user` solo después de `authMiddleware`; no desactives la autenticación
  de rutas protegidas.
- Usa `IUnitOfWork` cuando una operación modifique varias entidades y deba ser
  atómica; garantiza `commit` o `rollback` según corresponda.
- Inyecta dependencias mediante los tokens y contenedores del módulo. Registra
  cualquier nueva implementación en `src/container.ts` o en el contenedor del
  módulo correspondiente.
- Propaga errores inesperados a `next(error)` y usa excepciones de dominio para
  errores conocidos.
- No añadas dependencias nuevas si la funcionalidad puede resolverse con las
  existentes.
- No edites `dist/`; es salida generada e ignorada por Git.

## Criterios De Entrega

Antes de finalizar, revisa:

- El diff contiene solo archivos relacionados con el cambio.
- El código cumple `strict`, `noUncheckedIndexedAccess` y
  `exactOptionalPropertyTypes` de TypeScript.
- Las respuestas y errores mantienen el formato existente.
- Las migraciones son idempotentes en la medida posible y están ordenadas.
- No quedan imports sin usar, logs con secretos ni cambios de configuración
  local sin intención.