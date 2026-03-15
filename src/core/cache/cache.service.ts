import Redis from 'ioredis'
import { inject, injectable, singleton } from 'tsyringe'

import { redisCacheConfig } from '../config/redis.config'
import { LOGGER } from '../di/tokens'
import type { ILogger } from '../logger/logger'

/**
 * Interfaz para el servicio de cache.
 * Proporciona métodos genéricos para almacenar, recuperar e invalidar datos en cache.
 */
export interface ICacheService {
	/**
	 * Obtiene un valor del cache por su clave.
	 * @param key - La clave del valor a obtener.
	 * @returns El valor deserializado o null si no existe o ha expirado.
	 */
	get<T>(key: string): Promise<T | null>

	/**
	 * Almacena un valor en el cache con una clave y un tiempo de expiración.
	 * @param key - La clave del valor a almacenar.
	 * @param value - El valor a almacenar (será serializado a JSON).
	 * @param ttlSeconds - Tiempo de vida en segundos (por defecto: 300s / 5 minutos).
	 */
	set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>

	/**
	 * Elimina un valor del cache por su clave.
	 * @param key - La clave del valor a eliminar.
	 */
	delete(key: string): Promise<void>

	/**
	 * Elimina todas las claves que coincidan con un patrón.
	 * Útil para invalidar un grupo de claves relacionadas.
	 * @param pattern - El patrón glob para buscar claves (ej: "bookmarks:*").
	 */
	deleteByPattern(pattern: string): Promise<void>

	/**
	 * Verifica si una clave existe en el cache.
	 * @param key - La clave a verificar.
	 * @returns true si la clave existe, false en caso contrario.
	 */
	exists(key: string): Promise<boolean>

	/**
	 * Limpia todo el cache de la aplicación.
	 * Solo elimina las claves con el prefijo de la aplicación.
	 */
	flush(): Promise<void>

	/**
	 * Cierra la conexión con Redis.
	 */
	disconnect(): Promise<void>
}

/** TTL por defecto: 5 minutos */
const DEFAULT_TTL_SECONDS = 300

/**
 * Implementación del servicio de cache utilizando Redis (ioredis).
 * Administra la conexión a Redis y proporciona métodos para interactuar con el cache.
 */
@singleton()
@injectable()
export class CacheService implements ICacheService {
	private readonly client: Redis

	constructor(@inject(LOGGER) private readonly logger: ILogger) {
		this.client = new Redis(redisCacheConfig)

		this.client.on('connect', () => {
			this.logger.info('Redis connection established')
		})

		this.client.on('error', (err: Error) => {
			this.logger.error('Error in Redis connection', {
				message: err.message,
				stack: err.stack
			})
		})

		this.client.on('close', () => {
			this.logger.warn('Redis connection closed')
		})
	}

	/**
	 * Obtiene un valor del cache deserializándolo desde JSON.
	 * Retorna null si la clave no existe o si ocurre un error de parseo.
	 *
	 * @param key - La clave del valor a obtener.
	 * @returns El valor deserializado o null.
	 */
	async get<T>(key: string): Promise<T | null> {
		try {
			const data = await this.client.get(key)

			if (!data) return null

			return JSON.parse(data) as T
		} catch (error: unknown) {
			this.logger.error('Error getting value from cache', {
				key,
				error: error instanceof Error ? error.message : String(error)
			})
			return null
		}
	}

	/**
	 * Almacena un valor en el cache serializándolo a JSON.
	 * Usa el comando SET de Redis con expiración (EX).
	 *
	 * @param key - La clave del valor a almacenar.
	 * @param value - El valor a almacenar.
	 * @param ttlSeconds - Tiempo de vida en segundos.
	 */
	async set<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
		try {
			const serialized = JSON.stringify(value)
			await this.client.set(key, serialized, 'EX', ttlSeconds)
		} catch (error: unknown) {
			this.logger.error('Error storing value in cache', {
				key,
				error: error instanceof Error ? error.message : String(error)
			})
		}
	}

	/**
	 * Elimina un valor del cache por su clave.
	 *
	 * @param key - La clave del valor a eliminar.
	 */
	async delete(key: string): Promise<void> {
		try {
			await this.client.del(key)
		} catch (error: unknown) {
			this.logger.error('Error deleting value from cache', {
				key,
				error: error instanceof Error ? error.message : String(error)
			})
		}
	}

	/**
	 * Elimina todas las claves que coincidan con un patrón dado.
	 * Utiliza SCAN para iterar de forma segura sin bloquear Redis.
	 *
	 * @param pattern - El patrón glob para buscar claves.
	 */
	async deleteByPattern(pattern: string): Promise<void> {
		try {
			const stream = this.client.scanStream({
				match: pattern,
				count: 100
			})

			const pipeline = this.client.pipeline()
			let deletedCount = 0

			for await (const keys of stream) {
				const keyBatch = keys as string[]
				for (const key of keyBatch) {
					pipeline.del(key)
					deletedCount++
				}
			}

			if (deletedCount > 0) {
				await pipeline.exec()
				this.logger.debug('Keys deleted by pattern', {
					pattern,
					count: deletedCount
				})
			}
		} catch (error: unknown) {
			this.logger.error('Error deleting keys by pattern', {
				pattern,
				error: error instanceof Error ? error.message : String(error)
			})
		}
	}

	/**
	 * Verifica si una clave existe en Redis.
	 *
	 * @param key - La clave a verificar.
	 * @returns true si la clave existe, false en caso contrario.
	 */
	async exists(key: string): Promise<boolean> {
		try {
			const result = await this.client.exists(key)
			return result === 1
		} catch (error: unknown) {
			this.logger.error('Error checking key existence in cache', {
				key,
				error: error instanceof Error ? error.message : String(error)
			})
			return false
		}
	}

	/**
	 * Elimina todas las claves con el prefijo de la aplicación.
	 * Usa SCAN + DEL para no bloquear la instancia de Redis.
	 */
	async flush(): Promise<void> {
		try {
			await this.deleteByPattern('tobimarks:*')
			this.logger.info('Application cache flushed completely')
		} catch (error: unknown) {
			this.logger.error('Error clearing cache', {
				error: error instanceof Error ? error.message : String(error)
			})
		}
	}

	/**
	 * Cierra la conexión con Redis de forma ordenada.
	 */
	async disconnect(): Promise<void> {
		await this.client.quit()
		this.logger.info('Disconnected from Redis')
	}
}
