# Seguridad

Este documento describe el comportamiento de seguridad observable en el código
actual y las precauciones necesarias para operar Tobimarks. No sustituye una
auditoría de seguridad ni convierte una recomendación en un control
implementado. Cuando exista una discrepancia, la fuente de runtime debe
prevalecer y este documento debe actualizarse.

## Fuentes De Referencia

- `src/app.ts`: middleware global, CORS, Helmet, rate limiting y rutas.
- `src/common/middlewares/auth.middleware.ts`: autenticación Bearer.
- `src/common/middlewares/validation.middleware.ts`: validación de entradas.
- `src/modules/auth/`: Google OAuth, JWT y ciclo de vida de refresh tokens.
- `src/modules/bookmark/services/metadata-extractor.service.ts`: solicitudes a
  URLs externas.
- `src/core/config/env.config.ts` y `.env.example`: configuración de entorno.
- `src/core/queue/queue.service.ts` y `src/modules/bookmark/jobs/`: workers y
  payloads de trabajos.
- `docker-compose.yml`: servicios Redis para desarrollo local.

## Superficie HTTP

Todas las rutas de negocio se montan bajo `/api`. La ruta `/`, la documentación
en `/api-docs` y las rutas de autenticación son accesibles sin un Bearer token:

- `POST /api/auth/google`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Las rutas de bookmarks, colecciones, estadísticas, tags, usuarios y websites
aplican `authMiddleware` en el router correspondiente. La autorización de los
recursos debe comprobar siempre que el recurso pertenece al usuario de
`req.user.sub`; no basta con comprobar que exista el UUID.

## Middleware Global

El orden actual en `src/app.ts` es:

1. CORS con `origin: env.CORS_ORIGIN` y `credentials: true`.
2. Rate limiting global de 500 solicitudes por ventana de 15 minutos.
3. Headers de seguridad mediante `helmet()`.
4. `cookie-parser` para leer cookies.
5. Logging HTTP.
6. Parseo de cuerpos JSON.
7. Scalar en `/api-docs` y rutas de la API.
8. Manejador global de errores.

El rate limiter envía headers estándar, desactiva los headers legacy y responde
con `Demasiadas peticiones, por favor inténtelo de nuevo más tarde.` cuando se
supera el límite. El límite es global: actualmente no existen límites más
estrictos por endpoint para login, refresh o logout.

`CORS_ORIGIN` debe configurarse con el origen exacto del cliente en entornos no
locales. El valor predeterminado es `http://localhost:5173`. CORS permite
credenciales, pero esto no significa que la aplicación emita tokens en cookies.
Los tokens de autenticación se devuelven en JSON; `cookie-parser` solo analiza
las cookies recibidas y no configura atributos `HttpOnly`, `Secure` o `SameSite`.

## Autenticación

### Google

`POST /api/auth/google` recibe un ID token en el cuerpo JSON. Google lo verifica
con `google-auth-library` y la audiencia configurada en `GOOGLE_CLIENT_ID`.
También se requiere email y nombre en la carga útil verificada.

La lista blanca de emails se puede activar mediante
`ENABLE_EMAIL_WHITELIST=true`. Su valor predeterminado en
`env.config.ts` es `false`. Cuando está activa, el email debe existir en la
tabla de emails permitidos.

### Access Token

- Es un JWT firmado con `JWT_SECRET`.
- Su duración se configura en `JWT_EXPIRES_IN`, expresada en segundos.
- El payload actual contiene `sub` con el UUID del usuario y `email`.
- Las rutas protegidas esperan la cabecera `Authorization` con un token Bearer.
- Tras validar el JWT, el middleware adjunta el payload a `req.user`.

Los errores de autenticación responden con HTTP 401 y utilizan estos códigos:

- `ACCESS_HEADER_MISSING`
- `ACCESS_TOKEN_MISSING`
- `ACCESS_TOKEN_INVALID`

El middleware extrae el segundo segmento de la cabecera Authorization y delega
la verificación criptográfica y la expiración a `jsonwebtoken`. No se debe
tratar `req.user` como confiable antes de ejecutar este middleware.

### Refresh Token

- Se genera con 64 bytes aleatorios mediante `crypto.randomBytes`.
- Solo se almacena en PostgreSQL su hash SHA-256 codificado como base64url.
- Tiene una expiración de 30 días desde su emisión o rotación.
- Debe estar activo y no expirado para poder renovarse.
- La renovación desactiva el token anterior y genera uno nuevo.
- Existe como máximo un registro por combinación de usuario y `deviceId` debido
  al `upsert` de la persistencia.
- Se guardan metadatos de dispositivo, user-agent e IP cuando están disponibles.
- Logout desactiva el refresh token recibido en el cuerpo de la solicitud.

Los refresh tokens también se devuelven en JSON y no se almacenan
automáticamente en cookies. Los clientes deben evitar exponerlos en URLs,
logs, analíticas o almacenamiento accesible a scripts no confiables.

## Validación Y Autorización

Las rutas que tienen esquemas usan Valibot para validar body, params y query
antes de llegar al controlador. Un error de validación devuelve HTTP 400 con
`success: false`, el mensaje `Validation failed` y la lista de problemas.

La creación de bookmarks valida que `url` tenga formato de URL, pero la
validación sintáctica no constituye una política de seguridad de red. Las
mutaciones y lecturas de datos deben mantener el filtro por usuario y el
soft-delete de bookmarks.

En SQL se deben parametrizar todos los valores. Las columnas de `ORDER BY` y la
dirección de ordenación deben salir de listas cerradas, nunca de interpolación
de entrada del usuario. Las operaciones que modifican varias entidades deben
usar `IUnitOfWork` y garantizar rollback ante errores.

## Solicitudes A URLs Externas

Al crear un bookmark, el servidor realiza una solicitud HTTP a la URL indicada
por el usuario mediante Axios con un timeout de 3 segundos. El HTML se procesa
con Cheerio y se extraen metadatos como título, Open Graph, favicon y URL
canónica.

Actualmente no se observa una allowlist de esquemas, una restricción explícita
contra localhost o rangos privados, ni una política de egress o redirecciones
en `MetadataExtractorService`. Esta es una superficie SSRF que debe tratarse
como pendiente antes de exponer el servicio a tráfico no confiable.

Los valores de URL y parte de los metadatos se registran en logs. No se deben
enviar URLs con credenciales o secretos en la query string y se debe controlar
el nivel y la retención de logs.

## Datos, IA Y Trabajos

Las tareas de generación automática reciben identificadores (`bookmarkId` y
`userId`), no tokens de autenticación. Los workers de BullMQ se ejecutan en el
mismo proceso que la API y usan Redis dedicado, con tres intentos y backoff
exponencial por defecto.

Cuando están activadas las funciones de IA, el texto de los metadatos del
bookmark se envía a Google Gemini para generar embeddings. Antes de habilitar
esta función en producción, debe definirse la política de privacidad, retención
y tratamiento de contenido potencialmente sensible.

## Secretos Y Configuración

Nunca se deben inspeccionar, registrar ni versionar valores reales de `.env`.
`.env.example` solo contiene nombres y placeholders.

Variables sensibles o relacionadas con credenciales:

- `DB_PASSWORD`
- `REDIS_PASSWORD` y `REDIS_QUEUE_PASSWORD`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`
- `GEMINI_API_KEY`

La configuración actual valida que estas variables obligatorias no estén vacías,
pero no exige una longitud o entropía mínima para `JWT_SECRET`. En producción:

- Usa un secreto JWT largo, aleatorio y exclusivo por entorno.
- Mantén las credenciales fuera del repositorio y del sistema de logs.
- Configura `CORS_ORIGIN` con un origen concreto, no con un comodín.
- Habilita TLS y autenticación para Redis cuando el servicio atraviese una red
  no confiable.
- Usa conexiones PostgreSQL protegidas por la infraestructura del entorno.
- Mantén `LOG_LEVEL` en un nivel apropiado para evitar datos innecesarios.

Redis no usa contraseña ni TLS por defecto. El `docker-compose.yml` local
expone ambos Redis en los puertos del host y no configura autenticación; no debe
considerarse una configuración de producción.

## Logging Y Errores

El logging HTTP registra método, URL, status, duración y tamaño de respuesta.
Los servicios pueden registrar user IDs, emails, IPs, user-agents, URLs y
metadatos operativos. Nunca deben registrarse access tokens, refresh tokens,
claves API, contraseñas ni payloads sensibles.

Los errores de dominio se devuelven con su mensaje y código. Los errores no
controlados se registran en el servidor, incluyendo stack cuando está
disponible, y el cliente recibe `500` con `INTERNAL_ERROR` sin detalles
internos.

## Gaps Conocidos

Estos puntos no están resueltos por este documento:

- No hay límites específicos por endpoint para autenticación y refresh.
- No hay protección CSRF implementada. Si los tokens pasan a cookies, deben
  añadirse protección CSRF y atributos de cookie seguros.
- No hay allowlist ni bloqueo de redes privadas para el scraping de URLs.
- No hay suite automatizada ni pipeline CI para regresiones de seguridad.
- La cobertura de anotaciones OpenAPI es parcial y no sustituye controles de
  autorización en runtime.
- Los workers comparten proceso con la API.
- El flujo de refresh actual no agrupa la validación, invalidación y emisión en una
  operación atómica explícita para solicitudes concurrentes.
- `express.json()` no define un límite de tamaño explícito en `src/app.ts`.

## Cambios De Seguridad

Antes de modificar autenticación, autorización, middleware, configuración,
scraping, logs, Redis o workers:

1. Revisa este documento y las fuentes listadas arriba.
2. Actualiza validación, respuestas, logs y documentación afectada junto con el
   cambio funcional.
3. Verifica ownership con un usuario distinto y prueba tokens ausentes,
   inválidos, expirados y revocados.
4. Comprueba que no se hayan añadido secretos al diff ni a los logs.
5. Ejecuta las verificaciones disponibles y documenta cualquier servicio externo
   que no haya podido probarse.

## Reporte De Vulnerabilidades

No publiques credenciales, tokens, datos personales ni una prueba de explotación
en un issue público. Reporta las vulnerabilidades de forma privada al mantenedor
del repositorio e incluye impacto, pasos mínimos de reproducción, versión o
commit afectado y una propuesta de mitigación cuando sea posible.
