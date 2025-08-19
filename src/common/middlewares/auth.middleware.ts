import type { Request, Response, NextFunction } from 'express'
import { container } from 'tsyringe'

import { TokenService } from '@/modules/auth/services/token.service'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

declare module 'express' {
	interface Request {
		user?: AccessTokenPayload
	}
}

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const authHeader: string | undefined = req.headers.authorization

	if (!authHeader) {
		res.status(401).json({ message: 'Unauthorized' })
		return
	}

	const token: string | undefined = authHeader.split(' ')[1]

	if (!token) {
		res.status(401).json({ message: 'Unauthorized' })
		return
	}

	const tokenService: TokenService = container.resolve(TokenService)
	const decoded = await tokenService.validateAccessToken(token)

	if (typeof decoded === 'string') {
		res.status(401).json({ message: 'Unauthorized' })
		return
	}

	req.user = decoded
	next()
}
