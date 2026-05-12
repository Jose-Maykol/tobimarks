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

@injectable()
export class RemoveBookmarkCollectionUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(COLLECTION_REPOSITORY) private collectionRepository: ICollectionRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'RemoveBookmarkCollectionUseCase' })
	}

	async execute(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Removing bookmark collection', { bookmarkId, userId: user.sub })
		const bookmark = await this.bookmarkRepository.findById(bookmarkId)
		if (!bookmark || bookmark.userId !== user.sub) {
			this.logger.warn('Bookmark not found for collection removal', {
				bookmarkId,
				userId: user.sub
			})
			throw new BookmarkNotFoundError()
		}

		if (!bookmark.collectionId) return

		const unitOfWork = container.resolve<IUnitOfWork>(UNIT_OF_WORK)
		await unitOfWork.begin()
		try {
			await this.bookmarkRepository.update(bookmarkId, { collectionId: null }, unitOfWork)

			await this.collectionRepository.updateBookmarkCount(bookmark.collectionId, -1, unitOfWork)

			await unitOfWork.commit()
			this.logger.info('Bookmark collection removed successfully', { bookmarkId })
		} catch (error) {
			await unitOfWork.rollback()
			this.logger.error('Error removing bookmark collection', { error })
			throw error
		}
	}
}
