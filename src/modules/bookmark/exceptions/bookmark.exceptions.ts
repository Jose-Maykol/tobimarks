import { BaseException } from '@/common/errors/base-erxception'

export enum BookmarkErrorCode {
	BOOKMARK_ALREADY_EXISTS = 'BOOKMARK_ALREADY_EXISTS'
}

export class BookmarkAlreadyExistsError extends BaseException {
	constructor(message: string = 'El marcador ya existe') {
		super(message, BookmarkErrorCode.BOOKMARK_ALREADY_EXISTS)
	}
}
