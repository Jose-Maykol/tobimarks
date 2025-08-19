import { OAuth2Client } from 'google-auth-library'
import { injectable, inject } from 'tsyringe'

import type { TokenService } from './token.service'

import { env } from '@/core/config/env.config'
import { TOKEN_SERVICE, USER_SERVICE } from '@/modules/user/di/tokens'
import type { UserService } from '@/modules/user/services/user.service'

@injectable()
export class AuthService {
	private readonly googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

	constructor(
		@inject(USER_SERVICE) private readonly userService: UserService,
		@inject(TOKEN_SERVICE) private readonly tokenService: TokenService
	) {}

	async authenticateWithGoogle(idToken: string) {
		const ticket = await this.googleClient.verifyIdToken({
			idToken,
			audience: env.GOOGLE_CLIENT_ID
		})

		const payload = ticket.getPayload()

		if (!payload) throw new Error('Invalid ID token')

		const { sub: googleId, email, name, picture } = payload

		if (!email) {
			throw new Error('Email not provided by Google')
		}

		if (!name) {
			throw new Error('Name not provided by Google')
		}

		let user = await this.userService.findByGoogleId(googleId)

		if (user === null) {
			user = await this.userService.create({
				googleId,
				email: email,
				displayName: name,
				avatarUrl: picture ?? null
			})
		}

		const accessToken = await this.tokenService.generateAccessToken({
			sub: user.id,
			email: user.email
		})
		const refreshToken = await this.tokenService.generateRefreshToken()

		//TODO: Save refresh token

		return { accessToken, refreshToken }
	}

	async refreshAccessToken(refreshToken: string) {
		// Validar y generar nuevo access token
		return { accessToken: 'nuevoToken' }
	}

	async logout(refreshToken: string) {
		// Invalidar refresh token
	}
}
