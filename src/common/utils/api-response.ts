import type { ApiResponse } from '../types/api.type'
import type { PaginationMeta } from '../types/pagination.type'

/**
 * Generate a standardized successful API response.
 * @template T - Type of the response data.
 * @param data - The response data.
 * @param message - Optional message describing the response.
 * @param meta - Optional pagination metadata.
 * @returns ApiResponse<T> - Standardized API response object.
 */
export const apiResponse = <T>(
	data: T,
	message?: string,
	meta?: PaginationMeta
): ApiResponse<T> => {
	const response: ApiResponse<T> = {
		success: true,
		data
	}

	if (message) response.message = message
	if (meta) response.meta = meta

	return response
}
