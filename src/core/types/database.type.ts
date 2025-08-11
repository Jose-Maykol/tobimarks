export interface DatabaseConnection {
	query<T>(text: string, params?: unknown[]): Promise<{ rows: T[]; rowCount: number }>
	release(): void
}

export interface Transaction extends DatabaseConnection {
	commit(): Promise<void>
	rollback(): Promise<void>
}
