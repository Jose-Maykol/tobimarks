import { randomBytes, createHash, timingSafeEqual } from 'crypto'
import jwt from 'jsonwebtoken'
import { injectable } from 'tsyringe'

import { env } from '../../core/config/env.config'

@injectable()
export class TokenService {
	constructor() {}

	/**
	 * Generate a JWT access token with the provided payload.
	 * @param payload - Object containing claims to include in the JWT.
	 * @returns Promise that resolves to a signed JWT access token as a string.
	 */
	async generateAccessToken(payload: object): Promise<string> {
		const options: jwt.SignOptions = {
			expiresIn: env.JWT_EXPIRES_IN
		}

		return jwt.sign(payload, env.JWT_SECRET, options)
	}

	/**
	 * Validate a JWT access token and return its decoded payload.
	 * @param token - JWT access token to validate.
	 * @returns Promise that resolves to the decoded payload if valid, or an error message string if invalid.
	 */
	async validateAccessToken(token: string): Promise<jwt.JwtPayload | string> {
		try {
			return jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload
		} catch (error: unknown) {
			return 'Invalid token'
		}
	}

	/**
	 * Generate a cryptographically secure opaque refresh token.
	 * @returns Promise that resolves to a random refresh token string.
	 */
	async generateRefreshToken(): Promise<string> {
		return randomBytes(64).toString('base64url')
	}

	/**
	 * Hash a refresh token using SHA-256 and encode as base64url.
	 * @param token - Plain refresh token string to hash.
	 * @returns Promise that resolves to the hashed token string.
	 */
	async hashRefreshToken(token: string): Promise<string> {
		return createHash('sha256').update(token).digest('base64url')
	}

	/**
	 * Validate a refresh token by comparing its hash to a stored hash using a timing-safe comparison.
	 * @param token - Plain refresh token string to validate.
	 * @param hashedToken - Previously stored hashed token string.
	 * @returns Promise that resolves to true if the token is valid, false otherwise.
	 */
	async validateRefreshToken(token: string, hashedToken: string): Promise<boolean> {
		const tokenHash = await this.hashRefreshToken(token)
		return timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hashedToken))
	}
}
