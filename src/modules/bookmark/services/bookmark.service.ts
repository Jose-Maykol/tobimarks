import axios from 'axios'
import * as cheerio from 'cheerio'
import { parse } from 'tldts'
import { inject, injectable } from 'tsyringe'

import { BOOKMARK_REPOSITORY, WEBSITE_REPOSITORY } from '../di/token'
import type { CreateBookmarkDto } from '../models/bookmark.model'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'
import type { IWebsiteRepository } from '../repositories/websites.repository'
import type { CreateBookmarkRequestBody } from '../types/bookmark.types'

import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class BookmarkService {
	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
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

		const { data: html } = await axios.get(urlBookmark)
		const $ = cheerio.load(html)

		const title = $('title').text()
		const description = $('meta[name="description"]').attr('content')
		const ogTitle = $('meta[property="og:title"]').attr('content')
		const ogImage = $('meta[property="og:image"]').attr('content')
		const ogDescription = $('meta[property="og:description"]').attr('content')
		const faviconUrl = $('link[rel="icon"]').attr('href')

		const website = await this.findOrCreateWebsite(urlBookmark, faviconUrl)

		const newBookmark: CreateBookmarkDto = {
			userId: user.id,
			categoryId: null,
			websiteId: website.id,
			url: urlBookmark,
			title: title || null,
			description: description || null,
			ogTitle: ogTitle || null,
			ogDescription: ogDescription || null,
			ogImageUrl: ogImage || null,
			isFavorite: false,
			isArchived: false
		}

		const createdBookmark = await this.bookmarkRepository.create(newBookmark)
		return createdBookmark
	}

	/**
	 * Finds an existing website by its domain or creates a new one.
	 *
	 * @param url - The URL of the website.
	 * @param faviconUrl - The favicon URL of the website, if available.
	 * @returns The found or newly created website.
	 */
	async findOrCreateWebsite(url: string, faviconUrl: string | undefined) {
		const urlParse = parse(url)
		const domain = urlParse.domain as string
		const domainWithoutSuffix = urlParse.domainWithoutSuffix as string

		const website = await this.websiteRepository.findByDomain(domain)

		if (!website) {
			const newWebsite = await this.websiteRepository.create({
				domain,
				name: domainWithoutSuffix,
				faviconUrl: faviconUrl || null
			})
			return newWebsite
		}

		return website
	}
}
