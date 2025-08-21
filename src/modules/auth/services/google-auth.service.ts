import { OAuth2Client } from 'google-auth-library'
import { injectable } from 'tsyringe'

import {
	GoogleAuthException,
	GoogleEmailMissingException,
	GoogleNameMissingException,
	InvalidGoogleTokenSignatureException
} from '../exceptions/auth.exceptions'
import type { GoogleAuthPayload } from '../types/auth.types'

import { env } from '@/core/config/env.config'
@injectable()
export class GoogleAuthService {
	private readonly googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

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
		try {
			const ticket = await this.googleClient.verifyIdToken({
				idToken,
				audience: env.GOOGLE_CLIENT_ID
			})

			const payload = ticket.getPayload()

			if (!payload) {
				throw new GoogleAuthException()
			}

			const { sub: googleId, email, name, picture } = payload

			if (!email) {
				throw new GoogleEmailMissingException()
			}
			if (!name) {
				throw new GoogleNameMissingException()
			}

			return {
				googleId,
				email,
				name,
				picture
			}
		} catch (err) {
			if (err instanceof InvalidGoogleTokenSignatureException) {
				throw err
			}
			if (err instanceof Error && err.message.includes('Invalid token signature')) {
				throw new InvalidGoogleTokenSignatureException()
			}
			throw err
		}
	}
}
