import { Pool, type PoolClient } from 'pg'
import { inject, injectable, singleton } from 'tsyringe'

import { databaseConfig } from '../config/database.config'
import { LOGGER } from '../di/tokens'
import type { ILogger } from '../logger/logger'
import type { DatabaseResponse, IQueryRunner } from '../types/database.type'

/**
 * Interfaz que define el contrato para el contexto de la base de datos.
 * Extiende IQueryRunner para proporcionar capacidades de ejecución de consultas.
 */
export interface IDatabaseContext extends IQueryRunner {
	/**
	 * Ejecuta una consulta SQL en la base de datos.
	 * @param text - La cadena de consulta SQL a ejecutar.
	 * @param params - Parámetros opcionales para la consulta.
	 * @returns Una promesa que se resuelve con el resultado de la consulta.
	 */
	query<T>(text: string, params?: unknown[]): Promise<DatabaseResponse<T>>

	/**
	 * Obtiene un cliente individual del pool de conexiones.
	 * @returns Una promesa que se resuelve con una instancia de PoolClient.
	 */
	getClient(): Promise<PoolClient>

	/**
	 * Cierra el pool de conexiones de la base de datos.
	 */
	closePool(): Promise<void>
}

/**
 * Implementación del contexto de la base de datos utilizando pg (node-postgres).
 * Administra el pool de conexiones y proporciona métodos para interactuar con la base de datos.
 */
@singleton()
@injectable()
export class DatabaseContext implements IDatabaseContext {
	private pool: Pool

	constructor(@inject(LOGGER) private readonly logger: ILogger) {
		this.pool = new Pool(databaseConfig)

		this.pool.on('error', (err) => {
			this.logger.error('Error inesperado en cliente inactivo (idle)', {
				message: err.message,
				stack: err.stack
			})
		})
	}

	/**
	 * Ejecuta una consulta SQL utilizando un cliente del pool.
	 * Garantiza que el cliente sea liberado de vuelta al pool tras la ejecución.
	 *
	 * @param text - La cadena de consulta SQL a ejecutar.
	 * @param params - Parámetros opcionales para la consulta.
	 * @returns El resultado de la consulta incluyendo las filas y el conteo.
	 */
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

	/**
	 * Adquiere un cliente del pool para operaciones manuales o transacciones.
	 * El llamador es responsable de liberar el cliente.
	 *
	 * @returns Instancia de PoolClient.
	 */
	async getClient(): Promise<PoolClient> {
		return await this.pool.connect()
	}

	/**
	 * Finaliza todas las conexiones activas y cierra el pool.
	 */
	async closePool(): Promise<void> {
		await this.pool.end()
	}
}
