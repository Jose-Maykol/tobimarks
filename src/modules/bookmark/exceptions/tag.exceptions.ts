import { BaseException } from '@/common/errors/base-erxception'

export enum BookMarkErrorCode {
	TAG_NOT_FOUND = 'TAG_NOT_FOUND',
	TAG_ALREADY_EXISTS = 'TAG_ALREADY_EXISTS'
}

export class TagNotFoundError extends BaseException {
	constructor(message: string = 'Tag not found') {
		super(message, BookMarkErrorCode.TAG_NOT_FOUND)
	}
}

export class TagAlreadyExistsError extends BaseException {
	constructor(message: string = 'The tag already exists') {
		super(message, BookMarkErrorCode.TAG_ALREADY_EXISTS)
	}
}
