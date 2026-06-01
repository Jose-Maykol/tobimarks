import { inject, injectable } from 'tsyringe'

import { BOOKMARK_REPOSITORY } from '../di/token'
import { BookmarkNotFoundError } from '../exceptions/bookmark.exceptions'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

/**
 * Caso de uso encargado de registrar un nuevo acceso (clic/visita) a un marcador.
 * Incrementa el contador de accesos y actualiza la fecha del último acceso.
 */
@injectable()
export class RegisterBookmarkAccessUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'RegisterBookmarkAccessUseCase' })
	}

	/**
	 * Registra un acceso al marcador especificado.
	 *
	 * @param user - Información del usuario autenticado.
	 * @param bookmarkId - El identificador único del marcador.
	 * @returns Una promesa que se resuelve cuando el acceso ha sido registrado.
	 * @throws BookmarkNotFoundError - Si el marcador no existe o no pertenece al usuario.
	 */
	async execute(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Registering access for bookmark', { bookmarkId, userId: user.sub })
		const existsBookmark = await this.bookmarkRepository.existsByIdAndUserId(bookmarkId, user.sub)
		if (!existsBookmark) {
			this.logger.warn('Bookmark not found to register access', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		await this.bookmarkRepository.registerAccess(bookmarkId)
		this.logger.info('Access registered successfully', { bookmarkId })
	}
}
