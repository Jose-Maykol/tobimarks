import { Pool } from 'pg'
import { injectable, singleton } from 'tsyringe'

import { databaseConfig } from '../config/database.config'
import type { DatabaseConnection, Transaction } from '../types/database.type'

export interface IDatabase {
	getConnection(): Promise<DatabaseConnection>
	beginTransaction(): Promise<Transaction>
	close(): Promise<void>
}

@singleton()
@injectable()
export class Database implements IDatabase {
	private pool: Pool

	constructor() {
		this.pool = new Pool(databaseConfig)

		this.pool.on('error', (err) => {
			console.error('Unexpected error on idle client', err)
		})
	}

	async getConnection(): Promise<DatabaseConnection> {
		const client = await this.pool.connect()
		return {
			query: client.query.bind(client),
			release: () => client.release()
		}
	}

	async beginTransaction(): Promise<Transaction> {
		const client = await this.pool.connect()

		try {
			await client.query('BEGIN')
		} catch (error) {
			client.release()
			throw error
		}

		return {
			query: client.query.bind(client),
			commit: async () => {
				try {
					await client.query('COMMIT')
				} finally {
					client.release()
				}
			},
			rollback: async () => {
				try {
					await client.query('ROLLBACK')
				} finally {
					client.release()
				}
			},
			release: () => client.release()
		}
	}

	async close(): Promise<void> {
		await this.pool.end()
	}
}
