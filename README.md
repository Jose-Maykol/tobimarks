# Tobimarks

Tobimarks es una API RESTful avanzada para la gestión de marcadores (bookmarks). Permite a los usuarios guardar, organizar, buscar y extraer metadatos automáticamente de enlaces web, incluyendo soporte para embeddings mediante Inteligencia Artificial (Google Gemini) para sugerencias o búsquedas avanzadas.

## Características Principales

- **Gestión de Marcadores**: Crear, leer, actualizar, archivar y eliminar marcadores. Posibilidad de marcarlos como favoritos.
- **Extracción Automática de Metadatos**: Extrae automáticamente título, descripción, imágenes Open Graph, favicon y URLs canónicas de los enlaces guardados.
- **Autenticación**: Autenticación segura mediante JWT (JSON Web Tokens) y soporte para Google OAuth.
- **Motor de Embeddings**: Integración con Google Gemini AI para procesar inteligencia artificial y embeddings sobre el contenido guardado.
- **Documentación Interactiva**: Documentación de la API generada automáticamente con Swagger y visualizada elegantemente a través de Scalar.

---

## 🛠 Tech Stack

- **Lenguaje**: TypeScript / Node.js
- **Framework Web**: Express 5.1
- **Base de Datos**: PostgreSQL (vía `pg`)
- **Inyección de Dependencias**: `tsyringe`
- **Validación de Datos**: `valibot`
- **Autenticación**: `jsonwebtoken`, `google-auth-library`
- **Inteligencia Artificial**: `@google/genai`
- **Scraping / Metadatos**: `cheerio`, `axios`, `tldts`
- **Seguridad y Utilidades**: `helmet`, `cors`, `express-rate-limit`, `cookie-parser`
- **Documentación API**: `swagger-jsdoc`, `@scalar/express-api-reference`

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes componentes:

- **Node.js**: Versión 20 o superior.
- **PostgreSQL**: Versión 15 o superior.
- **npm**: Versión 9 o superior.
- **Google Cloud Console**: Un proyecto de Google configurado para obtener credenciales OAuth (opcional para desarrollo básico).
- **Google Gemini**: Una clave de API de Gemini (`GEMINI_API_KEY`) para activar las funcionalidades de IA.

---

## 🚀 Empezando (Desarrollo Local)

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/tobimarks.git
cd tobimarks
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configuración de Variables de Entorno

Copia el archivo de ejemplo de variables de entorno para crear el tuyo propio:

```bash
cp .env.example .env
```

Configura las variables dentro del archivo `.env`:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de la base de datos PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `5432` |
| `DB_NAME` | Nombre de la base de datos | `myapp_dev` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña del usuario DB | `tu_contraseña` |
| `APP_PORT` | Puerto donde correrá la API | `3000` |
| `APP_ENV` | Entorno de desarrollo | `DEVELOPMENT` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `cadena_muy_segura_y_larga` |
| `GEMINI_API_KEY`| API Key de Google Gemini AI | `AIzaSy...` |

### 4. Configuración de la Base de Datos

Asegúrate de que PostgreSQL esté en ejecución y crea la base de datos correspondiente al valor de `DB_NAME`:

```sql
CREATE DATABASE myapp_dev;
```

*(Nota: Ejecuta los scripts o queries ubicados en la carpeta `/migrations` dentro de tu gestor de base de datos para crear la estructura de tablas necesaria).*

### 5. Iniciar el Servidor de Desarrollo

Inicia la aplicación en modo "watch" (recarga automática) usando `tsx`:

```bash
npm run dev
```

El servidor debería estar corriendo en [http://localhost:3000](http://localhost:3000).

---

## 🏗 Arquitectura del Proyecto

El proyecto sigue una arquitectura limpia (Clean Architecture) orientada a dominios y módulos, altamente desacoplada gracias al uso de inyección de dependencias (`tsyringe`).

### Estructura de Directorios

```text
├── migrations/          # Scripts SQL de migración para la DB
├── src/
│   ├── common/          # Utilidades, middlewares y componentes compartidos
│   ├── core/            # Configuración base (DB, DI, manejo de errores, IA)
│   │   ├── config/      # Variables de entorno y configuración
│   │   ├── database/    # Gestor de conexiones y queries
│   │   ├── embedding/   # Lógica base de IA (Gemini)
│   │   └── exceptions/  # Jerarquía de errores global
│   ├── modules/         # Dominios principales de negocio
│   │   ├── auth/        # Lógica de autenticación, JWT y Google OAuth
│   │   ├── bookmark/    # Núcleo de la API: Metadatos, etiquetas y sitios web
│   │   └── user/        # Gestión de perfiles de usuario
│   ├── app.ts           # Inicialización de middlewares y rutas base
│   ├── container.ts     # Registro global de dependencias (DI)
│   ├── swagger.ts       # Configuración de especificaciones OpenAPI
│   ├── scalar.ts        # Renderizador interactivo de documentación
│   └── index.ts         # Punto de entrada de la aplicación
├── package.json
└── tsconfig.json
```

### Ciclo de Vida de una Petición

1. **Ruta/Router**: La solicitud HTTP entra por Express (`src/app.ts`).
2. **Middleware**: Pasa por `helmet`, `cors`, validación de JWT, y validadores de `valibot`.
3. **Controlador**: El controlador correspondiente procesa el `Request` y delega la responsabilidad.
4. **Servicio (`.service.ts`)**: Ejecuta la lógica central y de negocio. Al crear un bookmark, por ejemplo, el `MetadataExtractorService` hace web scraping usando `cheerio`.
5. **Repositorio (`.repository.ts`)**: Se encarga del acceso a datos usando queries a PostgreSQL.
6. **Respuesta**: El controlador envía un JSON estructurado de vuelta al cliente.

---

## 📚 Documentación de la API

La API cuenta con especificaciones de OpenAPI generadas a través de `swagger-jsdoc` e interfaz gráfica interactiva potenciada por **Scalar**.

Una vez que la aplicación esté corriendo, entra a:

**👉 Documentación Interactiva:** [http://localhost:3000/reference](http://localhost:3000/reference)

Ahí podrás consultar cada endpoint, tipos de retorno, excepciones y testear peticiones en vivo.

---

## 📜 Scripts Disponibles

En el directorio raíz, puedes ejecutar:

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo usando `tsx watch`. |
| `npm run build` | Compila el código TypeScript a JavaScript puro en la carpeta `dist`. |
| `npm run start` | Ejecuta la aplicación compilada (para entornos de producción). |

---

## 🚢 Despliegue (Deployment)

La aplicación, al estar construida en Node.js, puede ser desplegada fácilmente en plataformas como Render, Railway, Fly.io o en tu propio VPS.

### Despliegue Básico utilizando Docker (Recomendado)

Aunque el proyecto no incluye un `Dockerfile` por defecto, la siguiente estructura básica sirve para containerizar la app:

1. **Compila la App**:
   ```bash
   npm run build
   ```
2. **Inicia el Servidor Producción**:
   Asegúrate de configurar `APP_ENV=PRODUCTION` y luego:
   ```bash
   npm run start
   ```

### Considerando VPS (Ubuntu)

1. **Trae el Código**: `git pull origin main`
2. **Instala PM2** (opcional pero recomendado): `npm install -g pm2`
3. **Instala y Compila**: `npm install && npm run build`
4. **Corre el Proceso**:
   ```bash
   pm2 start dist/index.js --name "tobimarks-api"
   ```
5. ¡No te olvides de configurar Nginx o Apache como *Reverse Proxy* apuntando al `APP_PORT` seleccionado!

---

## ⚠️ Solución de Problemas (Troubleshooting)

### Error: `ECONNREFUSED` hacia la Base de Datos

**Problema:** La aplicación no logra conectar con PostgreSQL.  
**Solución:** Comprueba que PostgreSQL esté ejecutándose y que los valores `DB_HOST`, `DB_PORT`, `DB_USER` y `DB_PASSWORD` en el `.env` sean correctos.

### Error: Metadatos no se extraen

**Problema:** Al crear un bookmark, `MetadataExtractorService` falla al obtener la página.  
**Solución:** Algunas páginas tienen protección *anti-bot* estricta o bloquean las IPs de los servidores. El error está correctamente manejado (arrojará un `UrlForbiddenException` o similar). Si se requiere de manera indispensable, considera usar un proxy rotativo antes de realizar peticiones vía `axios`.

### Error: Inyección de Dependencias no Resuelta

**Problema:** Error de Tsyringe al arrancar la aplicación (`Cannot inject the dependency...`).  
**Solución:** Comprueba que la clase tenga el decorador `@injectable()` y que esté debidamente registrada en el archivo `src/container.ts` o en los tokens inyectables (`di/token`). Todo parámetro del constructor debe estar anotado con `@inject()`.
