import type { NextFunction, Request, Response } from 'express'

import type { ILogger } from '@/core/logger/logger'

/**
 * Factory que crea un middleware Express para loguear requests HTTP en formato JSON.
 * Proporciona logs estructurados con método, URL, status y duración.
 *
 * @param logger - Instancia de ILogger para emitir logs.
 * @returns Middleware Express que loguea cada request HTTP.
 */
export const httpLoggerMiddleware = (logger: ILogger) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const start = Date.now()

		res.on('finish', () => {
			const duration = Date.now() - start
			const statusCode = res.statusCode

			const logData: Record<string, unknown> = {
				method: req.method,
				url: req.originalUrl,
				statusCode,
				responseTime: `${duration}ms`,
				contentLength: res.get('content-length') ?? 0
			}

			if (statusCode >= 500) {
				logger.error('HTTP Request', logData)
			} else if (statusCode >= 400) {
				logger.warn('HTTP Request', logData)
			} else {
				logger.info('HTTP Request', logData)
			}
		})

		next()
	}
}
