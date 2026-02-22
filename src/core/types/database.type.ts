export interface DatabaseResponse<T> {
	rows: T[]
	rowCount: number
}

export interface IQueryRunner {
	query<T>(text: string, params?: unknown[]): Promise<DatabaseResponse<T>>
}
