import { BaseException } from '@/common/errors/base-erxception'

export enum TagErrorCode {
	TAG_NOT_FOUND = 'TAG_NOT_FOUND',
	TAG_ALREADY_EXISTS = 'TAG_ALREADY_EXISTS'
}

/**
 * Excepción lanzada cuando no se encuentra una etiqueta.
 *
 * @extends BaseException
 * @example
 * throw new TagNotFoundError('La etiqueta solicitada no existe');
 */
export class TagNotFoundError extends BaseException {
	/**
	 * @param message - Mensaje descriptivo del error.
	 */
	constructor(message: string = 'Tag not found') {
		super(message, TagErrorCode.TAG_NOT_FOUND)
	}
}

/**
 * Excepción lanzada cuando se intenta crear una etiqueta que ya existe.
 *
 * @extends BaseException
 * @example
 * throw new TagAlreadyExistsError('Ya tienes una etiqueta con ese nombre');
 */
export class TagAlreadyExistsError extends BaseException {
	/**
	 * @param message - Mensaje descriptivo del error.
	 */
	constructor(message: string = 'Tag already exists') {
		super(message, TagErrorCode.TAG_ALREADY_EXISTS)
	}
}
