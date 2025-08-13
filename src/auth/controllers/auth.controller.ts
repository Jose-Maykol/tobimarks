import type { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'tsyringe'

import { AUTH_SERVICE } from '../di/tokens'
import { AuthService } from '../services/auth.service'
import type { GoogleAuthInput } from '../types/auth.types'

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
			res.status(200).json(tokens)
		} catch (err) {
			console.error('Error during Google authentication:', err)
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
