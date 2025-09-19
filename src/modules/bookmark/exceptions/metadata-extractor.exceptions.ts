import { BaseException } from '@/common/errors/base-erxception'

export enum MetadataErrorCode {
	URL_FORBIDDEN = 'URL_FORBIDDEN',
	URL_NOT_FOUND = 'URL_NOT_FOUND',
	URL_TIMEOUT = 'URL_TIMEOUT',
	URL_FETCH_FAILED = 'URL_FETCH_FAILED'
}

export class UrlForbiddenException extends BaseException {
	constructor(message: string = 'Access to the URL is forbidden') {
		super(message, MetadataErrorCode.URL_FORBIDDEN)
	}
}

export class UrlNotFoundException extends BaseException {
	constructor(message: string = 'URL not found') {
		super(message, MetadataErrorCode.URL_NOT_FOUND)
	}
}

export class UrlTimeoutException extends BaseException {
	constructor(message: string = 'URL fetch timed out') {
		super(message, MetadataErrorCode.URL_TIMEOUT)
	}
}

export class UrlFetchFailedException extends BaseException {
	constructor(message: string = 'Failed to fetch data from the URL') {
		super(message, MetadataErrorCode.URL_FETCH_FAILED)
	}
}
