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

/**
 * Excepción lanzada cuando falta la cabecera 'Authorization'.
 *
 * @extends BaseException
 * @example
 * throw new AuthHeaderMissingException('Debes proporcionar una cabecera de autorización');
 */
export class AuthHeaderMissingException extends BaseException {
	/** @param message - Mensaje descriptivo del error. */
	constructor(message: string = 'Authentication header is missing') {
		super(message, AuthErrorCode.ACCESS_HEADER_MISSING)
	}
}

/**
 * Excepción lanzada cuando la cabecera existe pero no contiene el token.
 *
 * @extends BaseException
 */
export class AccessTokenMissingException extends BaseException {
	/** @param message - Mensaje descriptivo del error. */
	constructor(message: string = 'Access token is missing') {
		super(message, AuthErrorCode.ACCESS_TOKEN_MISSING)
	}
}

/**
 * Excepción lanzada cuando el token de acceso es malformado o inválido.
 *
 * @extends BaseException
 */
export class AccessTokenInvalidException extends BaseException {
	/** @param message - Mensaje descriptivo del error. */
	constructor(message: string = 'Access token is invalid') {
		super(message, AuthErrorCode.ACCESS_TOKEN_INVALID)
	}
}

/**
 * Excepción lanzada cuando falla la validación de la firma de Google.
 *
 * @extends BaseException
 */
export class InvalidGoogleTokenSignatureException extends BaseException {
	/** @param message - Mensaje descriptivo del error. */
	constructor(message: string = 'Google token signature is invalid') {
		super(message, AuthErrorCode.INVALID_GOOGLE_TOKEN_SIGNATURE)
	}
}

/**
 * Excepción general para errores de autenticación con Google.
 *
 * @extends BaseException
 */
export class GoogleAuthException extends BaseException {
	/** @param message - Mensaje descriptivo del error. */
	constructor(message: string = 'Google ID token is invalid') {
		super(message, AuthErrorCode.GOOGLE_ID_TOKEN_INVALID)
	}
}

/**
 * Excepción lanzada cuando el token de Google no contiene un email.
 *
 * @extends BaseException
 */
export class GoogleEmailMissingException extends BaseException {
	/** @param message - Mensaje descriptivo del error. */
	constructor(message: string = 'Email not provided by Google') {
		super(message, AuthErrorCode.GOOGLE_EMAIL_MISSING)
	}
}

/**
 * Excepción lanzada cuando el token de Google no contiene el nombre del usuario.
 *
 * @extends BaseException
 */
export class GoogleNameMissingException extends BaseException {
	/** @param message - Mensaje descriptivo del error. */
	constructor(message: string = 'Name not provided by Google') {
		super(message, AuthErrorCode.GOOGLE_NAME_MISSING)
	}
}

/**
 * Excepción lanzada cuando un refresh token es inválido o ya ha sido usado.
 *
 * @extends BaseException
 */
export class InvalidRefreshTokenException extends BaseException {
	/** @param message - Mensaje descriptivo del error. */
	constructor(message: string = 'Refresh token is invalid or inactive') {
		super(message, AuthErrorCode.REFRESH_TOKEN_INVALID)
	}
}

/**
 * Excepción lanzada cuando el token ha superado su tiempo de vida.
 *
 * @extends BaseException
 * @example
 * throw new TokenExpiredException('Tu sesión ha expirado, por favor ingresa de nuevo');
 */
export class TokenExpiredException extends BaseException {
	/** @param message - Mensaje descriptivo del error. */
	constructor(message: string = 'The token has expired') {
		super(message, AuthErrorCode.TOKEN_EXPIRED)
	}
}

/**
 * Excepción lanzada cuando el usuario intenta acceder con un email no autorizado.
 *
 * @extends BaseException
 * @example
 * throw new EmailNotWhitelistedException('Este sistema es privado. Contacta al administrador');
 */
export class EmailNotWhitelistedException extends BaseException {
	/** @param message - Mensaje descriptivo del error. */
	constructor(message: string = 'Email is not authorized to access this application') {
		super(message, AuthErrorCode.EMAIL_NOT_WHITELISTED)
	}
}
