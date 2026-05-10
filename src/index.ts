/**
 * @file index.ts
 * @description Punto de entrada principal de la aplicación Tobimarks.
 * Se encarga de inicializar el contenedor de dependencias, cargar la configuración
 * y arrancar el servidor Express.
 */

import 'reflect-metadata'
import 'dotenv/config'

import { container } from 'tsyringe'

import { configureContainer } from './container'
import { env } from './core/config/env.config'
import { LOGGER } from './core/di/tokens'
import type { ILogger } from './core/logger/logger'

/**
 * Inicializa y arranca el servidor de la aplicación.
 * Configura la inyección de dependencias y levanta el servicio en el puerto configurado.
 *
 * @async
 * @function startServer
 * @returns {Promise<void>}
 */
async function startServer() {
	// Configura el contenedor de dependencias (tsyringe)
	configureContainer()

	const logger = container.resolve<ILogger>(LOGGER)

	const { app } = await import('./app')

	app.listen(env.PORT, () => {
		logger.info('Servidor iniciado correctamente', {
			port: env.PORT,
			environment: env.NODE_ENV,
			logLevel: env.LOG_LEVEL
		})
	})
}

startServer().catch((error: unknown) => {
	console.error('Error fatal al iniciar el servidor:', error)
	process.exit(1)
})
