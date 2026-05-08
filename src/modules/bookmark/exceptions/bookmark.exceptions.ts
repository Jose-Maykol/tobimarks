import { BaseException } from '@/common/errors/base-erxception'

export enum BookmarkErrorCode {
	BOOKMARK_ALREADY_EXISTS = 'BOOKMARK_ALREADY_EXISTS',
	BOOKMARK_NOT_FOUND = 'BOOKMARK_NOT_FOUND'
}

/**
 * Excepción lanzada cuando un marcador ya se encuentra registrado en el sistema.
 * Útil para prevenir duplicados de URLs.
 *
 * @extends BaseException
 * @example
 * throw new BookmarkAlreadyExistsError('Este marcador ya ha sido guardado previamente');
 */
export class BookmarkAlreadyExistsError extends BaseException {
	/**
	 * Crea una instancia de BookmarkAlreadyExistsError.
	 * @param message - Mensaje personalizado que describe el error.
	 */
	constructor(message: string = 'Bookmark already exists') {
		super(message, BookmarkErrorCode.BOOKMARK_ALREADY_EXISTS)
	}
}

/**
 * Excepción lanzada cuando no se puede localizar un marcador solicitado.
 * Generalmente ocurre durante operaciones de lectura, actualización o eliminación por ID.
 *
 * @extends BaseException
 * @example
 * throw new BookmarkNotFoundError('No se encontró el marcador con el ID proporcionado');
 */
export class BookmarkNotFoundError extends BaseException {
	/**
	 * Crea una instancia de BookmarkNotFoundError.
	 * @param message - Mensaje personalizado que describe el error.
	 */
	constructor(message: string = 'Bookmark not found') {
		super(message, BookmarkErrorCode.BOOKMARK_NOT_FOUND)
	}
}
