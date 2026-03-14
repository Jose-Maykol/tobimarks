import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'tsyringe'

import { USER_SERVICE } from '../di/tokens'
import { UserNotFoundError } from '../exceptions/user.exceptions'
import type { UserService } from '../services/user.service'
import type { UpdateUserSettingsRequestBody } from '../types/user.types'

import { ApiResponseBuilder } from '@/common/utils/api-response'

/**
 * Controlador para gestionar las operaciones relacionadas con el usuario.
 * Proporciona métodos para obtener el perfil y actualizar la configuración.
 */
@injectable()
export class UserController {
	constructor(@inject(USER_SERVICE) private readonly userService: UserService) {}

	/**
	 * Recupera el perfil completo del usuario autenticado.
	 *
	 * @param req - El objeto de solicitud HTTP.
	 * @param res - El objeto de respuesta HTTP.
	 * @param next - La siguiente función de middleware.
	 */
	async getProfile(
		req: Request<Record<string, never>, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const profile = await this.userService.getProfile(user.sub)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success({
					user: profile
				})
			)
		} catch (error) {
			if (error instanceof UserNotFoundError) {
				res.status(StatusCodes.NOT_FOUND).json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Actualiza los ajustes o configuración del usuario.
	 *
	 * @param req - El objeto de solicitud HTTP con los nuevos ajustes en el cuerpo.
	 * @param res - El objeto de respuesta HTTP.
	 * @param next - La siguiente función de middleware.
	 */
	async updateSettings(
		req: Request<Record<string, never>, Record<string, never>, UpdateUserSettingsRequestBody>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const profile = await this.userService.updateSettings(user.sub, req.body)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						user: profile
					},
					'User settings updated successfully'
				)
			)
		} catch (error) {
			if (error instanceof UserNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}
}
