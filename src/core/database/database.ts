import { Pool } from 'pg'

import { env } from '../config/env'
import type { DatabaseConnection, Transaction } from '../types/database.type'

export class DatabasePool {
	private static instance: DatabasePool
	private pool: Pool

	private constructor() {
		this.pool = new Pool({
			host: env.DB_HOST,
			port: env.DB_PORT,
			database: env.DB_NAME,
			user: env.DB_USER,
			password: env.DB_PASSWORD,
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000
		})
	}

	public static getInstance(): DatabasePool {
		if (!DatabasePool.instance) {
			DatabasePool.instance = new DatabasePool()
		}
		return DatabasePool.instance
	}

	public async getConnection(): Promise<DatabaseConnection> {
		const client = await this.pool.connect()
		return {
			query: client.query.bind(client),
			release: client.release.bind(client)
		}
	}

	public async beginTransaction(): Promise<Transaction> {
		const client = await this.pool.connect()
		await client.query('BEGIN')

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
			release: client.release.bind(client)
		}
	}
}
