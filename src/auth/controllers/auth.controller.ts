import type { Request, Response } from 'express'
import { injectable } from 'tsyringe'

@injectable()
export class AuthController {
	constructor(/* private authService: AuthService */) {}

	async googleAuth(req: Request, res: Response): Promise<void> {
		// Implementation for Google authentication
	}

	async refreshToken(req: Request, res: Response): Promise<void> {
		// Implementation for refreshing token
	}

	async logout(req: Request, res: Response): Promise<void> {
		// Implementation for logging out
	}
}
