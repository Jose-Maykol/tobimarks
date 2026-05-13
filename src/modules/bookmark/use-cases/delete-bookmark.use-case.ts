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
 * Caso de uso encargado de la eliminación de marcadores.
 * Realiza un borrado lógico (soft delete) del marcador y actualiza el contador de la colección asociada.
 */
@injectable()
export class DeleteBookmarkUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(COLLECTION_REPOSITORY) private collectionRepository: ICollectionRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'DeleteBookmarkUseCase' })
	}

	/**
	 * Ejecuta la eliminación de un marcador.
	 * Verifica la propiedad del marcador antes de proceder con el borrado.
	 *
	 * @param user - Información del usuario autenticado.
	 * @param bookmarkId - El identificador único del marcador a eliminar.
	 * @returns Una promesa que se resuelve con el marcador eliminado.
	 * @throws BookmarkNotFoundError - Si el marcador no existe o no pertenece al usuario.
	 */
	async execute(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Deleting bookmark', { bookmarkId, userId: user.sub })
		const bookmark = await this.bookmarkRepository.findById(bookmarkId)

		if (!bookmark || bookmark.userId !== user.sub) {
			this.logger.warn('Bookmark not found for deletion', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		const unitOfWork = container.resolve<IUnitOfWork>(UNIT_OF_WORK)
		await unitOfWork.begin()
		try {
			const deletedBookmark = await this.bookmarkRepository.softDelete(bookmarkId)

			if (bookmark.collectionId) {
				await this.collectionRepository.updateBookmarkCount(bookmark.collectionId, -1, unitOfWork)
			}

			await unitOfWork.commit()
			this.logger.info('Bookmark deleted successfully', { bookmarkId })
			return deletedBookmark
		} catch (error) {
			await unitOfWork.rollback()
			this.logger.error('Error deleting bookmark', { error })
			throw error
		}
	}
}
