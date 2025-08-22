import { inject, injectable } from 'tsyringe'

import { BOOKMARK_REPOSITORY } from '../di/token'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'
import type { CreateBookmarkRequestBody } from '../types/bookmark.types'

@injectable()
export class BookmarkService {
	constructor(@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository) {}

	async create(data: CreateBookmarkRequestBody) {
		//TODO: Implement bookmark creation logic
		/* return this.bookmarkRepository.create(data) */
	}
}
