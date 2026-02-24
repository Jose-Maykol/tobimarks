import { container } from 'tsyringe'

import { DATABASE_CONTEXT, EMBEDDING_SERVICE, LOGGER, UNIT_OF_WORK } from './tokens'
import { DatabaseContext, type IDatabaseContext } from '../database/database-context'
import { UnitOfWork, type IUnitOfWork } from '../database/unit-of-work'
import { EmbeddingService, type IEmbeddingService } from '../embedding/embedding.service'
import { Logger, type ILogger } from '../logger/logger'

export const registerCoreDependencies = () => {
	container.registerSingleton<ILogger>(LOGGER, Logger)
	container.registerSingleton<IDatabaseContext>(DATABASE_CONTEXT, DatabaseContext)
	container.register<IUnitOfWork>(UNIT_OF_WORK, { useClass: UnitOfWork })
	container.registerSingleton<IEmbeddingService>(EMBEDDING_SERVICE, EmbeddingService)
}
