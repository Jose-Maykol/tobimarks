import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'tsyringe'

import { BOOKMARK_SERVICE } from '../di/token'
import {
	BookmarkAlreadyExistsError,
	BookmarkNotFoundError
} from '../exceptions/bookmark.exceptions'
import {
	UrlFetchFailedException,
	UrlForbiddenException,
	UrlNotFoundException,
	UrlTimeoutException
} from '../exceptions/metadata-extractor.exceptions'
import { TagNotFoundError } from '../exceptions/tag.exceptions'
import type { BookmarkService } from '../services/bookmark.service'
import type {
	CreateBookmarkRequestBody,
	GetBookmarksQueryOutput,
	UpdateBookmarkRequestBody,
	UpdateBookmarkCollectionRequestBody
} from '../types/bookmark.types'

import { ApiResponseBuilder } from '@/common/utils/api-response'

/**
 * Controlador para gestionar los marcadores (bookmarks).
 * Proporciona métodos para crear, obtener, actualizar, eliminar y organizar marcadores.
 */
@injectable()
export class BookmarkController {
	constructor(@inject(BOOKMARK_SERVICE) private readonly bookmarkService: BookmarkService) {}

	/**
	 * Maneja la creación de un nuevo marcador.
	 *
	 * @param req - La solicitud HTTP que contiene los datos del usuario y del marcador.
	 * @param res - La respuesta HTTP para enviar el marcador creado.
	 * @param next - La siguiente función de middleware para el manejo de errores.
	 * @returns Una respuesta JSON con el marcador creado.
	 */
	async create(
		req: Request<Record<string, never>, Record<string, never>, CreateBookmarkRequestBody>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const body = req.body
			const bookmark = await this.bookmarkService.create(user, body)
			return res.status(StatusCodes.CREATED).json(
				ApiResponseBuilder.success(
					{
						bookmark: {
							id: bookmark.id,
							url: bookmark.url,
							title: bookmark.title,
							description: bookmark.description
						}
					},
					'Bookmark created successfully'
				)
			)
		} catch (error) {
			if (error instanceof UrlForbiddenException) {
				return res
					.status(StatusCodes.FORBIDDEN)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			if (error instanceof UrlNotFoundException) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			if (error instanceof UrlTimeoutException) {
				return res
					.status(StatusCodes.REQUEST_TIMEOUT)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			if (error instanceof UrlFetchFailedException) {
				return res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			if (error instanceof BookmarkAlreadyExistsError) {
				return res
					.status(StatusCodes.CONFLICT)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Recupera todos los marcadores del usuario autenticado.
	 *
	 * @param req - La solicitud HTTP que contiene al usuario autenticado.
	 * @param res - La respuesta HTTP para enviar los marcadores recuperados.
	 * @param next - La siguiente función de middleware para el manejo de errores.
	 * @returns Una respuesta JSON con la lista de marcadores.
	 */
	async get(req: Request, res: Response, next: NextFunction) {
		try {
			const user = req.user!
			const query = req.query as unknown as GetBookmarksQueryOutput
			const { page, limit, ...filters } = query

			const paginatedBookmarks = await this.bookmarkService.get(
				user,
				{ page: page!, limit: limit! },
				filters
			)

			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						bookmarks: paginatedBookmarks.data.map((b) => ({
							id: b.id,
							url: b.url,
							title: b.title,
							isFavorite: b.isFavorite,
							isArchived: b.isArchived,
							accessCount: b.accessCount,
							lastAccessedAt: b.lastAccessedAt,
							domain: b.domain,
							faviconUrl: b.faviconUrl,
							tags: b.tags
						}))
					},
					undefined,
					paginatedBookmarks.meta
				)
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * Elimina un marcador del usuario autenticado por su ID.
	 *
	 * @param req - La solicitud HTTP que contiene al usuario autenticado y el ID del marcador.
	 * @param res - La respuesta HTTP para confirmar la eliminación.
	 * @param next - La siguiente función de middleware para el manejo de errores.
	 * @returns Una respuesta JSON confirmando la eliminación del marcador.
	 */
	async delete(
		req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { id } = req.params
			await this.bookmarkService.delete(user, id)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						bookmark: {
							id: id
						}
					},
					'Bookmark deleted successfully'
				)
			)
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Marca un marcador como favorito para el usuario autenticado.
	 *
	 * @param req - La solicitud HTTP que contiene al usuario autenticado y el ID del marcador.
	 * @param res - La respuesta HTTP para confirmar la actualización del estado de favorito.
	 * @param next - La siguiente función de middleware para el manejo de errores.
	 * @returns Una respuesta JSON confirmando que el marcador fue marcado como favorito.
	 */
	async markAsFavorite(
		req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { id } = req.params
			const result = await this.bookmarkService.markAsFavorite(user, id)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						bookmark: {
							id: result.id,
							isFavorite: result.isFavorite
						}
					},
					'Bookmark marked as favorite successfully'
				)
			)
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Elimina el estado de favorito de un marcador para el usuario autenticado.
	 *
	 * @param req - La solicitud HTTP que contiene al usuario autenticado y el ID del marcador.
	 * @param res - La respuesta HTTP para confirmar la eliminación del estado de favorito.
	 * @param next - La siguiente función de middleware para el manejo de errores.
	 * @returns Una respuesta JSON confirmando que el marcador fue desmarcado como favorito.
	 */
	async unmarkAsFavorite(
		req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { id } = req.params
			const result = await this.bookmarkService.unmarkAsFavorite(user, id)
			return res.status(StatusCodes.OK).json(
				ApiResponseBuilder.success(
					{
						bookmark: {
							id: result.id,
							isFavorite: result.isFavorite
						}
					},
					'Bookmark unmarked as favorite successfully'
				)
			)
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Actualiza los datos de un marcador.
	 *
	 * @param req - La solicitud HTTP que contiene el ID del marcador y los datos a actualizar.
	 * @param res - La respuesta HTTP para confirmar la actualización.
	 * @param next - La siguiente función de middleware.
	 */
	async update(
		req: Request<{ id: string }, Record<string, never>, UpdateBookmarkRequestBody>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const data = req.body
			const id = req.params.id
			await this.bookmarkService.update(user, id, data)
			return res
				.status(StatusCodes.OK)
				.json(ApiResponseBuilder.success('Bookmark title updated successfully'))
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			if (error instanceof TagNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Registra un acceso al marcador (incrementa el contador y actualiza la fecha).
	 *
	 * @param req - La solicitud HTTP que contiene el ID del marcador.
	 * @param res - La respuesta HTTP.
	 * @param next - La siguiente función de middleware.
	 */
	async registerAccess(
		req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { id } = req.params
			await this.bookmarkService.registerAccess(user, id)
			return res
				.status(StatusCodes.OK)
				.json(ApiResponseBuilder.success('Bookmark access registered successfully'))
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Mapea un marcador a una colección.
	 *
	 * @param req - La solicitud HTTP que contiene el ID del marcador y el ID de la colección.
	 * @param res - La respuesta HTTP.
	 * @param next - La siguiente función de middleware.
	 */
	async updateCollection(
		req: Request<{ id: string }, Record<string, never>, UpdateBookmarkCollectionRequestBody>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const { collectionId } = req.body
			const id = req.params.id
			await this.bookmarkService.updateCollection(user, id, collectionId)
			return res
				.status(StatusCodes.OK)
				.json(ApiResponseBuilder.success('Bookmark collection updated successfully'))
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}

	/**
	 * Remueve un marcador de su colección actual.
	 *
	 * @param req - La solicitud HTTP que contiene el ID del marcador.
	 * @param res - La respuesta HTTP.
	 * @param next - La siguiente función de middleware.
	 */
	async removeCollection(
		req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user!
			const id = req.params.id
			await this.bookmarkService.removeCollection(user, id)
			return res
				.status(StatusCodes.OK)
				.json(ApiResponseBuilder.success('Bookmark collection removed successfully'))
		} catch (error) {
			if (error instanceof BookmarkNotFoundError) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json(ApiResponseBuilder.error(error.message, error.code))
			}
			next(error)
		}
	}
}
