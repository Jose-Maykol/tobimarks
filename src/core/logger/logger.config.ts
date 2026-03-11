import type { LoggerOptions } from 'pino'

import { env } from '../config/env.config'

/**
 * Crea la configuración para el logger Pino basada en el entorno actual.
 * En desarrollo, habilita 'pino-pretty' para una salida legible por humanos.
 * En producción, utiliza una salida JSON optimizada para rendimiento y recolección de logs.
 *
 * @returns LoggerOptions - Objeto de configuración para Pino.
 */
export const createLoggerConfig = (): LoggerOptions => {
	const isDevelopment = env.NODE_ENV === 'DEVELOPMENT'

	const baseConfig: LoggerOptions = {
		level: env.LOG_LEVEL,
		timestamp: () => `,"time":"${new Date().toISOString()}"`,
		formatters: {
			level: (label) => ({ level: label })
		}
	}

	if (isDevelopment) {
		return {
			...baseConfig,
			transport: {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:HH:MM:ss.l',
					ignore: 'pid,hostname'
				}
			}
		}
	}

	return baseConfig
}
