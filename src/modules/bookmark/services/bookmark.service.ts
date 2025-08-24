import axios from 'axios'
import * as cheerio from 'cheerio'
import { inject, injectable } from 'tsyringe'

import { BOOKMARK_REPOSITORY } from '../di/token'
import type { CreateBookmarkDto } from '../models/bookmark.model'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'
import type { CreateBookmarkRequestBody } from '../types/bookmark.types'

import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class BookmarkService {
	constructor(@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository) {}

	async create(user: AccessTokenPayload, data: CreateBookmarkRequestBody) {
		const urlBookmark = data.url

		const { data: html } = await axios.get(urlBookmark)
		const $ = cheerio.load(html)

		const title = $('title').text()
		const description = $('meta[name="description"]').attr('content')
		const ogTitle = $('meta[property="og:title"]').attr('content')
		const ogImage = $('meta[property="og:image"]').attr('content')
		const ogDescription = $('meta[property="og:description"]').attr('content')
		const favicon = $('link[rel="icon"]').attr('href')

		const newBookmark: CreateBookmarkDto = {
			userId: user.id,
			websiteId: '1',
			categoryId: null,
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
		/* return this.bookmarkRepository.create(data) */
	}
}
