import type { PoolClient } from 'pg'
import { inject, injectable } from 'tsyringe'

import { type IDatabaseContext } from './database-context'
import { DATABASE_CONTEXT } from '../di/tokens'
import type { DatabaseResponse } from '../types/database.type'

export interface IUnitOfWork {
	// users: IUserRepository;
	begin(): Promise<void>
	commit(): Promise<void>
	rollback(): Promise<void>
}

@injectable()
export class UnitOfWork implements IUnitOfWork {
	public client: PoolClient | null = null
	private _transactionStarted: boolean = false
	private _disposed: boolean = false

	constructor(@inject(DATABASE_CONTEXT) private dbContext: IDatabaseContext) {}

	private async ensureClient(): Promise<void> {
		if (!this.client && !this._disposed) {
			this.client = await this.dbContext.getClient()
		}
	}

	async begin(): Promise<void> {
		await this.ensureClient()
		if (this.client && !this._transactionStarted) {
			await this.client.query('BEGIN')
			this._transactionStarted = true
		}
	}

	async commit(): Promise<void> {
		if (this.client && this._transactionStarted) {
			await this.client.query('COMMIT')
			this._transactionStarted = false
			await this.dispose()
		}
	}

	async rollback(): Promise<void> {
		if (this.client && this._transactionStarted) {
			await this.client.query('ROLLBACK')
			this._transactionStarted = false
			await this.dispose()
		}
	}

	async query<T>(text: string, params?: unknown[]): Promise<DatabaseResponse<T>> {
		await this.ensureClient()
		const result = await this.client!.query(text, params)
		return result as unknown as DatabaseResponse<T>
	}

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
