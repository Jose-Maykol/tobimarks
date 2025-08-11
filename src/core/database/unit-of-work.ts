import { inject } from 'tsyringe'

import { type IDatabase } from './database'
import { TOKENS } from '../di/tokens'
import type { Transaction } from '../types/database.type'

export interface IUnitOfWork {
	// users: IUserRepository;
	begin(): Promise<void>
	commit(): Promise<void>
	rollback(): Promise<void>
}

export class UnitOfWork implements IUnitOfWork {
	private transaction: Transaction | null = null
	private isTransactionActive = false
	// public readonly users: IUserRepository;

	constructor(
		@inject(TOKENS.DATABASE) private readonly database: IDatabase
		/* @inject('IUserRepository') public readonly users: IUserRepository,
    @inject('IOrderRepository') public readonly orders: IOrderRepository */
	) {}

	async begin(): Promise<void> {
		if (this.isTransactionActive) {
			throw new Error('Transaction already started')
		}

		this.transaction = await this.database.beginTransaction()
		this.isTransactionActive = true

		// Configurar la transacción en todos los repositorios
		/* this.users.setTransaction(this.transaction) */
	}

	async commit(): Promise<void> {
		if (!this.isTransactionActive || !this.transaction) {
			throw new Error('No active transaction to commit')
		}

		try {
			await this.transaction.commit()
		} finally {
			this.cleanup()
		}
	}

	async rollback(): Promise<void> {
		if (!this.isTransactionActive || !this.transaction) {
			throw new Error('No active transaction to rollback')
		}

		try {
			await this.transaction.rollback()
		} finally {
			this.cleanup()
		}
	}

	private cleanup(): void {
		this.transaction = null
		this.isTransactionActive = false

		/* this.users.setTransaction(null as any) */
	}
}
