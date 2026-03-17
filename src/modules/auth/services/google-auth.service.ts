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
	 * Verifica el token de ID de Google proporcionado y extrae la información del usuario.
	 *
	 * @param idToken - El token de ID de Google a verificar.
	 * @returns Una promesa que se resuelve en la carga útil de autenticación de Google del usuario.
	 * @throws GoogleAuthException - Si el token de ID es inválido.
	 * @throws GoogleEmailMissingException - Si falta el correo electrónico en la carga útil.
	 * @throws GoogleNameMissingException - Si falta el nombre en la carga útil.
	 * @throws InvalidGoogleTokenSignatureException - Si la firma del token es inválida.
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
