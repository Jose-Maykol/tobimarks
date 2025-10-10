import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'tsyringe'

import { USER_SERVICE } from '../di/tokens'
import { UserNotFoundError } from '../exceptions/user.exceptions'
import type { UserService } from '../services/user.service'

import { ApiResponseBuilder } from '@/common/utils/api-response'

@injectable()
export class UserController {
	constructor(@inject(USER_SERVICE) private readonly userService: UserService) {}

	async getProfile(
		req: Request<Record<string, never>, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const profile = await this.userService.getProfile(user.sub)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success({
					user: profile
				})
			)
		} catch (error) {
			if (error instanceof UserNotFoundError) {
				res.status(StatusCodes.NOT_FOUND).json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}
}
