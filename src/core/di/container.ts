import { container } from 'tsyringe'

import { TOKENS } from './tokens'
import { Database, type IDatabase } from '../database/database'
import { UnitOfWork, type IUnitOfWork } from '../database/unit-of-work'

export const registerCoreDependencies = () => {
	container.registerSingleton<IDatabase>(TOKENS.DATABASE, Database)
	container.registerSingleton<IUnitOfWork>(TOKENS.UNIT_OF_WORK, UnitOfWork)
}
