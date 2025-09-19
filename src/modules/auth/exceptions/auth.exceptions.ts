import { BaseException } from '@/common/errors/base-erxception'

export enum AuthErrorCode {
	ACCESS_HEADER_MISSING = 'ACCESS_HEADER_MISSING',
	ACCESS_TOKEN_MISSING = 'ACCESS_TOKEN_MISSING',
	ACCESS_TOKEN_INVALID = 'ACCESS_TOKEN_INVALID',
	INVALID_GOOGLE_TOKEN_SIGNATURE = 'INVALID_GOOGLE_TOKEN_SIGNATURE',
	GOOGLE_ID_TOKEN_INVALID = 'GOOGLE_ID_TOKEN_INVALID',
	GOOGLE_EMAIL_MISSING = 'GOOGLE_EMAIL_MISSING',
	GOOGLE_NAME_MISSING = 'GOOGLE_NAME_MISSING'
}

export class AuthHeaderMissingException extends BaseException {
	constructor(message: string = 'Authentication header is missing') {
		super(message, AuthErrorCode.ACCESS_HEADER_MISSING)
	}
}

export class AccessTokenMissingException extends BaseException {
	constructor(message: string = 'Access token is missing') {
		super(message, AuthErrorCode.ACCESS_TOKEN_MISSING)
	}
}

export class AccessTokenInvalidException extends BaseException {
	constructor(message: string = 'Access token is invalid') {
		super(message, AuthErrorCode.ACCESS_TOKEN_INVALID)
	}
}

export class InvalidGoogleTokenSignatureException extends BaseException {
	constructor(message: string = 'Google token signature is invalid') {
		super(message, AuthErrorCode.INVALID_GOOGLE_TOKEN_SIGNATURE)
	}
}

export class GoogleAuthException extends BaseException {
	constructor(message: string = 'Google ID token is invalid') {
		super(message, AuthErrorCode.GOOGLE_ID_TOKEN_INVALID)
	}
}

export class GoogleEmailMissingException extends BaseException {
	constructor(message: string = 'Email not provided by Google') {
		super(message, AuthErrorCode.GOOGLE_EMAIL_MISSING)
	}
}

export class GoogleNameMissingException extends BaseException {
	constructor(message: string = 'Name not provided by Google') {
		super(message, AuthErrorCode.GOOGLE_NAME_MISSING)
	}
}
