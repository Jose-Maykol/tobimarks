import { inject, injectable, container } from 'tsyringe'

import { COLLECTION_REPOSITORY } from '../../collection/di/token'
import type { ICollectionRepository } from '../../collection/repositories/collection.repository'
import { CHECK_TAGS_OWNERSHIP_USE_CASE } from '../../tag/di/token'
import type { CheckTagsOwnershipUseCase } from '../../tag/use-cases/check-tags-ownership.use-case'
import { BOOKMARK_REPOSITORY } from '../di/token'
import { BookmarkNotFoundError } from '../exceptions/bookmark.exceptions'
import type { UpdateBookmarkDto } from '../models/bookmark.model'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'
import type { UpdateBookmarkRequestBody } from '../types/bookmark.types'

import type { IUnitOfWork } from '@/core/database/unit-of-work'
import { UNIT_OF_WORK, LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

/**
 * Caso de uso encargado de actualizar los datos de un marcador existente.
 * Permite modificar el título, la colección y las etiquetas asociadas.
 */
@injectable()
export class UpdateBookmarkUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(CHECK_TAGS_OWNERSHIP_USE_CASE)
		private checkTagsOwnershipUseCase: CheckTagsOwnershipUseCase,
		@inject(COLLECTION_REPOSITORY) private collectionRepository: ICollectionRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'UpdateBookmarkUseCase' })
	}

	/**
	 * Actualiza la información de un marcador.
	 * Si se cambia la colección, actualiza los contadores correspondientes.
	 * Si se proporcionan etiquetas, verifica que el usuario sea el propietario de las mismas.
	 *
	 * @param user - Información del usuario autenticado.
	 * @param bookmarkId - El identificador único del marcador.
	 * @param data - Datos a actualizar (título, colección, etiquetas).
	 * @returns Una promesa que se resuelve cuando el marcador ha sido actualizado.
	 * @throws BookmarkNotFoundError - Si el marcador no existe o no pertenece al usuario.
	 */
	async execute(user: AccessTokenPayload, bookmarkId: string, data: UpdateBookmarkRequestBody) {
		this.logger.info('Updating bookmark', {
			bookmarkId,
			userId: user.sub,
			updateFields: Object.keys(data)
		})
		const bookmark = await this.bookmarkRepository.findById(bookmarkId)
		if (!bookmark || bookmark.userId !== user.sub) {
			this.logger.warn('Bookmark not found for update', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		if (data.tags) {
			await this.checkTagsOwnershipUseCase.execute(user.sub, data.tags)
		}

		const updateData: UpdateBookmarkDto = {}
		if (data.title !== undefined) updateData.title = data.title
		if (data.collectionId !== undefined) updateData.collectionId = data.collectionId
		if (data.tags !== undefined) updateData.tags = data.tags

		const unitOfWork = container.resolve<IUnitOfWork>(UNIT_OF_WORK)
		await unitOfWork.begin()
		try {
			await this.bookmarkRepository.update(bookmarkId, updateData, unitOfWork)

			if (data.collectionId !== undefined && data.collectionId !== bookmark.collectionId) {
				// Decrement old collection
				if (bookmark.collectionId) {
					await this.collectionRepository.updateBookmarkCount(bookmark.collectionId, -1, unitOfWork)
				}
				// Increment new collection
				if (data.collectionId) {
					await this.collectionRepository.updateBookmarkCount(data.collectionId, 1, unitOfWork)
				}
			}

			await unitOfWork.commit()
			this.logger.info('Bookmark updated successfully', { bookmarkId })
		} catch (error) {
			await unitOfWork.rollback()
			this.logger.error('Error updating bookmark', { error })
			throw error
		}
	}
}
