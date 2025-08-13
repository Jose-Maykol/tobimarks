import { container } from 'tsyringe'

import { DATABASE_CONTEXT, UNIT_OF_WORK } from './tokens'
import { DatabaseContext, type IDatabaseContext } from '../database/database-context'
import { UnitOfWork, type IUnitOfWork } from '../database/unit-of-work'

export const registerCoreDependencies = () => {
	container.registerSingleton<IDatabaseContext>(DATABASE_CONTEXT, DatabaseContext)
	container.registerSingleton<IUnitOfWork>(UNIT_OF_WORK, UnitOfWork)
}
