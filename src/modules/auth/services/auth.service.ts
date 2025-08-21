import { injectable, inject } from 'tsyringe'

import { GoogleAuthService } from './google-auth.service'
import type { TokenService } from './token.service'
import { GOOGLE_AUTH_SERVICE, TOKEN_SERVICE } from '../di/tokens'

import { USER_SERVICE } from '@/modules/user/di/tokens'
import type { UserService } from '@/modules/user/services/user.service'

@injectable()
export class AuthService {
	constructor(
		@inject(GOOGLE_AUTH_SERVICE) private readonly googleAuthService: GoogleAuthService,
		@inject(USER_SERVICE) private readonly userService: UserService,
		@inject(TOKEN_SERVICE) private readonly tokenService: TokenService
	) {}

	async authenticateWithGoogle(idToken: string) {
		const { googleId, email, name, picture } = await this.googleAuthService.verifyIdToken(idToken)

		let user = await this.userService.findByGoogleId(googleId)

		if (user === null) {
			user = await this.userService.create({
				googleId,
				email,
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
