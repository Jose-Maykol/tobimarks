import { inject, injectable, container } from 'tsyringe'

import { COLLECTION_REPOSITORY } from '../../collection/di/token'
import type { ICollectionRepository } from '../../collection/repositories/collection.repository'
import { BOOKMARK_REPOSITORY } from '../di/token'
import { BookmarkNotFoundError } from '../exceptions/bookmark.exceptions'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'

import type { IUnitOfWork } from '@/core/database/unit-of-work'
import { UNIT_OF_WORK, LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

/**
 * Caso de uso encargado de cambiar la colección a la que pertenece un marcador.
 * Gestiona la actualización de contadores tanto en la colección antigua como en la nueva.
 */
@injectable()
export class UpdateBookmarkCollectionUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(COLLECTION_REPOSITORY) private collectionRepository: ICollectionRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'UpdateBookmarkCollectionUseCase' })
	}

	/**
	 * Actualiza la colección de un marcador.
	 * Realiza el cambio dentro de una transacción para asegurar la consistencia de los contadores.
	 *
	 * @param user - Información del usuario autenticado.
	 * @param bookmarkId - El identificador único del marcador.
	 * @param collectionId - El identificador de la nueva colección.
	 * @returns Una promesa que se resuelve cuando la colección ha sido actualizada.
	 * @throws BookmarkNotFoundError - Si el marcador no existe o no pertenece al usuario.
	 */
	async execute(user: AccessTokenPayload, bookmarkId: string, collectionId: string) {
		this.logger.info('Updating bookmark collection', { bookmarkId, collectionId, userId: user.sub })
		const bookmark = await this.bookmarkRepository.findById(bookmarkId)
		if (!bookmark || bookmark.userId !== user.sub) {
			this.logger.warn('Bookmark not found for collection update', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		if (bookmark.collectionId === collectionId) return

		const unitOfWork = container.resolve<IUnitOfWork>(UNIT_OF_WORK)
		await unitOfWork.begin()
		try {
			await this.bookmarkRepository.update(bookmarkId, { collectionId }, unitOfWork)

			if (bookmark.collectionId) {
				await this.collectionRepository.updateBookmarkCount(bookmark.collectionId, -1, unitOfWork)
			}

			await this.collectionRepository.updateBookmarkCount(collectionId, 1, unitOfWork)

			await unitOfWork.commit()
			this.logger.info('Bookmark collection updated successfully', { bookmarkId, collectionId })
		} catch (error) {
			await unitOfWork.rollback()
			this.logger.error('Error updating bookmark collection', { error })
			throw error
		}
	}
}
