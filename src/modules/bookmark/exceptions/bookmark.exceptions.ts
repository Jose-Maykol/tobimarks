import { BaseException } from '@/common/errors/base-erxception'

export enum BookmarkErrorCode {
	BOOKMARK_ALREADY_EXISTS = 'BOOKMARK_ALREADY_EXISTS',
	BOOKMARK_NOT_FOUND = 'BOOKMARK_NOT_FOUND'
}

export class BookmarkAlreadyExistsError extends BaseException {
	constructor(message: string = 'Bookmark already exists') {
		super(message, BookmarkErrorCode.BOOKMARK_ALREADY_EXISTS)
	}
}

export class BookmarkNotFoundError extends BaseException {
	constructor(message: string = 'Bookmark not found') {
		super(message, BookmarkErrorCode.BOOKMARK_NOT_FOUND)
	}
}
