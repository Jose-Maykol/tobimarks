import { Pool, type PoolClient } from 'pg'
import { injectable, singleton } from 'tsyringe'

import { databaseConfig } from '../config/database.config'
import type { DatabaseResponse } from '../types/database.type'

export interface IDatabaseContext {
	query<T>(text: string, params?: unknown[]): Promise<DatabaseResponse<T>>
	getClient(): Promise<PoolClient>
	closePool(): Promise<void>
}

@singleton()
@injectable()
export class DatabaseContext implements IDatabaseContext {
	private pool: Pool

	constructor() {
		this.pool = new Pool(databaseConfig)

		this.pool.on('error', (err) => {
			console.error('Unexpected error on client', err)
		})
	}

	async query<T>(text: string, params?: unknown[]): Promise<DatabaseResponse<T>> {
		const client = await this.pool.connect()
		try {
			const res = await client.query(text, params)
			return {
				rows: res.rows as T[],
				rowCount: res.rowCount ?? 0
			}
		} finally {
			client.release()
		}
	}

	async getClient(): Promise<PoolClient> {
		return await this.pool.connect()
	}

	async closePool(): Promise<void> {
		await this.pool.end()
	}
}
