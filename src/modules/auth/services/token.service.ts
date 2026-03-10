import { randomBytes, createHash, timingSafeEqual } from 'crypto'
import jwt from 'jsonwebtoken'
import { inject, injectable } from 'tsyringe'

import type { AccessTokenPayload } from '../types/auth.types'

import { env } from '@/core/config/env.config'
import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'

/**
 * Service responsible for generating, validating, and hashing authentication tokens.
 * Provides methods for working with JWT access tokens and opaque refresh tokens.
 */
@injectable()
export class TokenService {
	private readonly logger: ILogger

	constructor(@inject(LOGGER) logger: ILogger) {
		this.logger = logger.child({ context: 'TokenService' })
	}

	/**
	 * Generate a JWT access token with the provided payload.
	 * @param payload Object containing claims to include in the JWT.
	 * @returns Promise that resolves to a signed JWT access token as a string.
	 */
	async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
		this.logger.info('Generating access token', { payload: { sub: payload.sub } })
		const options: jwt.SignOptions = {
			expiresIn: env.JWT_EXPIRES_IN
		}

		const token = jwt.sign(payload, env.JWT_SECRET, options)
		this.logger.info('Access token generated successfully')
		return token
	}

	/**
	 * Validate a JWT access token and return its decoded payload.
	 * @param token JWT access token to validate.
	 * @returns Promise that resolves to the decoded payload if valid, or an error message string if invalid.
	 */
	async validateAccessToken(token: string): Promise<AccessTokenPayload | string> {
		this.logger.info('Validating access token')
		try {
			const decoded = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload
			this.logger.info('Access token validated successfully', { userId: decoded.sub })
			return decoded
		} catch (error: unknown) {
			this.logger.warn('Invalid access token', { error })
			//TODO: improve error handling
			return 'Invalid token'
		}
	}

	/**
	 * Generate a cryptographically secure opaque refresh token.
	 * @returns Promise that resolves to a random refresh token string.
	 */
	async generateRefreshToken(): Promise<string> {
		this.logger.info('Generating refresh token')
		const token = randomBytes(64).toString('base64url')
		this.logger.info('Refresh token generated successfully')
		return token
	}

	/**
	 * Hash a refresh token using SHA-256 and encode as base64url.
	 * @param token Plain refresh token string to hash.
	 * @returns Promise that resolves to the hashed token string.
	 */
	async hashRefreshToken(token: string): Promise<string> {
		this.logger.info('Hashing refresh token')
		const hash = createHash('sha256').update(token).digest('base64url')
		this.logger.info('Refresh token hashed successfully')
		return hash
	}

	/**
	 * Validate a refresh token by comparing its hash to a stored hash using a timing-safe comparison.
	 * @param token Plain refresh token string to validate.
	 * @param hashedToken Previously stored hashed token string.
	 * @returns Promise that resolves to true if the token is valid, false otherwise.
	 */
	async validateRefreshToken(token: string, hashedToken: string): Promise<boolean> {
		this.logger.info('Validating refresh token hash')
		const tokenHash: string = await this.hashRefreshToken(token)
		const isValid = timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hashedToken))
		if (isValid) {
			this.logger.info('Refresh token hash validated successfully')
		} else {
			this.logger.warn('Refresh token hash validation failed')
		}
		return isValid
	}
}
