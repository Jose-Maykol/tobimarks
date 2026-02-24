import type { LoggerOptions } from 'pino'

import { env } from '../config/env.config'

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
