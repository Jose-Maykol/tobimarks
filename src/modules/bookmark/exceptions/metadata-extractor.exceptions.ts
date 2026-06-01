import { BaseException } from '@/common/errors/base-erxception'

export enum MetadataErrorCode {
	URL_FORBIDDEN = 'URL_FORBIDDEN',
	URL_NOT_FOUND = 'URL_NOT_FOUND',
	URL_TIMEOUT = 'URL_TIMEOUT',
	URL_FETCH_FAILED = 'URL_FETCH_FAILED'
}

/**
 * Excepción lanzada cuando el acceso a una URL está prohibido.
 *
 * @extends BaseException
 * @example
 * throw new UrlForbiddenException('No se tiene permiso para acceder a este sitio');
 */
export class UrlForbiddenException extends BaseException {
	/**
	 * @param message - Mensaje descriptivo del error.
	 */
	constructor(message: string = 'Access to the URL is forbidden') {
		super(message, MetadataErrorCode.URL_FORBIDDEN)
	}
}

/**
 * Excepción lanzada cuando la URL no pudo ser encontrada.
 *
 * @extends BaseException
 * @example
 * throw new UrlNotFoundException('La página solicitada no existe');
 */
export class UrlNotFoundException extends BaseException {
	/**
	 * @param message - Mensaje descriptivo del error.
	 */
	constructor(message: string = 'URL not found') {
		super(message, MetadataErrorCode.URL_NOT_FOUND)
	}
}

/**
 * Excepción lanzada cuando la conexión con la URL expira.
 *
 * @extends BaseException
 * @example
 * throw new UrlTimeoutException('El servidor remoto tardó demasiado en responder');
 */
export class UrlTimeoutException extends BaseException {
	/**
	 * @param message - Mensaje descriptivo del error.
	 */
	constructor(message: string = 'URL fetch timed out') {
		super(message, MetadataErrorCode.URL_TIMEOUT)
	}
}

/**
 * Excepción lanzada cuando ocurre un error genérico al intentar obtener datos de una URL.
 *
 * @extends BaseException
 * @example
 * throw new UrlFetchFailedException('Error inesperado al conectar con el servidor');
 */
export class UrlFetchFailedException extends BaseException {
	/**
	 * @param message - Mensaje descriptivo del error.
	 */
	constructor(message: string = 'Failed to fetch data from the URL') {
		super(message, MetadataErrorCode.URL_FETCH_FAILED)
	}
}
