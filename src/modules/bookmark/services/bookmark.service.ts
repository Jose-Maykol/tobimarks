import { parse } from 'tldts'
import { inject, injectable, container } from 'tsyringe'

import type { MetadataExtractorService } from './metadata-extractor.service'
import type { TagService } from './tag.service'
import { COLLECTION_REPOSITORY } from '../../collection/di/token'
import type { ICollectionRepository } from '../../collection/repositories/collection.repository'
import {
	BOOKMARK_REPOSITORY,
	METADATA_EXTRACTOR_SERVICE,
	TAG_SERVICE,
	WEBSITE_REPOSITORY
} from '../di/token'
import {
	BookmarkAlreadyExistsError,
	BookmarkNotFoundError
} from '../exceptions/bookmark.exceptions'
import type {
	BookmarkFilters,
	CreateBookmarkDto,
	UpdateBookmarkDto
} from '../models/bookmark.model'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'
import type { IWebsiteRepository } from '../repositories/websites.repository'
import type { CreateBookmarkRequestBody, UpdateBookmarkRequestBody } from '../types/bookmark.types'

import type { PaginationOptions } from '@/common/types/pagination.type'
import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import type { IUnitOfWork } from '@/core/database/unit-of-work'
import { UNIT_OF_WORK, LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class BookmarkService {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(METADATA_EXTRACTOR_SERVICE) private metadataExtractor: MetadataExtractorService,
		@inject(WEBSITE_REPOSITORY) private websiteRepository: IWebsiteRepository,
		@inject(TAG_SERVICE) private tagService: TagService,
		@inject(COLLECTION_REPOSITORY) private collectionRepository: ICollectionRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'BookmarkService' })
	}

	/**
	 * Creates a new bookmark for the given user and URL.
	 * Fetches metadata from the URL and associates it with a website.
	 *
	 * @param user - The user creating the bookmark.
	 * @param data - The data required to create the bookmark.
	 * @returns The created bookmark.
	 */
	async create(user: AccessTokenPayload, data: CreateBookmarkRequestBody) {
		this.logger.info('Creating new bookmark', { userId: user.sub, url: data.url })
		const urlBookmark = data.url

		const metadata = await this.metadataExtractor.extractFromUrl(urlBookmark)

		const { title, description, ogTitle, ogImageUrl, ogDescription, faviconUrl, canonicalUrl } =
			metadata

		const unitOfWork = container.resolve<IUnitOfWork>(UNIT_OF_WORK)
		await unitOfWork.begin()
		try {
			const website = await this.findOrCreateWebsite(urlBookmark, faviconUrl, unitOfWork)

			const newBookmark: CreateBookmarkDto = {
				userId: user.sub,
				categoryId: null,
				websiteId: website.id,
				collectionId: data.collectionId ?? null,
				url: this.normalizeUrl(urlBookmark, canonicalUrl),
				title: title,
				description: description,
				ogTitle: ogTitle,
				ogDescription: ogDescription,
				ogImageUrl: ogImageUrl,
				isFavorite: false,
				isArchived: false
			}

			const createdBookmark = await this.bookmarkRepository.create(newBookmark, unitOfWork)

			if (data.collectionId) {
				await this.collectionRepository.updateBookmarkCount(data.collectionId, 1, unitOfWork)
			}

			await unitOfWork.commit()
			this.logger.info('Bookmark created successfully', { bookmarkId: createdBookmark.id })
			return createdBookmark
		} catch (error) {
			await unitOfWork.rollback()
			if (error instanceof UniqueConstraintViolationError) {
				this.logger.warn('Bookmark already exists', { userId: user.sub, url: data.url })
				throw new BookmarkAlreadyExistsError()
			}
			this.logger.error('Error creating bookmark', { error })
			throw error
		}
	}

	/**
	 * Finds an existing website by its domain or creates a new one.
	 *
	 * @param url - The URL of the website.
	 * @param faviconUrl - The favicon URL of the website, if available.
	 * @returns The found or newly created website.
	 */
	private async findOrCreateWebsite(
		url: string,
		faviconUrl: string | null,
		queryRunner?: IUnitOfWork
	) {
		const urlParse = parse(url)
		const domain = urlParse.domain as string
		const domainWithoutSuffix = urlParse.domainWithoutSuffix as string

		const website = await this.websiteRepository.findByDomain(domain, queryRunner)

		if (!website) {
			this.logger.info('Website not found, creating new one', { domain })
			const newWebsite = await this.websiteRepository.create(
				{
					domain,
					name: domainWithoutSuffix,
					faviconUrl: faviconUrl
				},
				queryRunner
			)
			return newWebsite
		}

		return website
	}

	/**
	 * Normalizes a URL by comparing it with its canonical version.
	 *
	 * @param originalUrl - The original URL provided.
	 * @param canonicalUrl - The canonical URL, if available.
	 * @returns The normalized URL, which is either the canonical URL or the original URL.
	 */
	private normalizeUrl(originalUrl: string, canonicalUrl: string | null): string {
		if (!canonicalUrl) return originalUrl

		try {
			const original = new URL(originalUrl)
			const canonical = new URL(canonicalUrl)

			if (original.hostname !== canonical.hostname) return originalUrl

			if (original.pathname === canonical.pathname) return canonicalUrl

			return canonicalUrl
		} catch {
			return originalUrl
		}
	}

	/**
	 * Retrieves all bookmarks for the given user.
	 *
	 * @param user - The user whose bookmarks are to be retrieved.
	 * @returns A list of bookmarks belonging to the user.
	 */
	async get(user: AccessTokenPayload, options: PaginationOptions, filters?: BookmarkFilters) {
		this.logger.info('Fetching bookmarks', { userId: user.sub, options, filters })
		const bookmarks = await this.bookmarkRepository.findByUserId(user.sub, options, filters)
		this.logger.info('Bookmarks fetched successfully', {
			count: bookmarks.data.length,
			total: bookmarks.meta.total
		})
		return bookmarks
	}

	/**
	 * Deletes a bookmark for the given user by its ID.
	 *
	 * @param user - The user requesting the deletion.
	 * @param bookmarkId - The ID of the bookmark to delete.
	 * @returns The deleted bookmark.
	 */
	async delete(user: AccessTokenPayload, bookmarkId: string) {
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

	/**
	 * Marks a bookmark as a favorite for the given user.
	 *
	 * @param user - The user marking the bookmark as favorite.
	 * @param bookmarkId - The ID of the bookmark to mark as favorite.
	 * @returns The updated bookmark with favorite status.
	 */
	async markAsFavorite(user: AccessTokenPayload, bookmarkId: string) {
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

	/**
	 * Removes the favorite status from a bookmark for the given user.
	 *
	 * @param user - The user unmarking the bookmark as favorite.
	 * @param bookmarkId - The ID of the bookmark to unmark as favorite.
	 * @returns The updated bookmark with favorite status removed.
	 */
	async unmarkAsFavorite(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Unmarking bookmark as favorite', { bookmarkId, userId: user.sub })
		const existsBookmark = await this.bookmarkRepository.existsByIdAndUserId(bookmarkId, user.sub)

		if (!existsBookmark) {
			this.logger.warn('Bookmark not found to unmark as favorite', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		const result = await this.bookmarkRepository.updateFavoriteStatus(bookmarkId, false)
		this.logger.info('Bookmark unmarked as favorite successfully', { bookmarkId })
		return result
	}

	/**
	 * Updates a bookmark for the given user.
	 *
	 * @param user - The user updating the bookmark.
	 * @param bookmarkId - The ID of the bookmark to update.
	 * @param data - The data to update.
	 */
	async update(user: AccessTokenPayload, bookmarkId: string, data: UpdateBookmarkRequestBody) {
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

	async registerAccess(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Registering access for bookmark', { bookmarkId, userId: user.sub })
		const existsBookmark = await this.bookmarkRepository.existsByIdAndUserId(bookmarkId, user.sub)
		if (!existsBookmark) {
			this.logger.warn('Bookmark not found to register access', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		await this.bookmarkRepository.registerAccess(bookmarkId)
		this.logger.info('Access registered successfully', { bookmarkId })
	}

	/**
	 * Updates the collection associated with a bookmark.
	 *
	 * @param user - The user updating the collection.
	 * @param bookmarkId - The ID of the bookmark.
	 * @param collectionId - The ID of the collection to associate.
	 */
	async updateCollection(user: AccessTokenPayload, bookmarkId: string, collectionId: string) {
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

	/**
	 * Removes the collection association from a bookmark.
	 *
	 * @param user - The user removing the collection.
	 * @param bookmarkId - The ID of the bookmark.
	 */
	async removeCollection(user: AccessTokenPayload, bookmarkId: string) {
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
