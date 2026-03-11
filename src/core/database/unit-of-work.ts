import type { PoolClient } from 'pg'
import { inject, injectable } from 'tsyringe'

import { type IDatabaseContext } from './database-context'
import { DATABASE_CONTEXT } from '../di/tokens'
import type { DatabaseResponse, IQueryRunner } from '../types/database.type'

/**
 * Interfaz que define el patrón Unit of Work para manejar transacciones.
 * Permite agrupar múltiples operaciones de base de datos en una sola unidad lógica.
 */
export interface IUnitOfWork extends IQueryRunner {
	/** Inicia una nueva transacción */
	begin(): Promise<void>
	/** Confirma los cambios realizados en la transacción actual */
	commit(): Promise<void>
	/** Deshace los cambios realizados en la transacción actual */
	rollback(): Promise<void>
	/** Libera los recursos utilizados por el cliente de base de datos */
	dispose(): Promise<void>
}

/**
 * Implementación del patrón Unit of Work.
 * Gestiona el ciclo de vida de una conexión y su estado transaccional.
 */
@injectable()
export class UnitOfWork implements IUnitOfWork {
	private client: PoolClient | null = null
	private _transactionStarted: boolean = false
	private _disposed: boolean = false

	constructor(@inject(DATABASE_CONTEXT) private dbContext: IDatabaseContext) {}

	/**
	 * Asegura que exista un cliente activo del pool antes de realizar una operación.
	 * @private
	 */
	private async ensureClient(): Promise<void> {
		if (!this.client && !this._disposed) {
			this.client = await this.dbContext.getClient()
		}
	}

	/**
	 * Inicia una transacción SQL (BEGIN).
	 */
	async begin(): Promise<void> {
		await this.ensureClient()
		if (this.client && !this._transactionStarted) {
			await this.client.query('BEGIN')
			this._transactionStarted = true
		}
	}

	/**
	 * Finaliza y confirma la transacción actual (COMMIT).
	 * Libera automáticamente el cliente después de confirmar.
	 */
	async commit(): Promise<void> {
		if (this.client && this._transactionStarted) {
			await this.client.query('COMMIT')
			this._transactionStarted = false
			await this.dispose()
		}
	}

	/**
	 * Cancela y deshace la transacción actual (ROLLBACK).
	 * Libera automáticamente el cliente después de revertir.
	 */
	async rollback(): Promise<void> {
		if (this.client && this._transactionStarted) {
			await this.client.query('ROLLBACK')
			this._transactionStarted = false
			await this.dispose()
		}
	}

	/**
	 * Ejecuta una consulta SQL dentro del contexto del Unit of Work.
	 *
	 * @param text - Cadena SQL a ejecutar.
	 * @param params - Parámetros de la consulta.
	 * @returns El resultado de la consulta.
	 */
	async query<T>(text: string, params?: unknown[]): Promise<DatabaseResponse<T>> {
		await this.ensureClient()
		const result = await this.client!.query(text, params)
		return result as unknown as DatabaseResponse<T>
	}

	/**
	 * Libera el cliente de base de datos de vuelta al pool.
	 * Si hay una transacción activa, realiza un rollback de seguridad.
	 */
	async dispose(): Promise<void> {
		if (this._disposed) return

		if (this._transactionStarted) {
			await this.rollback()
		}

		if (this.client) {
			this.client.release()
			this.client = null
		}

		this._disposed = true
	}
}
