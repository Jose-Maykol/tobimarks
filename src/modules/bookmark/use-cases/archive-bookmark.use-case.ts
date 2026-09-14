import { inject, injectable } from 'tsyringe'

import { BOOKMARK_REPOSITORY } from '../di/token'
import { BookmarkNotFoundError } from '../exceptions/bookmark.exceptions'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

/**
 * Caso de uso encargado de archivar marcadores.
 */
@injectable()
export class ArchiveBookmarkUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'ArchiveBookmarkUseCase' })
	}

	/**
	 * Archiva un marcador activo del usuario autenticado.
	 *
	 * @param user - Información del usuario autenticado.
	 * @param bookmarkId - El identificador único del marcador.
	 * @returns Una promesa que se resuelve con el estado archivado del marcador.
	 * @throws BookmarkNotFoundError - Si el marcador no existe, fue eliminado o no pertenece al usuario.
	 */
	async execute(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Archiving bookmark', { bookmarkId, userId: user.sub })
		const archivedBookmark = await this.bookmarkRepository.archive(bookmarkId, user.sub)

		if (!archivedBookmark) {
			this.logger.warn('Bookmark not found for archiving', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		this.logger.info('Bookmark archived successfully', { bookmarkId, userId: user.sub })
		return archivedBookmark
	}
}
