import 'dotenv/config'
import 'reflect-metadata'

import { container } from 'tsyringe'

import { configureContainer } from './container'
import { env } from './core/config/env.config'
import { LOGGER } from './core/di/tokens'
import type { ILogger } from './core/logger/logger'

async function startServer() {
	configureContainer()

	const logger = container.resolve<ILogger>(LOGGER)

	const { app } = await import('./app')
	app.listen(env.PORT, () => {
		logger.info('Server started', {
			port: env.PORT,
			environment: env.NODE_ENV,
			logLevel: env.LOG_LEVEL
		})
	})
}

startServer().catch((error: unknown) => {
	console.error('Failed to start server:', error)
	process.exit(1)
})
