import type { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { injectable, inject } from 'tsyringe'

import { AUTH_SERVICE } from '../di/tokens'
import {
	GoogleAuthException,
	GoogleEmailMissingException,
	GoogleNameMissingException,
	InvalidGoogleTokenSignatureException
} from '../exceptions/auth.exceptions'
import { AuthService } from '../services/auth.service'
import type { GoogleAuthRequestBody, RefreshTokenRequestBody } from '../types/auth.types'

import { ApiResponseBuilder } from '@/common/utils/api-response'

/**
 * Controlador para manejar las solicitudes de autenticación.
 * Proporciona métodos para la autenticación con Google y la gestión de tokens.
 */
@injectable()
export class AuthController {
	constructor(@inject(AUTH_SERVICE) private readonly authService: AuthService) {}

	/**
	 * Maneja la autenticación de Google verificando el ID token y devolviendo tokens de acceso.
	 *
	 * @param req - El objeto de solicitud HTTP que contiene el ID token de Google en el cuerpo.
	 * @param res - El objeto de respuesta HTTP para enviar los tokens.
	 * @param next - La siguiente función de middleware para manejar errores.
	 */
	async googleAuth(
		req: Request<Record<string, never>, Record<string, unknown>, GoogleAuthRequestBody>,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const { idToken, deviceId, deviceName } = req.body
			const ipAddress = req.ip || req.socket.remoteAddress
			const userAgent = req.get('user-agent')

			const tokens = await this.authService.authenticateWithGoogle(idToken, {
				deviceId: deviceId ?? undefined,
				deviceName: deviceName ?? undefined,
				ipAddress,
				userAgent
			})
			res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success({
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken
				})
			)
		} catch (err) {
			if (err instanceof GoogleAuthException) {
				res.status(StatusCodes.UNAUTHORIZED).json(ApiResponseBuilder.error(err.message, err.code))
				return
			}
			if (err instanceof GoogleEmailMissingException) {
				res.status(StatusCodes.BAD_REQUEST).json(ApiResponseBuilder.error(err.message, err.code))
				return
			}
			if (err instanceof GoogleNameMissingException) {
				res.status(StatusCodes.BAD_REQUEST).json(ApiResponseBuilder.error(err.message, err.code))
				return
			}
			if (err instanceof InvalidGoogleTokenSignatureException) {
				res.status(StatusCodes.UNAUTHORIZED).json(ApiResponseBuilder.error(err.message, err.code))
				return
			}
			next(err)
		}
	}

	/**
	 * Refresca el token de autenticación utilizando un token de actualización.
	 *
	 * @param req - El objeto de solicitud HTTP que contiene el token de actualización.
	 * @param res - El objeto de respuesta HTTP para enviar el nuevo token de acceso.
	 * @param next - La siguiente función de middleware para manejar errores.
	 */
	async refreshToken(
		req: Request<Record<string, never>, Record<string, unknown>, RefreshTokenRequestBody>,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const { refreshToken: token, deviceId, deviceName } = req.body

			const ipAddress = req.ip || req.socket.remoteAddress
			const userAgent = req.get('user-agent')

			const tokens = await this.authService.refreshAccessToken(token, {
				deviceId,
				deviceName,
				ipAddress,
				userAgent
			})

			res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success({
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken
				})
			)
		} catch (err) {
			next(err)
		}
	}

	/**
	 * Cierra la sesión del usuario invalidando el token de actualización.
	 *
	 * @param req - El objeto de solicitud HTTP que contiene el token de actualización.
	 * @param res - El objeto de respuesta HTTP para confirmar el cierre de sesión.
	 * @param next - La siguiente función de middleware para manejar errores.
	 */
	async logout(
		req: Request<Record<string, never>, Record<string, unknown>, RefreshTokenRequestBody>,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const { refreshToken } = req.body

			await this.authService.logout(refreshToken)

			res.status(StatusCodes.OK).json(ApiResponseBuilder.success({ message: 'Logged out' }))
		} catch (err) {
			next(err)
		}
	}
}
