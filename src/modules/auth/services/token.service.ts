import { randomBytes, createHash, timingSafeEqual } from 'crypto'
import jwt from 'jsonwebtoken'
import { inject, injectable } from 'tsyringe'

import type { AccessTokenPayload } from '../types/auth.types'

import { env } from '@/core/config/env.config'
import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'

/**
 * Servicio encargado de generar, validar y realizar el hash de los tokens de autenticación.
 * Proporciona métodos para trabajar con tokens de acceso JWT y tokens de refresco opacos.
 */
@injectable()
export class TokenService {
	private readonly logger: ILogger

	constructor(@inject(LOGGER) logger: ILogger) {
		this.logger = logger.child({ context: 'TokenService' })
	}

	/**
	 * Genera un token de acceso JWT con la carga útil proporcionada.
	 * @param payload Objeto que contiene las reclamaciones (claims) a incluir en el JWT.
	 * @returns Promesa que se resuelve en un token de acceso JWT firmado como string.
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
	 * Valida un token de acceso JWT y devuelve su carga útil decodificada.
	 * @param token Token de acceso JWT a validar.
	 * @returns Promesa que se resuelve en la carga útil decodificada si es válida, o un mensaje de error si no lo es.
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
	 * Genera un token de refresco opaco criptográficamente seguro.
	 * @returns Promesa que se resuelve en un string de token de refresco aleatorio.
	 */
	async generateRefreshToken(): Promise<string> {
		this.logger.info('Generating refresh token')
		const token = randomBytes(64).toString('base64url')
		this.logger.info('Refresh token generated successfully')
		return token
	}

	/**
	 * Realiza el hash de un token de refresco utilizando SHA-256 y lo codifica como base64url.
	 * @param token String del token de refresco en plano para realizar el hash.
	 * @returns Promesa que se resuelve en el string del token hasheado.
	 */
	async hashRefreshToken(token: string): Promise<string> {
		this.logger.info('Hashing refresh token')
		const hash = createHash('sha256').update(token).digest('base64url')
		this.logger.info('Refresh token hashed successfully')
		return hash
	}

	/**
	 * Valida un token de refresco comparando su hash con un hash almacenado utilizando una comparación segura contra ataques de tiempo.
	 * @param token String del token de refresco en plano a validar.
	 * @param hashedToken String del token hasheado almacenado previamente.
	 * @returns Promesa que se resuelve en true si el token es válido, false en caso contrario.
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
