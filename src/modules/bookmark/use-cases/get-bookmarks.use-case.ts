import { inject, injectable } from 'tsyringe'

import { BOOKMARK_REPOSITORY } from '../di/token'
import type { BookmarkFilters } from '../models/bookmark.model'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'

import type { PaginationOptions } from '@/common/types/pagination.type'
import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class GetBookmarksUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'GetBookmarksUseCase' })
	}

	async execute(user: AccessTokenPayload, options: PaginationOptions, filters?: BookmarkFilters) {
		this.logger.info('Fetching bookmarks', { userId: user.sub, options, filters })
		const bookmarks = await this.bookmarkRepository.findByUserId(user.sub, options, filters)
		this.logger.info('Bookmarks fetched successfully', {
			count: bookmarks.data.length,
			total: bookmarks.meta.total
		})
		return bookmarks
	}
}
