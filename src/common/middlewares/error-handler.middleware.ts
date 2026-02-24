import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { BaseException } from '../errors/base-erxception'
import { ApiResponseBuilder } from '../utils/api-response'

import type { ILogger } from '@/core/logger/logger'

/**
 * Factory que crea un middleware centralizado de manejo de errores con logging.
 * Distingue entre errores de dominio (BaseException) y errores inesperados del sistema.
 *
 * @param logger - Instancia de ILogger para emitir logs de errores.
 * @returns Middleware Express de manejo de errores.
 */
export const errorHandlerMiddleware = (logger: ILogger) => {
	return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
		if (err instanceof BaseException) {
			logger.warn('Domain error', {
				name: err.name,
				code: err.code,
				message: err.message
			})

			return res
				.status(StatusCodes.BAD_REQUEST)
				.json(ApiResponseBuilder.error(err.message, err.code))
		}

		logger.error('Unhandled error', {
			name: err.name,
			message: err.message,
			stack: err.stack
		})

		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json(ApiResponseBuilder.error('Internal server error', 'INTERNAL_ERROR'))
	}
}
