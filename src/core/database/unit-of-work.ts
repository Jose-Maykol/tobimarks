import { DatabasePool } from './database'
import type { Transaction } from '../types/database.type'

export interface IUnitOfWork {
	// users: IUserRepository;
	commit(): Promise<void>
	rollback(): Promise<void>
}

export class UnitOfWork implements IUnitOfWork {
	private transaction: Transaction
	// public readonly users: IUserRepository;

	constructor(transaction: Transaction) {
		this.transaction = transaction
		// this.users = new UserRepository(transaction);
	}

	async commit(): Promise<void> {
		await this.transaction.commit()
	}

	async rollback(): Promise<void> {
		await this.transaction.rollback()
	}

	static async begin(): Promise<UnitOfWork> {
		const db = DatabasePool.getInstance()
		const transaction = await db.beginTransaction()
		return new UnitOfWork(transaction)
	}
}
