import type { PaginationMeta } from './pagination.type'

/**
 * Estructura estándar para respuestas exitosas de la API.
 * @template T - Tipo de los datos de la respuesta.
 * @property success - Indica que la solicitud fue exitosa.
 * @property data - Los datos de la respuesta.
 * @property message - Mensaje opcional que describe la respuesta.
 * @property meta - Metadatos opcionales de paginación.
 */
export interface ApiSuccessResponse<T> {
	success: true
	data: T
	message?: string
	meta?: PaginationMeta
}

/**
 * Estructura estándar para respuestas de error de la API.
 * @property success - Indica que la solicitud no fue exitosa.
 * @property message - Mensaje de error legible para humanos.
 * @property errorCode - Código de error específico de la aplicación.
 */
export type ApiErrorResponse = {
	success: false
	message: string
	errorCode: string
}
