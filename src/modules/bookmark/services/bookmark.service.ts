import { inject, injectable } from 'tsyringe'

import { BOOKMARK_REPOSITORY } from '../di/token'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'

@injectable()
export class BookmarkService {
	constructor(@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository) {}
}
