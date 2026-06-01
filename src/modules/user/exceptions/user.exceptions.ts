import { BaseException } from '@/common/errors/base-erxception'

export enum UserErrorCode {
	USER_NOT_FOUND = 'USER_NOT_FOUND'
}

/**
 * Excepción lanzada cuando no se puede encontrar a un usuario.
 *
 * @extends BaseException
 * @example
 * throw new UserNotFoundError('El usuario con el ID proporcionado no existe');
 */
export class UserNotFoundError extends BaseException {
	/**
	 * @param message - Mensaje descriptivo del error.
	 */
	constructor(message: string = 'User not found') {
		super(message, UserErrorCode.USER_NOT_FOUND)
	}
}
