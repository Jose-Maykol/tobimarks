import type { PaginationMeta } from './pagination.type'

/**
 * Standard structure for successful API responses.
 * @template T - Type of the response data.
 * @property success - Indicates the request was successful.
 * @property data - The response data.
 * @property message - Optional message describing the response.
 * @property meta - Optional pagination metadata.
 */
export interface ApiSuccessResponse<T> {
	success: true
	data: T
	message?: string
	meta?: PaginationMeta
}

/**
 * Standard structure for error API responses.
 * @property success - Indicates the request was not successful.
 * @property message - Human-readable error message.
 * @property errorCode - Application-specific error code.
 */
export type ApiErrorResponse = {
	success: false
	message: string
	errorCode: string
}
