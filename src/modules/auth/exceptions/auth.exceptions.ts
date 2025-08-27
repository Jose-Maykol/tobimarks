import { BaseException } from '@/common/errors/base-erxception'
import { AuthErrorCode } from '@/modules/auth/exceptions/auth-error-codes.enum'

export class AuthHeaderMissingException extends BaseException {
	constructor(message: string = 'Falta el encabezado de autenticación') {
		super(message, AuthErrorCode.ACCESS_HEADER_MISSING)
	}
}

export class AccessTokenMissingException extends BaseException {
	constructor(message: string = 'Falta el token de acceso') {
		super(message, AuthErrorCode.ACCESS_TOKEN_MISSING)
	}
}

export class AccessTokenInvalidException extends BaseException {
	constructor(message: string = 'Token de acceso inválido') {
		super(message, AuthErrorCode.ACCESS_TOKEN_INVALID)
	}
}

export class InvalidGoogleTokenSignatureException extends BaseException {
	constructor(message: string = 'Firma del token de Google inválida') {
		super(message, AuthErrorCode.INVALID_GOOGLE_TOKEN_SIGNATURE)
	}
}

export class GoogleAuthException extends BaseException {
	constructor(message: string = 'Token ID de Google inválido') {
		super(message, AuthErrorCode.GOOGLE_ID_TOKEN_INVALID)
	}
}

export class GoogleEmailMissingException extends BaseException {
	constructor(message: string = 'Correo electrónico no proporcionado por Google') {
		super(message, AuthErrorCode.GOOGLE_EMAIL_MISSING)
	}
}

export class GoogleNameMissingException extends BaseException {
	constructor(message: string = 'Nombre no proporcionado por Google') {
		super(message, AuthErrorCode.GOOGLE_NAME_MISSING)
	}
}
