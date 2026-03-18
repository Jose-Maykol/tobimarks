import { injectable, inject } from 'tsyringe'

import { GoogleAuthService } from './google-auth.service'
import type { TokenService } from './token.service'
import {
	GOOGLE_AUTH_SERVICE,
	TOKEN_SERVICE,
	REFRESH_TOKEN_REPOSITORY,
	ALLOWED_EMAIL_REPOSITORY
} from '../di/tokens'
import {
	EmailNotWhitelistedException,
	InvalidRefreshTokenException,
	TokenExpiredException
} from '../exceptions/auth.exceptions'
import type { IAllowedEmailRepository } from '../repositories/allowed-email.repository'
import type { IRefreshTokenRepository } from '../repositories/refresh-token.repository'
import type { DeviceMetadata } from '../types/auth.types'

import { env } from '@/core/config/env.config'
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
		@inject(ALLOWED_EMAIL_REPOSITORY)
		private readonly allowedEmailRepository: IAllowedEmailRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'AuthService' })
	}

	/**
	 * Autentica a un usuario utilizando un token de ID de Google.
	 *
	 * @param idToken - El token de ID de Google para autenticar al usuario.
	 * @param deviceMeta - Metadatos del dispositivo para el registro de la sesión.
	 * @returns Una promesa que se resuelve en un objeto que contiene los tokens de acceso y refresco.
	 * @throws GoogleAuthException - Si el token de ID es inválido.
	 * @throws GoogleEmailMissingException - Si el correo electrónico falta en la carga útil.
	 * @throws GoogleNameMissingException - Si el nombre falta en la carga útil.
	 * @throws InvalidGoogleTokenSignatureException - Si la firma del token es inválida.
	 */
	async authenticateWithGoogle(idToken: string, deviceMeta: DeviceMetadata) {
		this.logger.info('Beginning Google authentication')
		const { googleId, email, name, picture } = await this.googleAuthService.verifyIdToken(idToken)
		this.logger.debug('Google token verified', { email, googleId })

		if (env.ENABLE_EMAIL_WHITELIST) {
			this.logger.info('Email whitelist is enabled, checking email')
			const isAllowed = await this.allowedEmailRepository.isEmailAllowed(email)
			if (!isAllowed) {
				this.logger.warn('Email is not whitelisted', { email })
				throw new EmailNotWhitelistedException()
			}
			this.logger.info('Email is whitelisted', { email })
		}

		let user = await this.userService.findByGoogleId(googleId)

		if (user === null) {
			this.logger.info('No existing user found. Creating new profile.', { email })
			user = await this.userService.create({
				googleId,
				email,
				displayName: name,
				avatarUrl: picture ?? null
			})
			this.logger.info('New user profile created', { userId: user.id, email })
		} else {
			this.logger.info('Existing user found', { userId: user.id, email })
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
	 * Refresca el token de acceso utilizando un token de refresco.
	 *
	 * @param refreshToken - El token de refresco en texto plano para generar un nuevo token de acceso.
	 * @param deviceMeta - Información sobre el dispositivo del cliente que solicita el refresco.
	 * @returns Una promesa que se resuelve en un objeto que contiene los nuevos tokens de acceso y refresco.
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
	 * Cierra la sesión de un usuario invalidando su token de refresco.
	 *
	 * @param refreshToken - El token de refresco a invalidar.
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
