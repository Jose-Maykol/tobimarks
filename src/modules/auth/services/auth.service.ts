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

	/**
	 * Authenticates a user using a Google ID token.
	 *
	 * @param idToken - The Google ID token to authenticate the user.
	 * @returns A promise resolving to an object containing access and refresh tokens.
	 * @throws GoogleAuthException - If the ID token is invalid.
	 * @throws GoogleEmailMissingException - If the email is missing in the payload.
	 * @throws GoogleNameMissingException - If the name is missing in the payload.
	 * @throws InvalidGoogleTokenSignatureException - If the token signature is invalid.
	 */
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

	/**
	 * Refreshes the access token using a refresh token.
	 *
	 * @param refreshToken - The refresh token to generate a new access token.
	 * @returns A promise resolving to an object containing the new access token.
	 */
	async refreshAccessToken(refreshToken: string) {
		// Validar y generar nuevo access token
		return { accessToken: 'nuevoToken' }
	}

	/**
	 * Logs out a user by invalidating the refresh token.
	 *
	 * @param refreshToken - The refresh token to invalidate.
	 */
	async logout(refreshToken: string) {
		// Invalidar refresh token
	}
}
