import { parse } from 'tldts'
import { inject, injectable } from 'tsyringe'

import type { MetadataExtractorService } from './metadata-extractor.service'
import { BOOKMARK_REPOSITORY, METADATA_EXTRACTOR_SERVICE, WEBSITE_REPOSITORY } from '../di/token'
import { BookmarkAlreadyExistsError } from '../exceptions/bookmark.exceptions'
import type { CreateBookmarkDto } from '../models/bookmark.model'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'
import type { IWebsiteRepository } from '../repositories/websites.repository'
import type { CreateBookmarkRequestBody } from '../types/bookmark.types'

import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class BookmarkService {
	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(METADATA_EXTRACTOR_SERVICE) private metadataExtractor: MetadataExtractorService,
		@inject(WEBSITE_REPOSITORY) private websiteRepository: IWebsiteRepository
	) {}

	/**
	 * Creates a new bookmark for the given user and URL.
	 * Fetches metadata from the URL and associates it with a website.
	 *
	 * @param user - The user creating the bookmark.
	 * @param data - The data required to create the bookmark.
	 * @returns The created bookmark.
	 */
	async create(user: AccessTokenPayload, data: CreateBookmarkRequestBody) {
		const urlBookmark = data.url

		const metadata = await this.metadataExtractor.extractFromUrl(urlBookmark)

		const { title, description, ogTitle, ogImageUrl, ogDescription, faviconUrl, canonicalUrl } =
			metadata

		const website = await this.findOrCreateWebsite(urlBookmark, faviconUrl)

		const newBookmark: CreateBookmarkDto = {
			userId: user.sub,
			categoryId: null,
			websiteId: website.id,
			url: this.normalizeUrl(urlBookmark, canonicalUrl),
			title: title || null,
			description: description || null,
			ogTitle: ogTitle || null,
			ogDescription: ogDescription || null,
			ogImageUrl: ogImageUrl || null,
			isFavorite: false,
			isArchived: false
		}

		try {
			const createdBookmark = await this.bookmarkRepository.create(newBookmark)
			return createdBookmark
		} catch (error) {
			if (error instanceof UniqueConstraintViolationError) {
				throw new BookmarkAlreadyExistsError()
			}
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
	private async findOrCreateWebsite(url: string, faviconUrl: string | null) {
		const urlParse = parse(url)
		const domain = urlParse.domain as string
		const domainWithoutSuffix = urlParse.domainWithoutSuffix as string

		const website = await this.websiteRepository.findByDomain(domain)

		if (!website) {
			const newWebsite = await this.websiteRepository.create({
				domain,
				name: domainWithoutSuffix,
				faviconUrl: faviconUrl
			})
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
	async get(user: AccessTokenPayload) {
		const bookmarks = await this.bookmarkRepository.findByUserId(user.sub)
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
		const deletedBookmark = await this.bookmarkRepository.softDelete(bookmarkId)
		return deletedBookmark
	}

	/**
	 * Marks a bookmark as a favorite for the given user.
	 *
	 * @param user - The user marking the bookmark as favorite.
	 * @param bookmarkId - The ID of the bookmark to mark as favorite.
	 * @returns The updated bookmark with favorite status.
	 */
	async markAsFavorite(user: AccessTokenPayload, bookmarkId: string) {
		const result = await this.bookmarkRepository.updateFavoriteStatus(bookmarkId, true)
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
		const result = await this.bookmarkRepository.updateFavoriteStatus(bookmarkId, false)
		return result
	}

	async updateTitle(user: AccessTokenPayload, bookmarkId: string, title: string) {
		const result = await this.bookmarkRepository.updateTitle(bookmarkId, title)
		return result
	}
}
