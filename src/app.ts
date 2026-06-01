/**
 * @file app.ts
 * @description Configuración principal de la aplicación Express para la API de Tobimarks.
 * Este archivo inicializa el servidor, configura los middlewares globales y define las rutas principales.
 */

import { apiReference } from '@scalar/express-api-reference'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { container } from 'tsyringe'

import { errorHandlerMiddleware } from './common/middlewares/error-handler.middleware'
import { httpLoggerMiddleware } from './common/middlewares/http-logger.middleware'
import { env } from './core/config/env.config'
import { LOGGER } from './core/di/tokens'
import type { ILogger } from './core/logger/logger'
import { authRouter } from './modules/auth/routes/auth.routes'
import { scalarConfig } from './scalar'

/**
 * Instancia principal de la aplicación Express.
 */
const app = express()

/**
 * Enrutador principal para organizar las rutas de la API bajo el prefijo /api.
 */
const apiRouter = express.Router()

/**
 * Configuración del límite de peticiones (Rate Limiting).
 * Previene el abuso del servidor limitando el número de solicitudes por ventana de tiempo.
 */
const RATE_LIMIT_WINDOW_MS: number = 15 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS: number = 500
const RATE_LIMIT_MESSAGE: string = 'Demasiadas peticiones, por favor inténtelo de nuevo más tarde.'

// Configuración de CORS con origen dinámico desde las variables de entorno
app.use(
	cors({
		origin: env.CORS_ORIGIN,
		credentials: true
	})
)

/**
 * Middleware para limitar el tráfico de red.
 */
const limiter = rateLimit({
	windowMs: RATE_LIMIT_WINDOW_MS,
	max: RATE_LIMIT_MAX_REQUESTS,
	standardHeaders: true,
	legacyHeaders: false,
	message: RATE_LIMIT_MESSAGE
})

app.use(limiter)

// Middlewares de seguridad (Helmet) y gestión de cookies
app.use(helmet())
app.use(cookieParser())

// Inyección de dependencias para el logger y middleware de registro HTTP
const logger = container.resolve<ILogger>(LOGGER)
app.use(httpLoggerMiddleware(logger))

// Parser para procesar cuerpos de peticiones en formato JSON
app.use(express.json())

/**
 * Documentación interactiva de la API (Scalar).
 * Disponible en: /api-docs
 */
app.use('/api-docs', apiReference(scalarConfig))

/**
 * Ruta base de bienvenida para verificar el estado de la API.
 */
app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'Bienvenido a la API de Tobimarks', version: '0.0.1' })
})

/**
 * Registro de rutas de los módulos de la aplicación.
 */

// Autenticación y gestión de sesiones
apiRouter.use('/auth', authRouter)

// Gestión de marcadores (bookmarks)
apiRouter.use(
	'/bookmarks',
	(await import('./modules/bookmark/routes/bookmark.routes')).bookmarkRoutes
)

// Gestión de colecciones de marcadores
apiRouter.use(
	'/collections',
	(await import('./modules/collection/routes/collection.routes')).collectionRoutes
)

// Estadísticas de uso y actividad
apiRouter.use(
	'/statistics',
	(await import('./modules/statistics/routes/statistics.routes')).statisticsRoutes
)

// Gestión de etiquetas (tags) para marcadores
apiRouter.use('/tags', (await import('./modules/bookmark/routes/tag.routes')).tagRoutes)

// Gestión de usuarios y perfiles
apiRouter.use('/users', (await import('./modules/user/routes/user.routes')).userRoutes)

// Gestión de sitios web y metadatos asociados
apiRouter.use('/websites', (await import('./modules/bookmark/routes/website.routes')).websiteRoutes)

// Aplicar el enrutador de la API con el prefijo global
app.use('/api', apiRouter)

/**
 * Middleware global para la gestión centralizada de errores.
 */
app.use(errorHandlerMiddleware(logger))

export { app }
