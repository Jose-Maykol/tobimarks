import { container } from 'tsyringe'

import { COLLECTION_CONTROLLER, COLLECTION_REPOSITORY, COLLECTION_SERVICE } from './token'
import { CollectionController } from '../controllers/collection.controller'
import { CollectionRepository } from '../repositories/collection.repository'
import { CollectionService } from '../services/collection.service'

export const registerCollectionDependencies = () => {
	container.registerSingleton(COLLECTION_REPOSITORY, CollectionRepository)
	container.registerSingleton(COLLECTION_SERVICE, CollectionService)
	container.registerSingleton(COLLECTION_CONTROLLER, CollectionController)
}
