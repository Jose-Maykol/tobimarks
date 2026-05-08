import { BaseException } from '@/common/errors/base-erxception'

export enum CollectionErrorCode {
	COLLECTION_NOT_FOUND = 'COLLECTION_NOT_FOUND',
	COLLECTION_ALREADY_EXISTS = 'COLLECTION_ALREADY_EXISTS'
}

/**
 * Excepción lanzada cuando no se encuentra una colección específica.
 *
 * @extends BaseException
 * @example
 * throw new CollectionNotFoundError('No se encontró la colección solicitada');
 */
export class CollectionNotFoundError extends BaseException {
	/**
	 * @param message - Mensaje descriptivo del error.
	 */
	constructor(message: string = 'Collection not found') {
		super(message, CollectionErrorCode.COLLECTION_NOT_FOUND)
	}
}

/**
 * Excepción lanzada cuando se intenta crear una colección con un nombre que ya está en uso.
 *
 * @extends BaseException
 * @example
 * throw new CollectionAlreadyExistsError('Ya tienes una colección con este nombre');
 */
export class CollectionAlreadyExistsError extends BaseException {
	/**
	 * @param message - Mensaje descriptivo del error.
	 */
	constructor(message: string = 'You already have a collection with this name') {
		super(message, CollectionErrorCode.COLLECTION_ALREADY_EXISTS)
	}
}
