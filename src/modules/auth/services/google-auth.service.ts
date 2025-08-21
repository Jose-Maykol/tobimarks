import { OAuth2Client } from 'google-auth-library'
import { injectable } from 'tsyringe'

import {
	GoogleAuthException,
	GoogleEmailMissingException,
	GoogleNameMissingException,
	InvalidGoogleTokenSignatureException
} from '../exceptions/auth.exceptions'

import { env } from '@/core/config/env.config'

export interface GoogleAuthPayload {
	googleId: string
	email: string
	name: string
	picture: string | undefined
}

@injectable()
export class GoogleAuthService {
	private readonly googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

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
			if (err instanceof Error && err.message.includes('Invalid token signature')) {
				throw new InvalidGoogleTokenSignatureException()
			}
			throw err
		}
	}
}
