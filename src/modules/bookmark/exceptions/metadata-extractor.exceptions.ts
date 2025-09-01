import { MetadataErrorCode } from './metadata-extractor..errors'

import { BaseException } from '@/common/errors/base-erxception'

export class UrlForbiddenException extends BaseException {
	constructor(message: string = 'Acceso prohibido a la URL') {
		super(message, MetadataErrorCode.URL_FORBIDDEN)
	}
}

export class UrlNotFoundException extends BaseException {
	constructor(message: string = 'URL no encontrada') {
		super(message, MetadataErrorCode.URL_NOT_FOUND)
	}
}

export class UrlTimeoutException extends BaseException {
	constructor(message: string = 'Tiempo de espera agotado al obtener la URL') {
		super(message, MetadataErrorCode.URL_TIMEOUT)
	}
}

export class UrlFetchFailedException extends BaseException {
	constructor(message: string = 'Error al obtener datos de la URL') {
		super(message, MetadataErrorCode.URL_FETCH_FAILED)
	}
}
