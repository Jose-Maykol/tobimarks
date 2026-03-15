import { container } from 'tsyringe'

import {
	CACHE_SERVICE,
	DATABASE_CONTEXT,
	EMBEDDING_SERVICE,
	LOGGER,
	QUEUE_SERVICE,
	UNIT_OF_WORK
} from './tokens'
import { CacheService, type ICacheService } from '../cache/cache.service'
import { DatabaseContext, type IDatabaseContext } from '../database/database-context'
import { UnitOfWork, type IUnitOfWork } from '../database/unit-of-work'
import { EmbeddingService, type IEmbeddingService } from '../embedding/embedding.service'
import { Logger, type ILogger } from '../logger/logger'
import { QueueService, type IQueueService } from '../queue/queue.service'

export const registerCoreDependencies = () => {
	container.registerSingleton<ILogger>(LOGGER, Logger)
	container.registerSingleton<IDatabaseContext>(DATABASE_CONTEXT, DatabaseContext)
	container.register<IUnitOfWork>(UNIT_OF_WORK, { useClass: UnitOfWork })
	container.registerSingleton<IEmbeddingService>(EMBEDDING_SERVICE, EmbeddingService)
	container.registerSingleton<ICacheService>(CACHE_SERVICE, CacheService)
	container.registerSingleton<IQueueService>(QUEUE_SERVICE, QueueService)
}
