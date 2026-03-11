import type { ApiSuccessResponse, ApiErrorResponse } from '../types/api.type'
import type { PaginationMeta } from '../types/pagination.type'

/**
 * ApiResponseBuilder proporciona métodos de fábrica para construir respuestas de API estandarizadas.
 * Use `success` para respuestas exitosas y `error` para respuestas de error.
 */
export const ApiResponseBuilder = {
	/**
	 * Construye una respuesta de API exitosa estandarizada.
	 *
	 * @template T Tipo de los datos de la respuesta.
	 * @param data Los datos de la respuesta.
	 * @param message Mensaje opcional que describe la respuesta.
	 * @param meta Metadatos opcionales de paginación.
	 * @returns ApiSuccessResponse<T> Objeto de respuesta de éxito de API estandarizado.
	 */
	success<T>(data: T, message?: string, meta?: PaginationMeta): ApiSuccessResponse<T> {
		const response: ApiSuccessResponse<T> = {
			success: true,
			data
		}

		if (message) response.message = message
		if (meta) response.meta = meta

		return response
	},

	/**
	 * Construye una respuesta de API de error estandarizada.
	 *
	 * @param message Mensaje de error legible para humanos.
	 * @param errorCode Código de error específico de la aplicación.
	 * @returns ApiErrorResponse Objeto de respuesta de error de API estandarizado.
	 */
	error(message: string, errorCode: string): ApiErrorResponse {
		return {
			success: false,
			message,
			errorCode
		}
	}
}
