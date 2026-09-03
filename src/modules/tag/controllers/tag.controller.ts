import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'tsyringe'

import {
	CREATE_TAG_USE_CASE,
	DELETE_TAG_USE_CASE,
	GET_TAGS_BY_USER_ID_USE_CASE,
	UPDATE_TAG_USE_CASE
} from '../di/token'
import { TagNotFoundError } from '../exceptions/tag.exceptions'
import type { CreateTagRequestBody, UpdateTagRequestBody } from '../types/tags.types'
import type { CreateTagUseCase } from '../use-cases/create-tag.use-case'
import type { DeleteTagUseCase } from '../use-cases/delete-tag.use-case'
import type { GetTagsByUserIdUseCase } from '../use-cases/get-tags-by-user-id.use-case'
import type { UpdateTagUseCase } from '../use-cases/update-tag.use-case'

import { ApiResponseBuilder } from '@/common/utils/api-response'

/**
 * Controlador para gestionar las etiquetas (tags).
 * Proporciona métodos para obtener, crear, actualizar y eliminar etiquetas.
 */
@injectable()
export class TagController {
	constructor(
		@inject(GET_TAGS_BY_USER_ID_USE_CASE)
		private readonly getTagsByUserIdUseCase: GetTagsByUserIdUseCase,
		@inject(CREATE_TAG_USE_CASE) private readonly createTagUseCase: CreateTagUseCase,
		@inject(UPDATE_TAG_USE_CASE) private readonly updateTagUseCase: UpdateTagUseCase,
		@inject(DELETE_TAG_USE_CASE) private readonly deleteTagUseCase: DeleteTagUseCase
	) {}

	/**
	 * Recupera todas las etiquetas asociadas con el usuario autenticado.
	 *
	 * @param req - El objeto de solicitud HTTP.
	 * @param res - El objeto de respuesta HTTP.
	 * @param next - La siguiente función de middleware.
	 * @returns Una respuesta JSON que contiene las etiquetas del usuario.
	 */
	async getByUserId(
		req: Request<Record<string, never>, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const userId = user.sub
			const tags = await this.getTagsByUserIdUseCase.execute(userId)
			return res.status(StatusCodes.OK).json(ApiResponseBuilder.success({ tags }))
		} catch (error) {
			next(error)
		}
	}

	/**
	 * Crea una nueva etiqueta para el usuario autenticado.
	 *
	 * @param req - El objeto de solicitud HTTP que contiene los datos de la etiqueta en el cuerpo.
	 * @param res - El objeto de respuesta HTTP.
	 * @param next - La siguiente función de middleware.
	 * @returns Una respuesta JSON que contiene la etiqueta creada.
	 */
	async create(
		req: Request<Record<string, never>, Record<string, never>, CreateTagRequestBody>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const data = req.body
			const createdTag = await this.createTagUseCase.execute(user, data)
			return res.status(StatusCodes.CREATED).json(
				ApiResponseBuilder.success(
					{
						tag: {
							id: createdTag.id,
							name: createdTag.name,
							slug: createdTag.slug
						}
					},
					'Tag created successfully'
				)
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * Actualiza una etiqueta existente.
	 *
	 * @param req - El objeto de solicitud HTTP que contiene el ID de la etiqueta y los nuevos datos.
	 * @param res - El objeto de respuesta HTTP.
	 * @param next - La siguiente función de middleware.
	 * @returns Una respuesta JSON con la etiqueta actualizada.
	 */
	async update(
		req: Request<{ id: string }, Record<string, never>, UpdateTagRequestBody>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const tagId = req.params.id
			const data = req.body
			const updatedTag = await this.updateTagUseCase.execute(user, tagId, data)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						tag: {
							id: updatedTag.id,
							name: updatedTag.name,
							slug: updatedTag.slug
						}
					},
					'Tag updated successfully'
				)
			)
		} catch (error) {
			if (error instanceof TagNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Elimina una etiqueta del usuario autenticado.
	 *
	 * @param req - El objeto de solicitud HTTP que contiene el ID de la etiqueta.
	 * @param res - El objeto de respuesta HTTP.
	 * @param next - La siguiente función de middleware.
	 * @returns Una respuesta JSON confirmando la eliminación.
	 */
	async delete(
		req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const tagId = req.params.id
			await this.deleteTagUseCase.execute(user, tagId)
			return res
				.status(StatusCodes.OK)
				.json(ApiResponseBuilder.success(null, 'Tag deleted successfully'))
		} catch (error) {
			if (error instanceof TagNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}
}
