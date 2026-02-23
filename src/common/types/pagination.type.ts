/**
 * Metadata for paginated API responses.
 * @property page - Current page number.
 * @property perPage - Number of items per page.
 * @property total - Total number of items.
 * @property totalPages - Total number of pages.
 */
export interface PaginationMeta {
	page: number
	perPage: number
	total: number
	totalPages: number
}

/**
 * Options for pagination incoming requests.
 * @property page - The requested page number (1-indexed).
 * @property limit - The maximum number of items per page.
 */
export interface PaginationOptions {
	page: number
	limit: number
}

/**
 * Standard structured result for paginated queries.
 * @template T - Type of the array elements.
 * @property data - The collection of items for the current page.
 * @property meta - The pagination metadata.
 */
export interface PaginatedResult<T> {
	data: T[]
	meta: PaginationMeta
}
