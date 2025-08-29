import { BookmarkErrorCode } from './bookmark-error-codes.enum'

import { BaseException } from '@/common/errors/base-erxception'

export class BookmarkAlreadyExistsError extends BaseException {
	constructor(message: string = 'El marcador ya existe') {
		super(message, BookmarkErrorCode.BOOKMARK_ALREADY_EXISTS)
	}
}
