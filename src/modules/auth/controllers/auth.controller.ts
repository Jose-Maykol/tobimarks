import type { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { injectable, inject } from 'tsyringe'

import { AUTH_SERVICE } from '../di/tokens'
import {
	GoogleAuthException,
	GoogleEmailMissingException,
	GoogleNameMissingException
} from '../exceptions/auth.exceptions'
import { AuthService } from '../services/auth.service'
import type { GoogleAuthInput } from '../types/auth.types'

import { AuthErrorCode } from '@/common/errors/auth.errors'
import { ApiResponseBuilder } from '@/common/utils/api-response'

@injectable()
export class AuthController {
	constructor(@inject(AUTH_SERVICE) private readonly authService: AuthService) {}

	/**
	 * Handles Google authentication.
	 * @param req - The HTTP request object.
	 * @param res - The HTTP response object.
	 * @param next - The next middleware function.
	 */
	async googleAuth(
		req: Request<Record<string, never>, Record<string, never>, GoogleAuthInput>,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const { idToken } = req.body
			const tokens = await this.authService.authenticateWithGoogle(idToken)
			res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success({
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken
				})
			)
		} catch (err) {
			if (err instanceof GoogleAuthException) {
				res.status(StatusCodes.UNAUTHORIZED).json(ApiResponseBuilder.error(err.message, err.code))
				return
			}
			if (err instanceof GoogleEmailMissingException) {
				res.status(StatusCodes.BAD_REQUEST).json(ApiResponseBuilder.error(err.message, err.code))
				return
			}
			if (err instanceof GoogleNameMissingException) {
				res.status(StatusCodes.BAD_REQUEST).json(ApiResponseBuilder.error(err.message, err.code))
				return
			}
			//TODO: IMPROVE THIS
			const message =
				typeof err === 'object' && err !== null && 'message' in err
					? String((err as { message: string }).message)
					: ''
			console.log(typeof err)
			if (message.includes('Invalid token signature')) {
				res
					.status(StatusCodes.UNAUTHORIZED)
					.json(
						ApiResponseBuilder.error(
							'Invalid Google token signature. Please try again with a valid token.',
							AuthErrorCode.INVALID_GOOGLE_TOKEN_SIGNATURE
						)
					)
				return
			}
			next(err)
		}
	}

	/**
	 * Refreshes the authentication token.
	 * @param req - The HTTP request object.
	 * @param res - The HTTP response object.
	 * @param next - The next middleware function.
	 */
	async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
		// Implementation for refreshing token
	}

	/**
	 * Logs out the user.
	 * @param req - The HTTP request object.
	 * @param res - The HTTP response object.
	 * @param next - The next middleware function.
	 */
	async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
		// Implementation for logging out
	}
}
