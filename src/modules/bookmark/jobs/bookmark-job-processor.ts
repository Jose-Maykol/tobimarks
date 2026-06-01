import { inject, injectable } from 'tsyringe'

import { COLLECTION_REPOSITORY, COLLECTION_SERVICE } from '../../collection/di/token'
import type { ICollectionRepository } from '../../collection/repositories/collection.repository'
import type { CollectionService } from '../../collection/services/collection.service'
import { BOOKMARK_REPOSITORY, TAG_SERVICE } from '../di/token'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'
import type { TagService } from '../services/tag.service'

import { QUEUE_SERVICE, LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { IQueueService } from '@/core/queue/queue.service'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class BookmarkJobProcessor {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(TAG_SERVICE) private tagService: TagService,
		@inject(COLLECTION_REPOSITORY) private collectionRepository: ICollectionRepository,
		@inject(COLLECTION_SERVICE) private collectionService: CollectionService,
		@inject(QUEUE_SERVICE) private queueService: IQueueService,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'BookmarkJobProcessor' })
	}

	initialize() {
		this.logger.info('Initializing Bookmark Job Processor')
		this.registerAiTagsQueue()
		this.registerAiCollectionsQueue()
	}

	private registerAiTagsQueue() {
		this.queueService.registerQueue('ai-tags-generation', async (job) => {
			const { bookmarkId, userId } = job.data as { bookmarkId: string; userId: string }
			this.logger.info('Processing AI auto-tags generation job', { bookmarkId, userId })

			try {
				const userTags = await this.tagService.getByUserId(userId)

				if (userTags.length === 0) {
					this.logger.info('User has no tags to match against. AI tags generation skipped.', {
						userId
					})
					return { success: true, message: 'User has no tags' }
				}

				const bookmark = await this.bookmarkRepository.findById(bookmarkId)
				if (!bookmark) {
					this.logger.warn('Bookmark not found. AI tags generation skipped.', { bookmarkId })
					return { success: false, message: 'Bookmark not found' }
				}

				const textParts = [
					bookmark.title,
					bookmark.description,
					bookmark.ogTitle,
					bookmark.ogDescription
				].filter((part): part is string => typeof part === 'string' && part.trim().length > 0)

				if (textParts.length === 0) {
					this.logger.info(
						'Bookmark has no textual content to analyze. AI auto-tags generation skipped.',
						{ bookmarkId }
					)
					return { success: true, message: 'No textual content to analyze' }
				}

				const textToAnalyze = textParts.join(' ')
				const similarTagIds = await this.tagService.findSimilarTagsForText(
					userId,
					textToAnalyze,
					0.7
				)

				if (similarTagIds.length > 0) {
					await this.bookmarkRepository.update(bookmarkId, { tags: similarTagIds })
					this.logger.info('AI auto-tags assigned successfully', {
						bookmarkId,
						tagsCount: similarTagIds.length
					})
				} else {
					this.logger.info('No similar tags found for AI auto-tags', { bookmarkId })
				}

				return { success: true, tagsAssigned: similarTagIds.length }
			} catch (error) {
				this.logger.error('Error during AI auto-tags generation', {
					bookmarkId,
					userId,
					error: error instanceof Error ? error.message : String(error)
				})
				throw error
			}
		})
	}

	private registerAiCollectionsQueue() {
		this.queueService.registerQueue('ai-collections-generation', async (job) => {
			const { bookmarkId, userId } = job.data as { bookmarkId: string; userId: string }
			this.logger.info('Processing AI auto-collections generation job', { bookmarkId, userId })

			try {
				const userCollections = await this.collectionService.get(
					{ sub: userId } as AccessTokenPayload,
					{ page: 1, limit: 1 }
				)

				if (userCollections.meta.total === 0) {
					this.logger.info(
						'User has no collections to match against. AI collections generation skipped.',
						{ userId }
					)
					return { success: true, message: 'User has no collections' }
				}

				const bookmark = await this.bookmarkRepository.findById(bookmarkId)
				if (!bookmark) {
					this.logger.warn('Bookmark not found. AI collections generation skipped.', { bookmarkId })
					return { success: false, message: 'Bookmark not found' }
				}

				if (bookmark.collectionId) {
					this.logger.info(
						'Bookmark already has a collection. AI collections generation skipped.',
						{ bookmarkId }
					)
					return { success: true, message: 'Bookmark already in a collection' }
				}

				const textParts = [
					bookmark.title,
					bookmark.description,
					bookmark.ogTitle,
					bookmark.ogDescription
				].filter((part): part is string => typeof part === 'string' && part.trim().length > 0)

				if (textParts.length === 0) {
					this.logger.info(
						'Bookmark has no textual content to analyze. AI auto-collections generation skipped.',
						{ bookmarkId }
					)
					return { success: true, message: 'No textual content to analyze' }
				}

				const textToAnalyze = textParts.join(' ')
				const similarCollectionIds = await this.collectionService.findSimilarCollectionForText(
					userId,
					textToAnalyze,
					0.7
				)

				if (similarCollectionIds.length > 0) {
					const bestCollectionId = similarCollectionIds[0]

					if (bestCollectionId) {
						await this.bookmarkRepository.update(bookmarkId, { collectionId: bestCollectionId })
						await this.collectionRepository.updateBookmarkCount(bestCollectionId, 1)

						this.logger.info('AI auto-collection assigned successfully', {
							bookmarkId,
							collectionId: bestCollectionId
						})
					}
				} else {
					this.logger.info('No similar collections found for AI auto-collection', { bookmarkId })
				}

				return {
					success: true,
					collectionAssigned: similarCollectionIds.length > 0 ? similarCollectionIds[0] : null
				}
			} catch (error) {
				this.logger.error('Error during AI auto-collections generation', {
					bookmarkId,
					userId,
					error: error instanceof Error ? error.message : String(error)
				})
				throw error
			}
		})
	}
}
