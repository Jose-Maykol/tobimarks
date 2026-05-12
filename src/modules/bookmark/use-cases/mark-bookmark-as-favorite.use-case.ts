import { inject, injectable } from 'tsyringe'

import { BOOKMARK_REPOSITORY } from '../di/token'
import { BookmarkNotFoundError } from '../exceptions/bookmark.exceptions'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class MarkBookmarkAsFavoriteUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'MarkBookmarkAsFavoriteUseCase' })
	}

	async execute(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Marking bookmark as favorite', { bookmarkId, userId: user.sub })
		const existsBookmark = await this.bookmarkRepository.existsByIdAndUserId(bookmarkId, user.sub)

		if (!existsBookmark) {
			this.logger.warn('Bookmark not found to mark as favorite', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		const result = await this.bookmarkRepository.updateFavoriteStatus(bookmarkId, true)
		this.logger.info('Bookmark marked as favorite successfully', { bookmarkId })
		return result
	}
}
