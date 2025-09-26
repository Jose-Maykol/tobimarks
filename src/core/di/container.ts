import { container } from 'tsyringe'

import { DATABASE_CONTEXT, EMBEDDING_SERVICE, UNIT_OF_WORK } from './tokens'
import { DatabaseContext, type IDatabaseContext } from '../database/database-context'
import { UnitOfWork, type IUnitOfWork } from '../database/unit-of-work'
import { EmbeddingService, type IEmbeddingService } from '../embedding/embedding.service'

export const registerCoreDependencies = () => {
	container.registerSingleton<IDatabaseContext>(DATABASE_CONTEXT, DatabaseContext)
	container.registerSingleton<IUnitOfWork>(UNIT_OF_WORK, UnitOfWork)
	container.registerSingleton<IEmbeddingService>(EMBEDDING_SERVICE, EmbeddingService)
}
