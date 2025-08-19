import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'

export interface ValidationSchemas {
	body?: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
	params?: v.BaseSchema<unknown, Record<string, string>, v.BaseIssue<unknown>>
	query?: v.BaseSchema<unknown, Record<string, string>, v.BaseIssue<unknown>>
}

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
				req.query = v.parse(schemas.query, req.query)
			}
			next()
		} catch (error) {
			if (error instanceof v.ValiError) {
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
