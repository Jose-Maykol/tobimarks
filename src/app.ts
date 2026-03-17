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

const app = express()
const apiRouter = express.Router()

const RATE_LIMIT_WINDOW_MS: number = 15 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS: number = 500
const RATE_LIMIT_MESSAGE: string = 'Too many requests, please try again later.'

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		credentials: true
	})
)

const limiter = rateLimit({
	windowMs: RATE_LIMIT_WINDOW_MS,
	max: RATE_LIMIT_MAX_REQUESTS,
	standardHeaders: true,
	legacyHeaders: false,
	message: RATE_LIMIT_MESSAGE
})

app.use(limiter)

app.use(helmet())
app.use(cookieParser())

const logger = container.resolve<ILogger>(LOGGER)
app.use(httpLoggerMiddleware(logger))

app.use(express.json())

app.use('/api-docs', apiReference(scalarConfig))

app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'Welcome to the Tobimarks API', version: '0.0.1' })
})

apiRouter.use('/auth', authRouter)

apiRouter.use('/users', (await import('./modules/user/routes/user.routes')).userRoutes)

apiRouter.use(
	'/bookmarks',
	(await import('./modules/bookmark/routes/bookmark.routes')).bookmarkRoutes
)

apiRouter.use(
	'/collections',
	(await import('./modules/collection/routes/collection.routes')).collectionRoutes
)

apiRouter.use('/tags', (await import('./modules/bookmark/routes/tag.routes')).tagRoutes)

apiRouter.use('/websites', (await import('./modules/bookmark/routes/website.routes')).websiteRoutes)

apiRouter.use(
	'/statistics',
	(await import('./modules/statistics/routes/statistics.routes')).statisticsRoutes
)

app.use('/api', apiRouter)

app.use(errorHandlerMiddleware(logger))

export { app }
