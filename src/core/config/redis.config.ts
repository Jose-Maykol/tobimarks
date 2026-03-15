import type { RedisOptions } from 'ioredis'

import { env } from './env.config'

/**
 * Configuración de Redis para el servicio de caché.
 * Usa DB 0 y prefijo de claves para aislar las claves de la aplicación.
 */
export const redisCacheConfig: RedisOptions = {
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
	password: env.REDIS_PASSWORD || undefined,
	db: env.REDIS_DB,
	maxRetriesPerRequest: 3,
	keyPrefix: 'tobimarks:',
	retryStrategy(times: number) {
		const MAX_RETRY_DELAY_MS = 3000
		return Math.min(times * 200, MAX_RETRY_DELAY_MS)
	}
}
