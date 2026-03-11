import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'

/**
 * ValidationSchemas define las áreas de la solicitud que serán validadas.
 * Utiliza esquemas de Valibot para el cuerpo (body), parámetros de ruta (params) y cadenas de consulta (query).
 */
export interface ValidationSchemas {
	body?: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
	params?: v.BaseSchema<unknown, Record<string, string>, v.BaseIssue<unknown>>
	query?: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
}

/**
 * Función de middleware de orden superior que valida las solicitudes entrantes contra los esquemas proporcionados.
 *
 * @param schemas - Un objeto que contiene esquemas de Valibot para body, params o query.
 * @returns Una función de middleware de Express que realiza la validación.
 *
 * @example
 * router.post('/login', validateRequest({ body: LoginSchema }), authController.login)
 */
export const validateRequest = (schemas: ValidationSchemas) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (schemas.body) {
				req.body = v.parse(schemas.body, req.body)
			}

			if (schemas.params) {
				req.params = v.parse(schemas.params, req.params)
			}

			if (schemas.query) {
				const parsed = v.parse(schemas.query, req.query)
				Object.defineProperty(req, 'query', {
					value: parsed,
					writable: true,
					configurable: true,
					enumerable: true
				})
			}
			next()
		} catch (error) {
			if (error instanceof v.ValiError) {
				//TODO: Mejorar el formato del error, estandarizarlo con el formato estandar
				return res.status(StatusCodes.BAD_REQUEST).json({
					success: false,
					message: 'Validation failed',
					errors: error.issues.map((issue) => ({
						path: issue.path?.map((p: { key: string }) => p.key).join('.'),
						message: issue.message,
						received: issue.received
					}))
				})
			}
			next(error)
		}
	}
}
