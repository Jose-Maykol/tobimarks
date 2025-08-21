import type { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { injectable, inject } from 'tsyringe'

import { AUTH_SERVICE } from '../di/tokens'
import {
	GoogleAuthException,
	GoogleEmailMissingException,
	GoogleNameMissingException,
	InvalidGoogleTokenSignatureException
} from '../exceptions/auth.exceptions'
import { AuthService } from '../services/auth.service'
import type { GoogleAuthInput } from '../types/auth.types'

import { ApiResponseBuilder } from '@/common/utils/api-response'

/**
 * Controller for handling authentication-related HTTP requests.
 */
@injectable()
export class AuthController {
	constructor(@inject(AUTH_SERVICE) private readonly authService: AuthService) {}

	/**
	 * Handles Google authentication by verifying the ID token and returning tokens.
	 *
	 * @param req - The HTTP request object containing the Google ID token in the body.
	 * @param res - The HTTP response object to send the tokens.
	 * @param next - The next middleware function to handle errors.
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
			if (err instanceof InvalidGoogleTokenSignatureException) {
				res.status(StatusCodes.UNAUTHORIZED).json(ApiResponseBuilder.error(err.message, err.code))
				return
			}
			next(err)
		}
	}

	/**
	 * Refreshes the authentication token using a refresh token.
	 *
	 * @param req - The HTTP request object containing the refresh token.
	 * @param res - The HTTP response object to send the new access token.
	 * @param next - The next middleware function to handle errors.
	 */
	async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
		// Implementation for refreshing token
	}

	/**
	 * Logs out the user by invalidating the refresh token.
	 *
	 * @param req - The HTTP request object containing the refresh token.
	 * @param res - The HTTP response object to confirm logout.
	 * @param next - The next middleware function to handle errors.
	 */
	async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
		// Implementation for logging out
	}
}
