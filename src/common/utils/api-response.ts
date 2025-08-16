import type { ApiSuccessResponse, ApiErrorResponse } from '../types/api.type'
import type { PaginationMeta } from '../types/pagination.type'

/**
 * ApiResponseBuilder provides factory methods to build standardized API responses.
 * Use `success` for successful responses and `error` for error responses.
 */
export const ApiResponseBuilder = {
	/**
	 * Build a standardized successful API response.
	 *
	 * @template T Type of the response data.
	 * @param data The response data.
	 * @param message Optional message describing the response.
	 * @param meta Optional pagination metadata.
	 * @returns ApiSuccessResponse<T> Standardized API success response object.
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
	 * Build a standardized error API response.
	 *
	 * @param message Human-readable error message.
	 * @param errorCode Application-specific error code.
	 * @returns ApiErrorResponse Standardized API error response object.
	 */
	error(message: string, errorCode: string): ApiErrorResponse {
		return {
			success: false,
			message,
			errorCode
		}
	}
}
