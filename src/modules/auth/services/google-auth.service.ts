import { OAuth2Client } from 'google-auth-library'
import { inject, injectable } from 'tsyringe'

import {
	GoogleAuthException,
	GoogleEmailMissingException,
	GoogleNameMissingException,
	InvalidGoogleTokenSignatureException
} from '../exceptions/auth.exceptions'
import type { GoogleAuthPayload } from '../types/auth.types'

import { env } from '@/core/config/env.config'
import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'

@injectable()
export class GoogleAuthService {
	private readonly googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)
	private readonly logger: ILogger

	constructor(@inject(LOGGER) logger: ILogger) {
		this.logger = logger.child({ context: 'GoogleAuthService' })
	}

	/**
	 * Verifies the provided Google ID token and extracts user information.
	 *
	 * @param idToken - The Google ID token to verify.
	 * @returns A promise resolving to the user's Google authentication payload.
	 * @throws GoogleAuthException - If the ID token is invalid.
	 * @throws GoogleEmailMissingException - If the email is missing in the payload.
	 * @throws GoogleNameMissingException - If the name is missing in the payload.
	 * @throws InvalidGoogleTokenSignatureException - If the token signature is invalid.
	 */
	async verifyIdToken(idToken: string): Promise<GoogleAuthPayload> {
		this.logger.info('Verifying Google ID token')
		try {
			const ticket = await this.googleClient.verifyIdToken({
				idToken,
				audience: env.GOOGLE_CLIENT_ID
			})

			const payload = ticket.getPayload()

			if (!payload) {
				this.logger.warn('Google ID token verification failed: Missing payload')
				throw new GoogleAuthException()
			}

			const { sub: googleId, email, name, picture } = payload

			if (!email) {
				this.logger.warn('Google ID token verification failed: Missing email')
				throw new GoogleEmailMissingException()
			}
			if (!name) {
				this.logger.warn('Google ID token verification failed: Missing name')
				throw new GoogleNameMissingException()
			}

			this.logger.info('Google ID token verified successfully', { email })
			return {
				googleId,
				email,
				name,
				picture
			}
		} catch (err) {
			if (err instanceof InvalidGoogleTokenSignatureException) {
				this.logger.warn('Invalid Google token signature')
				throw err
			}
			if (err instanceof Error && err.message.includes('Invalid token signature')) {
				this.logger.warn('Invalid Google token signature pattern detected')
				throw new InvalidGoogleTokenSignatureException()
			}
			this.logger.error('Error verifying Google ID token', { error: err })
			throw err
		}
	}
}
