/**
 * Metadatos para respuestas de API paginadas.
 * @property page - Número de página actual.
 * @property perPage - Número de elementos por página.
 * @property total - Número total de elementos.
 * @property totalPages - Número total de páginas.
 */
export interface PaginationMeta {
	page: number
	perPage: number
	total: number
	totalPages: number
}

/**
 * Opciones para solicitudes entrantes con paginación.
 * @property page - El número de página solicitado (indexado en 1).
 * @property limit - El número máximo de elementos por página.
 */
export interface PaginationOptions {
	page: number
	limit: number
}

/**
 * Resultado estructurado estándar para consultas paginadas.
 * @template T - Tipo de los elementos del array.
 * @property data - La colección de elementos para la página actual.
 * @property meta - Los metadatos de paginación.
 */
export interface PaginatedResult<T> {
	data: T[]
	meta: PaginationMeta
}
