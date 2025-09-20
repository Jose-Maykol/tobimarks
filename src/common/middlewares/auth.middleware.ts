import type { Response, NextFunction, RequestHandler } from 'express'
import type { Request as ExpressRequest } from 'express'
import { StatusCodes } from 'http-status-codes'
import { container } from 'tsyringe'

import { ApiResponseBuilder } from '../utils/api-response'

import { AuthErrorCode } from '@/modules/auth/exceptions/auth.exceptions'
import { TokenService } from '@/modules/auth/services/token.service'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

declare module 'express' {
	interface Request {
		user?: AccessTokenPayload
	}
}

export const authMiddleware: RequestHandler = async (
	req: ExpressRequest,
	res: Response,
	next: NextFunction
) => {
	/* const authReq = req as AuthRequest */
	const authHeader: string | undefined = req.headers.authorization

	if (!authHeader) {
		res
			.status(StatusCodes.UNAUTHORIZED)
			.json(
				ApiResponseBuilder.error(
					'Encabezado de autorización ausente',
					AuthErrorCode.ACCESS_HEADER_MISSING
				)
			)
		return
	}

	const token: string | undefined = authHeader.split(' ')[1]

	if (!token) {
		res
			.status(StatusCodes.UNAUTHORIZED)
			.json(ApiResponseBuilder.error('Token Bearer ausente', AuthErrorCode.ACCESS_TOKEN_MISSING))
		return
	}

	const tokenService: TokenService = container.resolve(TokenService)
	const decoded = await tokenService.validateAccessToken(token)

	if (typeof decoded === 'string') {
		res
			.status(StatusCodes.UNAUTHORIZED)
			.json(
				ApiResponseBuilder.error('Token inválido o expirado', AuthErrorCode.ACCESS_TOKEN_INVALID)
			)
		return
	}

	req.user = decoded
	next()
}
