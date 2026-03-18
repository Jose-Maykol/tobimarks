import { BaseException } from '@/common/errors/base-erxception'

export enum AuthErrorCode {
	ACCESS_HEADER_MISSING = 'ACCESS_HEADER_MISSING',
	ACCESS_TOKEN_MISSING = 'ACCESS_TOKEN_MISSING',
	ACCESS_TOKEN_INVALID = 'ACCESS_TOKEN_INVALID',
	REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
	TOKEN_EXPIRED = 'TOKEN_EXPIRED',
	INVALID_GOOGLE_TOKEN_SIGNATURE = 'INVALID_GOOGLE_TOKEN_SIGNATURE',
	GOOGLE_ID_TOKEN_INVALID = 'GOOGLE_ID_TOKEN_INVALID',
	GOOGLE_EMAIL_MISSING = 'GOOGLE_EMAIL_MISSING',
	GOOGLE_NAME_MISSING = 'GOOGLE_NAME_MISSING',
	EMAIL_NOT_WHITELISTED = 'EMAIL_NOT_WHITELISTED'
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

export class InvalidRefreshTokenException extends BaseException {
	constructor(message: string = 'Refresh token is invalid or inactive') {
		super(message, AuthErrorCode.REFRESH_TOKEN_INVALID)
	}
}

export class TokenExpiredException extends BaseException {
	constructor(message: string = 'The token has expired') {
		super(message, AuthErrorCode.TOKEN_EXPIRED)
	}
}

export class EmailNotWhitelistedException extends BaseException {
	constructor(message: string = 'Email is not authorized to access this application') {
		super(message, AuthErrorCode.EMAIL_NOT_WHITELISTED)
	}
}
