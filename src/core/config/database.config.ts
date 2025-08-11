import type { PoolConfig } from 'pg'

import { env } from './env.config'

export const databaseConfig: PoolConfig = {
	host: env.DB_HOST,
	port: env.DB_PORT,
	database: env.DB_NAME,
	user: env.DB_USER,
	password: env.DB_PASSWORD,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
}
