import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'tsyringe'

import { COLLECTION_SERVICE } from '../di/token'
import {
	CollectionAlreadyExistsError,
	CollectionNotFoundError
} from '../exceptions/collection.exceptions'
import type { CollectionService } from '../services/collection.service'
import type {
	CreateCollectionRequestBody,
	GetCollectionsQueryOutput,
	UpdateCollectionRequestBody
} from '../types/collection.types'

import { ApiResponseBuilder } from '@/common/utils/api-response'

/**
 * Controlador para gestionar las colecciones de marcadores.
 * Proporciona métodos para crear, listar, obtener por ID y actualizar colecciones.
 */
@injectable()
export class CollectionController {
	constructor(@inject(COLLECTION_SERVICE) private readonly collectionService: CollectionService) {}

	/**
	 * Crea una nueva colección para el usuario autenticado.
	 *
	 * @param req - La solicitud HTTP con los datos de la colección.
	 * @param res - La respuesta HTTP con la colección creada.
	 * @param next - La siguiente función de middleware para el manejo de errores.
	 */
	async create(
		req: Request<Record<string, never>, Record<string, never>, CreateCollectionRequestBody>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const body = req.body
			const collection = await this.collectionService.create(user, body)

			return res.status(StatusCodes.CREATED).json(
				ApiResponseBuilder.success(
					{
						collection: {
							id: collection.id,
							name: collection.name,
							description: collection.description,
							color: collection.color,
							icon: collection.icon
						}
					},
					'Collection created successfully'
				)
			)
		} catch (error) {
			if (error instanceof CollectionAlreadyExistsError) {
				res.status(StatusCodes.CONFLICT).json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Recupera todas las colecciones del usuario autenticado de forma paginada.
	 *
	 * @param req - La solicitud HTTP con los parámetros de paginación.
	 * @param res - La respuesta HTTP con la lista de colecciones y metadatos.
	 * @param next - La siguiente función de middleware.
	 */
	async get(req: Request, res: Response, next: NextFunction) {
		try {
			const user = req.user!
			const query = req.query as unknown as GetCollectionsQueryOutput
			const { page, limit } = query

			const result = await this.collectionService.get(user, { page: page!, limit: limit! })

			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						collections: result.data.map((c) => ({
							id: c.id,
							name: c.name,
							description: c.description,
							color: c.color,
							icon: c.icon,
							bookmarksCount: c.bookmarksCount,
							createdAt: c.createdAt,
							updatedAt: c.updatedAt
						}))
					},
					undefined,
					result.meta
				)
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * Obtiene los detalles de una colección específica por su ID.
	 *
	 * @param req - La solicitud HTTP con el ID de la colección en los parámetros.
	 * @param res - La respuesta HTTP con los detalles de la colección.
	 * @param next - La siguiente función de middleware.
	 */
	async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
		try {
			const user = req.user!
			const { id } = req.params

			const collection = await this.collectionService.getById(user, id)

			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success({
					collection: {
						id: collection.id,
						name: collection.name,
						description: collection.description,
						color: collection.color,
						icon: collection.icon,
						bookmarksCount: collection.bookmarksCount,
						createdAt: collection.createdAt,
						updatedAt: collection.updatedAt
					}
				})
			)
		} catch (error) {
			if (error instanceof CollectionNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Actualiza los datos de una colección existente.
	 *
	 * @param req - La solicitud HTTP con el ID de la colección y los nuevos datos.
	 * @param res - La respuesta HTTP con la colección actualizada.
	 * @param next - La siguiente función de middleware.
	 */
	async update(
		req: Request<{ id: string }, Record<string, never>, UpdateCollectionRequestBody>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { id } = req.params
			const data = req.body
			const collection = await this.collectionService.update(user, id, data)

			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						collection: {
							id: collection.id,
							name: collection.name,
							description: collection.description,
							color: collection.color,
							icon: collection.icon
						}
					},
					'Collection updated successfully'
				)
			)
		} catch (error) {
			if (error instanceof CollectionNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			if (error instanceof CollectionAlreadyExistsError) {
				return res
					.status(StatusCodes.CONFLICT)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}
}
