import { injectable, inject } from 'tsyringe'

import { GoogleAuthService } from './google-auth.service'
import type { TokenService } from './token.service'
import { GOOGLE_AUTH_SERVICE, TOKEN_SERVICE, REFRESH_TOKEN_REPOSITORY } from '../di/tokens'
import { InvalidRefreshTokenException, TokenExpiredException } from '../exceptions/auth.exceptions'
import type { IRefreshTokenRepository } from '../repositories/refresh-token.repository'
import type { DeviceMetadata } from '../types/auth.types'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import { USER_SERVICE } from '@/modules/user/di/tokens'
import type { UserService } from '@/modules/user/services/user.service'

@injectable()
export class AuthService {
	private readonly logger: ILogger

	constructor(
		@inject(GOOGLE_AUTH_SERVICE) private readonly googleAuthService: GoogleAuthService,
		@inject(USER_SERVICE) private readonly userService: UserService,
		@inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
		@inject(REFRESH_TOKEN_REPOSITORY)
		private readonly refreshTokenRepository: IRefreshTokenRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'AuthService' })
	}

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
	async authenticateWithGoogle(idToken: string, deviceMeta: DeviceMetadata) {
		this.logger.info('Authenticating with Google')
		const { googleId, email, name, picture } = await this.googleAuthService.verifyIdToken(idToken)

		let user = await this.userService.findByGoogleId(googleId)

		if (user === null) {
			this.logger.info('User not found, creating new user', { email })
			user = await this.userService.create({
				googleId,
				email,
				displayName: name,
				avatarUrl: picture ?? null
			})
			this.logger.info('User created successfully', { userId: user.id })
		} else {
			this.logger.info('User found', { userId: user.id })
		}

		const accessToken = await this.tokenService.generateAccessToken({
			sub: user.id,
			email: user.email
		})
		const refreshToken = await this.tokenService.generateRefreshToken()
		const tokenHash = await this.tokenService.hashRefreshToken(refreshToken)

		const expiresAt = new Date()
		expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiration

		await this.refreshTokenRepository.upsert({
			userId: user.id,
			tokenHash,
			deviceId: deviceMeta.deviceId ?? 'unknown-device',
			deviceName: deviceMeta.deviceName ?? null,
			userAgent: deviceMeta.userAgent ?? null,
			ipAddress: deviceMeta.ipAddress ?? null,
			expiresAt
		})

		this.logger.info('Authentication successful', { userId: user.id })
		return { accessToken, refreshToken }
	}

	/**
	 * Refreshes the access token using a refresh token.
	 *
	 * @param refreshToken - The refresh token in plain text to generate a new access token.
	 * @param deviceMeta - Information about the client device that requests the refresh.
	 * @returns A promise resolving to an object containing the new access and refresh tokens.
	 */
	async refreshAccessToken(refreshToken: string, deviceMeta: DeviceMetadata) {
		this.logger.info('Refreshing access token')

		const tokenHash = await this.tokenService.hashRefreshToken(refreshToken)
		const tokenEntity = await this.refreshTokenRepository.findByHash(tokenHash)

		if (!tokenEntity || !tokenEntity.isActive) {
			this.logger.warn('Refresh token is not valid')
			throw new InvalidRefreshTokenException()
		}

		if (new Date() > tokenEntity.expiresAt) {
			this.logger.warn('Refresh token is expired')
			await this.refreshTokenRepository.update(tokenEntity.id, { isActive: false })
			throw new TokenExpiredException()
		}

		const user = await this.userService.getProfile(tokenEntity.userId)
		if (!user) {
			throw new InvalidRefreshTokenException()
		}

		const newAccessToken = await this.tokenService.generateAccessToken({
			sub: user.id,
			email: user.email
		})

		// Implement token rotation
		await this.refreshTokenRepository.update(tokenEntity.id, { isActive: false })

		const newRefreshToken = await this.tokenService.generateRefreshToken()
		const newHash = await this.tokenService.hashRefreshToken(newRefreshToken)
		const expiresAt = new Date()
		expiresAt.setDate(expiresAt.getDate() + 30)

		await this.refreshTokenRepository.upsert({
			userId: user.id,
			tokenHash: newHash,
			deviceId: deviceMeta.deviceId ?? tokenEntity.deviceId,
			deviceName: deviceMeta.deviceName ?? tokenEntity.deviceName,
			userAgent: deviceMeta.userAgent ?? tokenEntity.userAgent,
			ipAddress: deviceMeta.ipAddress ?? tokenEntity.ipAddress,
			expiresAt
		})

		this.logger.info('Access token refreshed successfully')
		return { accessToken: newAccessToken, refreshToken: newRefreshToken }
	}

	/**
	 * Logs out a user by invalidating their refresh token.
	 *
	 * @param refreshToken - The refresh token to invalidate.
	 */
	async logout(refreshToken: string) {
		this.logger.info('Logging out user')
		const tokenHash = await this.tokenService.hashRefreshToken(refreshToken)
		const tokenEntity = await this.refreshTokenRepository.findByHash(tokenHash)

		if (tokenEntity) {
			await this.refreshTokenRepository.update(tokenEntity.id, { isActive: false })
			this.logger.info('Refresh token invalidated successfully')
		} else {
			this.logger.warn('Refresh token not found during logout')
		}
	}
}
