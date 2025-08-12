import { OAuth2Client } from 'google-auth-library'
import { injectable } from 'tsyringe'

import { env } from '@/core/config/env.config'

@injectable()
export class AuthService {
	private readonly googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

	constructor() {}

	async authenticateWithGoogle(idToken: string) {
		const ticket = await this.googleClient.verifyIdToken({
			idToken,
			audience: env.GOOGLE_CLIENT_ID
		})
		const payload = ticket.getPayload()
		if (!payload) throw new Error('Invalid ID token')

		const { sub: googleId, email, name, picture } = payload

		//TODO: Save in repository
		//TODO: Create JWT tokens

		return { accessToken: 'xxx', refreshToken: 'yyy' }
	}

	async refreshAccessToken(refreshToken: string) {
		// Validar y generar nuevo access token
		return { accessToken: 'nuevoToken' }
	}

	async logout(refreshToken: string) {
		// Invalidar refresh token
	}
}
