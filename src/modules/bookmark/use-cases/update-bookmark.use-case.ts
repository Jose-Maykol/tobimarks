import { inject, injectable, container } from 'tsyringe'

import { COLLECTION_REPOSITORY } from '../../collection/di/token'
import type { ICollectionRepository } from '../../collection/repositories/collection.repository'
import { TAG_SERVICE } from '../di/token'
import { BOOKMARK_REPOSITORY } from '../di/token'
import { BookmarkNotFoundError } from '../exceptions/bookmark.exceptions'
import type { UpdateBookmarkDto } from '../models/bookmark.model'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'
import type { TagService } from '../services/tag.service'
import type { UpdateBookmarkRequestBody } from '../types/bookmark.types'

import type { IUnitOfWork } from '@/core/database/unit-of-work'
import { UNIT_OF_WORK, LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class UpdateBookmarkUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(TAG_SERVICE) private tagService: TagService,
		@inject(COLLECTION_REPOSITORY) private collectionRepository: ICollectionRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'UpdateBookmarkUseCase' })
	}

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
			await this.tagService.checkTagsOwnership(user.sub, data.tags)
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
