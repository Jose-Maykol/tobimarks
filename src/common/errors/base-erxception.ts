/**
 * Clase base para todas las excepciones personalizadas de la aplicación.
 * Proporciona una estructura estandarizada que incluye un mensaje y un código de error único.
 */
export class BaseException extends Error {
	/** Código identificador del error (ej. 'AUTH_INVALID_TOKEN') */
	public readonly code: string

	/**
	 * Crea una nueva instancia de BaseException.
	 *
	 * @param message - Mensaje descriptivo del error para humanos.
	 * @param code - Código técnico único que identifica el tipo de error.
	 */
	constructor(message: string, code: string) {
		super(message)
		this.code = code
		this.name = this.constructor.name
		Object.setPrototypeOf(this, new.target.prototype)
	}
}
