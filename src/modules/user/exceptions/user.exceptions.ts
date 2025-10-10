import { BaseException } from '@/common/errors/base-erxception'

export enum UserErrorCode {
	USER_NOT_FOUND = 'USER_NOT_FOUND'
}

export class UserNotFoundError extends BaseException {
	constructor(message: string = 'User not found') {
		super(message, UserErrorCode.USER_NOT_FOUND)
	}
}
