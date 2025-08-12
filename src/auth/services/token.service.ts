import { randomBytes, createHash, timingSafeEqual } from 'crypto'
import * as jwt from 'jsonwebtoken'
import { injectable } from 'tsyringe'

import { env } from '../../core/config/env.config'

@injectable()
export class TokenService {
	constructor() {}

	/**
	 * Generates a JWT access token.
	 * @param payload - The payload to include in the JWT.
	 * @returns A promise that resolves to the generated JWT access token.
	 */
	async generateAccessToken(payload: object): Promise<string> {
		const options: jwt.SignOptions = {
			expiresIn: parseInt(env.JWT_EXPIRES_IN, 10)
		}

		return jwt.sign(payload, env.JWT_SECRET, options)
	}

	/**
	 * Validates a JWT access token.
	 * @param token - The JWT access token to validate.
	 * @returns A promise that resolves to the decoded payload or an error message.
	 */
	async validateAccessToken(token: string): Promise<jwt.JwtPayload | string> {
		try {
			return jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload
		} catch (error: unknown) {
			return 'Invalid token'
		}
	}

	/**
	 * Generates an opaque refresh token.
	 * @returns A promise that resolves to the generated refresh token.
	 * @description Generates a cryptographically secure random token of 64 bytes (128 characters in hex).
	 */
	async generateRefreshToken(): Promise<string> {
		return randomBytes(64).toString('hex')
	}

	/**
	 * Hashes a refresh token using SHA-256.
	 * @param token - The refresh token to hash.
	 * @returns A promise that resolves to the hashed refresh token.
	 */
	async hashRefreshToken(token: string): Promise<string> {
		return createHash('sha256').update(token).digest('hex')
	}

	/**
	 * Validates a refresh token against its hashed version.
	 * @param token - The plain refresh token to validate.
	 * @param hashedToken - The hashed version to compare against.
	 * @returns A promise that resolves to true if the token is valid, false otherwise.
	 * @description Uses a timing-safe comparison to prevent timing attacks.
	 */
	async validateRefreshToken(token: string, hashedToken: string): Promise<boolean> {
		const tokenHash = await this.hashRefreshToken(token)
		return timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hashedToken))
	}
}
