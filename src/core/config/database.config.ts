import type { PoolConfig } from 'pg'

import { env } from './env.config'

/**
 * Configuración para el pool de conexiones de PostgreSQL.
 * Utiliza variables de entorno para definir las credenciales y el comportamiento del pool.
 */
export const databaseConfig: PoolConfig = {
	host: env.DB_HOST,
	port: env.DB_PORT,
	database: env.DB_NAME,
	user: env.DB_USER,
	password: env.DB_PASSWORD,
	/** Número máximo de clientes en el pool */
	max: 20,
	/** Tiempo máximo que un cliente puede estar inactivo en el pool antes de cerrarse */
	idleTimeoutMillis: 30000,
	/** Tiempo de espera máximo para establecer una conexión */
	connectionTimeoutMillis: 2000
}
