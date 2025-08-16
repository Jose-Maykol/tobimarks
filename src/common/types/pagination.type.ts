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
